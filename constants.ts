import { Room } from "./types";

export const THEME = {
  colors: {
    primary: '#10B981', // Emerald 500
    secondary: '#059669', // Emerald 600
    backgroundStart: '#f3f4f6', // Light Gray
    backgroundEnd: '#ffffff', // White
    accent: '#34D399', // Emerald 300
    alert: '#F59E0B', // Amber
    danger: '#EF4444', // Red
    success: '#10B981', // Emerald
    cardBg: 'rgba(255, 255, 255, 0.6)', // White Glass
    cardBorder: 'rgba(255, 255, 255, 0.8)', // White Border
    text: '#1f2937' // Gray 800
  }
};

export const INITIAL_ROOMS: Room[] = [
  { id: 'r1', name: 'Living Room', icon: 'Sofa' },
  { id: 'r2', name: 'Kitchen', icon: 'Utensils' },
  { id: 'r3', name: 'Bedroom', icon: 'Bed' },
  { id: 'r4', name: 'Utility', icon: 'Droplets' },
];

export const MOCK_ESP_PREFIX = "192.168.1.";