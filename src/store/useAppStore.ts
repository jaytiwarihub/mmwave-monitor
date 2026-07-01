import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// A Device represents a Sensor ESP32 / room. It has no on/off state of
// its own — only the switches it relays to over ESP-NOW do. `id` here
// matches the deviceId segment used in every MQTT topic for that room:
//   room/{id}/mmwave
//   room/{id}/switch/{switchId}/cmd
//   room/{id}/switch/{switchId}/status
export interface Device {
  id: string;
  name: string;
  room: string;
  presenceDetected: boolean;
}

// A SwitchConfig represents one relay (light/fan) wired to a Switch ESP32
// behind a given Sensor ESP32. `isOn` is the CONFIRMED state — it only
// changes when a message arrives on the switch's /status topic (the
// ESP-NOW return path), never optimistically when a command is sent.
export interface SwitchConfig {
  id: string;
  deviceId: string;
  name: string; // e.g. "Light 1", "Fan 1"
  isOn: boolean;
  pending: boolean; // true between cmd publish and confirmed /status arriving
}

interface AppState {
  // Connection — driven entirely by useMQTT, never set from a form.
  isConnected: boolean;
  // True once a connection has succeeded THIS session. Not persisted —
  // resets to false on every cold start so onboarding always runs again.
  // Kept separate from isConnected so a brief reconnect later doesn't
  // bounce the user back to the splash mid-session.
  hasConnectedOnce: boolean;

  // Devices are pre-registered, not discovered. "Add Device" only moves
  // an entry from availableDevices into devices; it never fabricates one.
  devices: Device[];
  availableDevices: Device[];

  switches: SwitchConfig[];

  // Settings
  autoReconnect: boolean;
  presenceTimeout: number; // minutes, 1-10

  // Actions
  setConnected: (value: boolean) => void;
  setDevicePresence: (deviceId: string, presence: boolean) => void;
  activateDevice: (id: string) => void;
  deactivateDevice: (id: string) => void;
  setSwitchPending: (switchId: string, pending: boolean) => void;
  setSwitchConfirmed: (switchId: string, isOn: boolean) => void;
  setAutoReconnect: (value: boolean) => void;
  setPresenceTimeout: (value: number) => void;
  resetAll: () => void;
}

const initialDevices: Device[] = [
  { id: 'sensor1', name: 'Sensor 1', room: 'Kitchen', presenceDetected: false },
  { id: 'sensor2', name: 'Sensor 2', room: 'Living Room', presenceDetected: false },
];

const initialAvailableDevices: Device[] = [
  { id: 'sensor3', name: 'Sensor 3', room: 'Bedroom', presenceDetected: false },
  { id: 'sensor4', name: 'Sensor 4', room: 'Bathroom', presenceDetected: false },
];

const initialSwitches: SwitchConfig[] = [
  { id: 'sw1', deviceId: 'sensor1', name: 'Light 1', isOn: false, pending: false },
  { id: 'sw2', deviceId: 'sensor1', name: 'Fan 1', isOn: false, pending: false },

  { id: 'sw3', deviceId: 'sensor2', name: 'Light 1', isOn: false, pending: false },
  { id: 'sw4', deviceId: 'sensor2', name: 'Fan 1', isOn: false, pending: false },

  { id: 'sw5', deviceId: 'sensor3', name: 'Light 1', isOn: false, pending: false },
  { id: 'sw6', deviceId: 'sensor3', name: 'Fan 1', isOn: false, pending: false },

  { id: 'sw7', deviceId: 'sensor4', name: 'Light 1', isOn: false, pending: false },
  { id: 'sw8', deviceId: 'sensor4', name: 'Fan 1', isOn: false, pending: false },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isConnected: false,
      hasConnectedOnce: false,
      devices: initialDevices,
      availableDevices: initialAvailableDevices,
      switches: initialSwitches,
      autoReconnect: true,
      presenceTimeout: 5,

      setConnected: (value) =>
        set((state) => ({
          isConnected: value,
          hasConnectedOnce: state.hasConnectedOnce || value,
        })),

      setDevicePresence: (deviceId, presence) =>
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === deviceId ? { ...d, presenceDetected: presence } : d
          ),
        })),

      activateDevice: (id) =>
        set((state) => {
          const target = state.availableDevices.find((d) => d.id === id);
          if (!target) return state;
          return {
            devices: [...state.devices, target],
            availableDevices: state.availableDevices.filter((d) => d.id !== id),
          };
        }),

      // The ESP32 keeps publishing regardless of what the app does, so
      // this only removes the device from local view — it can be
      // reactivated later via "Add Device".
      deactivateDevice: (id) =>
        set((state) => {
          const target = state.devices.find((d) => d.id === id);
          if (!target) return state;
          return {
            devices: state.devices.filter((d) => d.id !== id),
            availableDevices: [...state.availableDevices, target],
          };
        }),

      setSwitchPending: (switchId, pending) =>
        set((state) => ({
          switches: state.switches.map((s) =>
            s.id === switchId ? { ...s, pending } : s
          ),
        })),

      setSwitchConfirmed: (switchId, isOn) =>
        set((state) => ({
          switches: state.switches.map((s) =>
            s.id === switchId ? { ...s, isOn, pending: false } : s
          ),
        })),

      setAutoReconnect: (value) => set({ autoReconnect: value }),

      setPresenceTimeout: (value) => set({ presenceTimeout: value }),

      resetAll: () =>
        set({
          isConnected: false,
          hasConnectedOnce: false,
          devices: initialDevices,
          availableDevices: initialAvailableDevices,
          switches: initialSwitches,
          autoReconnect: true,
          presenceTimeout: 5,
        }),
    }),
    {
      name: 'mmwave-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Connection state is never persisted — it must be re-established
      // fresh on every app launch.
      partialize: (state) => ({
        devices: state.devices,
        availableDevices: state.availableDevices,
        switches: state.switches,
        autoReconnect: state.autoReconnect,
        presenceTimeout: state.presenceTimeout,
      }),
    }
  )
);
