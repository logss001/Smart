import React, { useState, useEffect } from 'react';
import { Settings, Plus, X, Bell } from 'lucide-react';
import { 
  Device, Room, LogEntry, WaterTankState, SettingsState, AppMode, DeviceType, SoundType 
} from './types';
import { INITIAL_ROOMS } from './constants';
import RoomTabs from './components/RoomTabs';
import DeviceCard from './components/DeviceCard';
import WaterLevel from './components/WaterLevel';
import LogPanel from './components/LogPanel';
import SettingsModal from './components/SettingsModal';
import ConfirmationModal from './components/ConfirmationModal';

// --- Sound Synthesizer (Web Audio API) ---
const playSystemSound = (type: SoundType) => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'BEEP') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'CHIME') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'ALARM') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1000, now);
            osc.frequency.linearRampToValueAtTime(500, now + 0.2);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            setTimeout(() => {
                 const osc2 = ctx.createOscillator();
                 const gain2 = ctx.createGain();
                 osc2.connect(gain2);
                 gain2.connect(ctx.destination);
                 osc2.type = 'sawtooth';
                 osc2.frequency.setValueAtTime(1000, ctx.currentTime);
                 osc2.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.2);
                 gain2.gain.setValueAtTime(0.5, ctx.currentTime);
                 gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
                 osc2.start(ctx.currentTime);
                 osc2.stop(ctx.currentTime + 0.2);
            }, 250);
        }

    } catch (e) {
        console.error("Audio playback failed", e);
    }
};

const App: React.FC = () => {
  // --- State Management ---
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>(INITIAL_ROOMS[0].id);
  
  const [devices, setDevices] = useState<Device[]>([
    { id: 'd1', roomId: 'r1', type: DeviceType.LIGHT, name: 'Main Light', isOn: false, value: 80, isFaulty: false, ipAddress: '192.168.1.101', gpioPin: 5 },
    { id: 'd2', roomId: 'r1', type: DeviceType.FAN, name: 'Ceiling Fan', isOn: false, value: 3, isFaulty: false, ipAddress: '192.168.1.102', gpioPin: 4 },
    { id: 'd3', roomId: 'r2', type: DeviceType.LIGHT, name: 'Kitchen Strip', isOn: false, value: 100, isFaulty: false, ipAddress: '192.168.1.103', gpioPin: 12 },
    { id: 'd4', roomId: 'r4', type: DeviceType.MOTOR, name: 'Main Pump', isOn: false, value: 0, isFaulty: false, ipAddress: '192.168.1.104', gpioPin: 13 },
  ]);
  const [tankState, setTankState] = useState<WaterTankState>({
    level: 65,
    mode: 'AUTO',
    isMotorOn: false
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<SettingsState>({
    wifiSSID: 'Home_Net_2.4',
    wifiPass: 'password123',
    controlMode: AppMode.MANUAL,
    pumpLowThreshold: 20,
    pumpHighThreshold: 90,
    soundEnabled: true,
    alertSound: 'CHIME',
    homeName: 'HomeControl',
    theme: 'LIGHT'
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'alert' | 'success'} | null>(null);
  
  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    requireAuth: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    requireAuth: false,
    onConfirm: () => {}
  });

  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomIcon, setNewRoomIcon] = useState('Box');

  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>(DeviceType.LIGHT);

  // --- Helper Functions ---
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message,
      type
    }]);
  };

  const showNotification = (message: string, type: 'alert' | 'success') => {
      setNotification({ message, type });
      if (settings.soundEnabled) {
          playSystemSound(type === 'alert' ? 'ALARM' : settings.alertSound);
      }
      setTimeout(() => setNotification(null), 5000);
  };

  // --- Logic & Effects ---
  useEffect(() => {
    const interval = setInterval(() => {
        setTankState(prev => {
            let newLevel = prev.level;
            let motorStatus = prev.isMotorOn;

            if (!prev.isMotorOn && Math.random() > 0.7) {
                newLevel = Math.max(0, newLevel - 0.5);
            }

            if (prev.isMotorOn) {
                newLevel = Math.min(100, newLevel + 2); 
            }

            if (Math.abs(newLevel - settings.pumpLowThreshold) < 0.5 && prev.level > newLevel) {
                 showNotification(`Water Level LOW (${Math.floor(newLevel)}%)`, 'alert');
            }
            if (Math.abs(newLevel - settings.pumpHighThreshold) < 0.5 && prev.level < newLevel) {
                 showNotification(`Water Level HIGH (${Math.floor(newLevel)}%)`, 'success');
            }
            if (newLevel >= 99 && prev.level < 99) {
                 showNotification("Water Tank Full Alert!", 'alert');
            }

            if (prev.mode === 'AUTO') {
                if (newLevel <= settings.pumpLowThreshold && !prev.isMotorOn) {
                    motorStatus = true;
                    addLog('Auto-started water pump: Low level detected', 'alert');
                    toggleDeviceState('d4', true);
                } else if (newLevel >= settings.pumpHighThreshold && prev.isMotorOn) {
                    motorStatus = false;
                    addLog('Auto-stopped water pump: High level reached', 'success');
                    toggleDeviceState('d4', false);
                }
            }

            if (prev.mode === 'MANUAL' && prev.isMotorOn && newLevel >= 100) {
                 motorStatus = false;
                 addLog('Emergency Stop: Tank Full', 'alert');
                 toggleDeviceState('d4', false);
                 showNotification("Emergency Stop: Tank Full", 'alert');
            }

            return { ...prev, level: newLevel, isMotorOn: motorStatus };
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  const toggleDeviceState = (id: string, forceState?: boolean) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const newState = forceState !== undefined ? forceState : !d.isOn;
        if (d.type === DeviceType.MOTOR) {
             setTankState(t => ({...t, isMotorOn: newState}));
             addLog(`${d.name} turned ${newState ? 'ON' : 'OFF'}`, newState ? 'alert' : 'info');
        } else {
             addLog(`${d.name} turned ${newState ? 'ON' : 'OFF'}`, 'info');
        }
        return { ...d, isOn: newState };
      }
      return d;
    }));
  };

  const handleDeviceToggleUI = (id: string) => {
      if (settings.controlMode === AppMode.MANUAL) {
          showNotification("Switch to Remote Mode to control devices.", 'alert');
          return;
      }

      // Specific check for Pump to ensure it's not toggled in AUTO mode
      const device = devices.find(d => d.id === id);
      if (device?.type === DeviceType.MOTOR && tankState.mode === 'AUTO') {
          showNotification("Switch Water Tank to MANUAL mode to control pump.", 'alert');
          return;
      }

      toggleDeviceState(id);
  };

  const handleDeviceValueChange = (id: string, value: number) => {
    if (settings.controlMode === AppMode.MANUAL) return;
    setDevices(prev => prev.map(d => {
        if (d.id === id) {
            return { ...d, value };
        }
        return d;
    }));
  };

  const handleUpdateDevice = (updatedDevice: Device) => {
    setDevices(prev => prev.map(d => {
      if (d.id === updatedDevice.id) {
        if (d.isOn !== updatedDevice.isOn) {
           addLog(`${updatedDevice.name} manually switched ${updatedDevice.isOn ? 'ON' : 'OFF'} from settings`, 'info');
        }
        if (d.type === DeviceType.MOTOR && d.isOn !== updatedDevice.isOn) {
           setTankState(t => ({...t, isMotorOn: updatedDevice.isOn}));
        }
        return updatedDevice;
      }
      return d;
    }));
  };

  const deleteDevice = (id: string) => {
      setConfirmation({
        isOpen: true,
        title: 'Delete Device',
        message: 'Are you sure you want to remove this device? This action cannot be undone.',
        requireAuth: false,
        onConfirm: () => {
            setDevices(prev => prev.filter(d => d.id !== id));
            addLog(`Device ${id} removed`, 'alert');
            setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
      });
  };

  const deleteRoom = (id: string) => {
      if (rooms.length === 1) {
          showNotification("Cannot delete the only remaining room.", 'alert');
          return;
      }
      const roomToDelete = rooms.find(r => r.id === id);
      setConfirmation({
        isOpen: true,
        title: `Delete Space: ${roomToDelete?.name}`,
        message: `Are you sure you want to delete this space? All devices inside it will be removed.`,
        requireAuth: false,
        onConfirm: () => {
            const newRooms = rooms.filter(r => r.id !== id);
            setRooms(newRooms);
            setDevices(prev => prev.filter(d => d.roomId !== id));
            if (activeRoomId === id) {
                setActiveRoomId(newRooms[0].id);
            }
            addLog("Room deleted", 'alert');
            setConfirmation(prev => ({ ...prev, isOpen: false }));
        }
      });
  };

  const handleSystemSync = () => {
    setTankState(prev => ({
        ...prev,
        level: Math.max(0, Math.min(100, prev.level + (Math.random() * 2 - 1))),
    }));
    const motor = devices.find(d => d.type === DeviceType.MOTOR);
    if(motor) {
        setTankState(prev => ({ ...prev, isMotorOn: motor.isOn }));
    }
    addLog('System synchronized with hardware sensors.', 'success');
  };

  const confirmAddRoom = () => {
    if (!newRoomName.trim()) return;
    const newRoom: Room = {
      id: `r${Date.now()}`,
      name: newRoomName,
      icon: newRoomIcon
    };
    setRooms(prev => [...prev, newRoom]);
    addLog(`Room "${newRoomName}" added`, 'success');
    setShowAddRoomModal(false);
    setNewRoomName('');
    setNewRoomIcon('Box');
  };

  const confirmAddDevice = () => {
      if (!newDeviceName.trim()) return;
      const newDevice: Device = {
          id: `d${Date.now()}`,
          roomId: activeRoomId,
          name: newDeviceName,
          type: newDeviceType,
          isOn: false,
          value: newDeviceType === DeviceType.FAN ? 1 : 50,
          isFaulty: false,
          ipAddress: '192.168.1.X',
          gpioPin: 2
      };
      setDevices(prev => [...prev, newDevice]);
      addLog(`Device "${newDeviceName}" added to current room`, 'success');
      setShowAddDeviceModal(false);
      setNewDeviceName('');
      setNewDeviceType(DeviceType.LIGHT);
  };

  const activeDevices = devices.filter(d => d.roomId === activeRoomId);

  return (
    <div className={settings.theme === 'DARK' ? 'dark' : ''}>
    <div className={`min-h-screen text-gray-800 dark:text-gray-100 flex flex-col relative overflow-hidden font-inter selection:bg-emerald-500/30 transition-colors duration-700 ${settings.theme === 'DARK' ? 'bg-mesh-dark' : 'bg-mesh-light'}`}>
      
      {/* Intense Background Blobs for Liquid Effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-400/30 dark:bg-emerald-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{animationDuration: '8s'}} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/30 dark:bg-blue-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{animationDuration: '10s'}} />
          <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-purple-400/30 dark:bg-purple-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <ConfirmationModal 
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
        requireAuth={confirmation.requireAuth}
      />

      {notification && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[80] px-6 py-4 rounded-3xl shadow-glass dark:shadow-glass-dark flex items-center gap-3 animate-in fade-in slide-in-from-top duration-500 border backdrop-blur-3xl
            ${notification.type === 'alert' 
                ? 'bg-white/40 dark:bg-black/40 border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400' 
                : 'bg-white/40 dark:bg-black/40 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
              <Bell className={notification.type === 'alert' ? 'animate-bounce' : ''} />
              <span className="font-bold tracking-tight drop-shadow-sm">{notification.message}</span>
              <button onClick={() => setNotification(null)} className="ml-2 opacity-50 hover:opacity-100"><X size={18} /></button>
          </div>
      )}

      {/* --- Top Bar --- */}
      <header className="px-8 py-6 flex justify-between items-center z-10 relative">
         <div>
             <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-sm transition-colors bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                 {settings.homeName}
             </h1>
             <p className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-widest uppercase flex items-center gap-2 mt-2 font-bold pl-1">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse"/>
                 {settings.controlMode} • {settings.wifiSSID}
             </p>
         </div>
         <button 
           onClick={() => setIsSettingsOpen(true)}
           className="p-4 rounded-[1.5rem] transition-all duration-300 backdrop-blur-2xl shadow-glass hover:shadow-lg border border-white/40 dark:border-white/10 text-gray-700 dark:text-gray-200 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-transparent hover:scale-105 active:scale-95 group"
         >
             <Settings size={24} className="group-hover:rotate-45 transition-transform duration-500" />
         </button>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto px-8 pb-28 z-10 custom-scrollbar pt-2 relative">
          
          <div className="mb-8">
              <RoomTabs 
                rooms={rooms} 
                activeRoomId={activeRoomId} 
                onSelectRoom={setActiveRoomId} 
                onAddRoom={() => setShowAddRoomModal(true)}
                onDeleteRoom={deleteRoom}
              />
          </div>

          {rooms.find(r => r.id === activeRoomId)?.name === 'Utility' && (
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <WaterLevel 
                    tankState={tankState} 
                    lowThreshold={settings.pumpLowThreshold}
                    highThreshold={settings.pumpHighThreshold}
                    onToggleMode={() => setTankState(prev => ({...prev, mode: prev.mode === 'AUTO' ? 'MANUAL' : 'AUTO'}))}
                    onToggleMotor={() => {
                        const motor = devices.find(d => d.type === DeviceType.MOTOR);
                        if(motor) handleDeviceToggleUI(motor.id);
                        else {
                            setTankState(prev => ({...prev, isMotorOn: !prev.isMotorOn}));
                        }
                    }}
                  />
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {activeDevices.map(device => {
                  // Determine if this specific card should be disabled
                  const isPumpAuto = device.type === DeviceType.MOTOR && tankState.mode === 'AUTO';
                  const isAppManual = settings.controlMode === AppMode.MANUAL;
                  
                  return (
                    <DeviceCard 
                        key={device.id} 
                        device={device} 
                        onToggle={handleDeviceToggleUI}
                        onChangeValue={handleDeviceValueChange}
                        onDelete={deleteDevice}
                        disabled={isAppManual || isPumpAuto}
                    />
                  );
              })}
              
              <button 
                onClick={() => setShowAddDeviceModal(true)}
                className="min-h-[200px] rounded-[2rem] border-2 border-dashed border-white/40 dark:border-white/10 bg-white/5 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group backdrop-blur-sm"
              >
                  <div className="p-5 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 dark:to-transparent rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg border border-white/30 dark:border-white/5">
                      <Plus size={28} />
                  </div>
                  <span className="font-medium tracking-wide">Add Device</span>
              </button>
          </div>
      </main>

      <LogPanel logs={logs} />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onUpdateSettings={setSettings}
        devices={devices}
        rooms={rooms}
        onUpdateDevice={handleUpdateDevice}
        onDeleteDevice={deleteDevice}
        onSystemSync={handleSystemSync}
      />
      
    </div>
    </div>
  );
};

export default App;