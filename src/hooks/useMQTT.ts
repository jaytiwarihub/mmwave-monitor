import { Client, Message } from 'paho-mqtt';
import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

// ── Bundled cloud broker config ──────────────────────────────────────
// These are the ONLY broker details that exist anywhere in the app.
// The user never sees or enters them — that's the whole point of
// moving off a local Mosquitto instance onto a fixed-hostname cloud
// broker (HiveMQ Cloud Serverless / EMQX Cloud Serverless).
//
// ⚠️ Put YOUR real values back in here — this file was regenerated to
// fix a bug, so it has placeholders again until you paste them in.
//
// Port 8884 is WebSocket-over-TLS (WSS) — the counterpart to the
// firmware's port 8883 (MQTT-over-TLS / TCP) used by the ESP32s.
const BROKER_HOST = 'db34bd42d5fe466381cec6c92d1016d8.s1.eu.hivemq.cloud'; // ← replace with your cluster URL
const BROKER_PORT = 8884;
const BROKER_PATH = '/mqtt';
const BROKER_USERNAME = 'jaytiwari'; // ← replace
const BROKER_PASSWORD = 'Jaytiwari@2003'; // ← replace

const PRESENCE_TOPIC_RE = /^room\/([^/]+)\/mmwave$/;
const STATUS_TOPIC_RE = /^room\/([^/]+)\/switch\/([^/]+)\/status$/;

const RECONNECT_DELAY_MS = 3000;
const PENDING_TIMEOUT_MS = 5000; // ESP-NOW isn't 100% reliable — stop
// showing "pending" if no confirmation
// ever arrives, rather than spinning forever.

// ── Module-level singleton ───────────────────────────────────────────
// IMPORTANT: this state lives OUTSIDE the hook function on purpose.
// useMQTT() is called from multiple components (onboarding.tsx AND
// switches/[deviceId].tsx). If the client lived in a useRef INSIDE the
// hook, each component would get its OWN independent, disconnected
// client — which is exactly what broke switch toggling: the screen
// calling publishSwitchCommand() was checking a client that was never
// the one onboarding.tsx actually connected. Keeping it at module
// scope means every component sharing this hook talks to the same
// single real connection.
let client: Client | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function handleMessage(message: Message) {
  const topic = message.destinationName;
  const raw = message.payloadString;

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = {};
  }

  const presenceMatch = topic.match(PRESENCE_TOPIC_RE);
  if (presenceMatch) {
    const deviceId = presenceMatch[1];
    const presence = payload.presence === true || payload.presence === 1 || payload.presence === '1';
    useAppStore.getState().setDevicePresence(deviceId, presence);
    return;
  }

  const statusMatch = topic.match(STATUS_TOPIC_RE);
  if (statusMatch) {
    const switchId = statusMatch[2];
    const isOn = payload.on === true || payload.state === 'on';
    useAppStore.getState().setSwitchConfirmed(switchId, isOn);
  }
}

function scheduleReconnect() {
  const { autoReconnect } = useAppStore.getState();
  if (autoReconnect && !reconnectTimer) {
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      doConnect();
    }, RECONNECT_DELAY_MS);
  }
}

function doConnect() {
  const clientId = 'app_' + Math.random().toString(16).slice(2, 10);
  const c = new Client(BROKER_HOST, BROKER_PORT, BROKER_PATH, clientId);
  client = c;

  c.onMessageArrived = handleMessage;

  c.onConnectionLost = () => {
    useAppStore.getState().setConnected(false);
    scheduleReconnect();
  };

  c.connect({
    useSSL: true,
    userName: BROKER_USERNAME,
    password: BROKER_PASSWORD,
    onSuccess: () => {
      useAppStore.getState().setConnected(true);
      c.subscribe('room/+/mmwave');
      c.subscribe('room/+/switch/+/status');
    },
    onFailure: () => {
      useAppStore.getState().setConnected(false);
      scheduleReconnect();
    },
  });
}

function doDisconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (client?.isConnected()) {
    client.disconnect();
  }
  useAppStore.getState().setConnected(false);
}

// Publishes {"cmd":"on"|"off"} to room/{deviceId}/switch/{switchId}/cmd.
// The toggle does NOT flip to the new state here — it goes "pending"
// and only shows the new state once the Switch ESP32's confirmation
// comes back over the ESP-NOW return path and arrives as a /status
// message, handled in handleMessage above.
function doPublishSwitchCommand(deviceId: string, switchId: string, on: boolean) {
  if (!client?.isConnected()) return;

  useAppStore.getState().setSwitchPending(switchId, true);

  const message = new Message(JSON.stringify({ cmd: on ? 'on' : 'off' }));
  message.destinationName = `room/${deviceId}/switch/${switchId}/cmd`;
  client.send(message);

  setTimeout(() => {
    const current = useAppStore.getState().switches.find((s) => s.id === switchId);
    if (current?.pending) {
      useAppStore.getState().setSwitchPending(switchId, false);
    }
  }, PENDING_TIMEOUT_MS);
}

export function useMQTT() {
  const connect = useCallback(() => doConnect(), []);
  const disconnect = useCallback(() => doDisconnect(), []);
  const publishSwitchCommand = useCallback(
    (deviceId: string, switchId: string, on: boolean) => doPublishSwitchCommand(deviceId, switchId, on),
    []
  );

  return { connect, disconnect, publishSwitchCommand };
}
