export enum DeviceType {
  LIGHT = 'LIGHT',
  FAN = 'FAN',
  MOTOR = 'MOTOR'
}

export enum AppMode {
  MANUAL = 'MANUAL',
  REMOTE = 'REMOTE'
}

export interface Device {
  id: string;
  roomId: string;
  type: DeviceType;
  name: string;
  isOn: boolean;
  value: number; // Brightness (0-100) or Fan Speed (1-5)
  isFaulty: boolean;
  ipAddress?: string; // Simulated IP for ESP settings
  gpioPin: number; // Hardware pin number
}

export interface Room {
  id: string;
  name: string;
  icon: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'alert' | 'error' | 'success';
}

export interface WaterTankState {
  level: number; // 0-100
  mode: 'MANUAL' | 'AUTO';
  isMotorOn: boolean;
}

export type SoundType = 'BEEP' | 'ALARM' | 'CHIME';

export interface SettingsState {
  wifiSSID: string;
  wifiPass: string;
  controlMode: AppMode;
  pumpLowThreshold: number;
  pumpHighThreshold: number;
  soundEnabled: boolean;
  alertSound: SoundType;
  homeName: string;
  theme: 'LIGHT' | 'DARK';
}