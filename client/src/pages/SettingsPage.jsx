import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

const profileSchema = z.object({ name: z.string().min(2), email: z.string().email().optional(), phone: z.string().optional(), avatar: z.string().optional() });

export default function SettingsPage() {
  const { settings, updateProfile, updateAppearance, updateNotifications, updateSystem, updateSecurity, clearLocalData } = useSettings();
  const { theme, setTheme, toggleTheme } = useTheme();

  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(profileSchema), defaultValues: settings.profile });

  useEffect(() => reset(settings.profile), [settings.profile, reset]);

  const onSaveProfile = (values) => {
    updateProfile(values);
    toast.success('Profile saved');
  };

  const onToggleTheme = (e) => {
    const t = e.target.checked ? 'dark' : 'light';
    updateAppearance({ theme: t });
    setTheme(t);
    toast.success('Appearance updated');
  };

  const onSaveNotifications = () => {
    const form = document.getElementById('notifications-form');
    const data = new FormData(form);
    updateNotifications({ email: !!data.get('email'), reminders: !!data.get('reminders'), push: !!data.get('push') });
    toast.success('Notifications saved');
  };

  const onSaveSystem = () => {
    const form = document.getElementById('system-form');
    const data = new FormData(form);
    updateSystem({ autoBackup: !!data.get('autoBackup'), refreshInterval: Number(data.get('refreshInterval') || 15) });
    toast.success('System settings saved');
  };

  const onSaveSecurity = () => {
    const form = document.getElementById('security-form');
    const data = new FormData(form);
    updateSecurity({ twoFactor: !!data.get('twoFactor') });
    toast.success('Security settings saved');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid gap-6">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Settings</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Workspace Settings</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Profile, appearance, notifications, security and system preferences.</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Profile Settings</h3>
          <form onSubmit={handleSubmit(onSaveProfile)} className="mt-4 grid gap-3">
            <div className="floating-input"><input className="peer" {...register('name')} placeholder=" " /><label>Admin name</label></div>
            <div className="floating-input"><input className="peer" {...register('email')} placeholder=" " /><label>Email</label></div>
            <div className="floating-input"><input className="peer" {...register('phone')} placeholder=" " /><label>Phone</label></div>
            <div className="floating-input"><input className="peer" {...register('avatar')} placeholder=" " /><label>Profile image URL</label></div>
            <div className="flex justify-end gap-2"><button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2 text-white">Save profile</button></div>
          </form>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Appearance</h3>
          <div className="mt-4 grid gap-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.appearance?.theme === 'dark'} onChange={onToggleTheme} />
              <span>Dark mode</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.appearance?.compact} onChange={(e) => updateAppearance({ compact: e.target.checked })} />
              <span>Compact mode</span>
            </label>
            <div className="flex justify-end"><button onClick={() => { updateAppearance({ theme: theme, compact: settings.appearance?.compact }); toast.success('Appearance saved'); }} className="rounded-2xl bg-brand-600 px-4 py-2 text-white">Save</button></div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Notification Settings</h3>
          <form id="notifications-form" className="mt-4 grid gap-3">
            <label className="flex items-center gap-3"><input type="checkbox" name="email" defaultChecked={settings.notifications?.email} /> Email notifications</label>
            <label className="flex items-center gap-3"><input type="checkbox" name="reminders" defaultChecked={settings.notifications?.reminders} /> Appointment reminders</label>
            <label className="flex items-center gap-3"><input type="checkbox" name="push" defaultChecked={settings.notifications?.push} /> Push notifications</label>
            <div className="flex justify-end"><button type="button" onClick={onSaveNotifications} className="rounded-2xl bg-brand-600 px-4 py-2 text-white">Save notifications</button></div>
          </form>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">System Settings</h3>
          <form id="system-form" className="mt-4 grid gap-3">
            <label className="flex items-center gap-3"><input type="checkbox" name="autoBackup" defaultChecked={settings.system?.autoBackup} /> Auto backup</label>
            <label className="flex items-center gap-3">Refresh interval (sec) <input name="refreshInterval" defaultValue={settings.system?.refreshInterval || 15} className="ml-2 rounded-2xl border px-2 py-1 w-24" /></label>
            <div className="flex justify-end"><button type="button" onClick={onSaveSystem} className="rounded-2xl bg-brand-600 px-4 py-2 text-white">Save system</button></div>
          </form>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Security</h3>
          <form id="security-form" className="mt-4 grid gap-3">
            <label className="flex items-center gap-3"><input type="checkbox" name="twoFactor" defaultChecked={settings.security?.twoFactor} /> Enable two-factor authentication</label>
            <div className="flex justify-end"><button type="button" onClick={onSaveSecurity} className="rounded-2xl bg-brand-600 px-4 py-2 text-white">Save security</button></div>
          </form>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Data Management</h3>
          <div className="mt-4 grid gap-3">
            <button onClick={() => { if (confirm('Export patients to CSV?')) { window.location.href = '/reports'; } }} className="rounded-2xl border px-4 py-2">Export patients (use Reports)</button>
            <button onClick={() => { if (confirm('This will clear local data. Continue?')) clearLocalData(); }} className="rounded-2xl border px-4 py-2 text-rose-600">Clear local data</button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
