import React, { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'pms-settings-v1';
const defaultSettings = {
  profile: { name: 'Admin', email: '', phone: '', avatar: '' },
  appearance: { theme: localStorage.getItem('pms-theme') || 'light', compact: false },
  notifications: { email: true, reminders: true, push: false },
  system: { autoBackup: false, refreshInterval: 15 },
  security: { twoFactor: false }
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
      // persist theme too for compatibility with ThemeContext
      if (settings.appearance?.theme) localStorage.setItem('pms-theme', settings.appearance.theme);
    } catch (e) {}
  }, [settings]);

  const updateProfile = (profile) => setSettings((s) => ({ ...s, profile: { ...s.profile, ...profile } }));
  const updateAppearance = (appearance) => setSettings((s) => ({ ...s, appearance: { ...s.appearance, ...appearance } }));
  const updateNotifications = (notifications) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, ...notifications } }));
  const updateSystem = (system) => setSettings((s) => ({ ...s, system: { ...s.system, ...system } }));
  const updateSecurity = (security) => setSettings((s) => ({ ...s, security: { ...s.security, ...security } }));

  const clearLocalData = () => {
    localStorage.removeItem('pms-appointments');
    localStorage.removeItem('pms-doctors');
    localStorage.removeItem('pms-settings-v1');
    localStorage.removeItem('pms-theme');
    // reload page to reflect cleared state
    window.location.reload();
  };

  return (
    <SettingsContext.Provider value={{ settings, updateProfile, updateAppearance, updateNotifications, updateSystem, updateSecurity, clearLocalData }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export default SettingsContext;
