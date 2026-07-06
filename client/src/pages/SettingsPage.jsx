import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bell, CheckSquare, Clock, Image, Mail, Moon, Phone, User, ChevronRight, CloudUpload, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import Card from '../components/ui/Card';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  avatar: z.string().optional()
});

function Row({ icon: Icon, iconClass, label, children }) {
  return (
    <div className="flex min-h-16 items-center gap-4 rounded-xl border border-[#dfe6f2] bg-white/80 px-3 py-2">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${iconClass}`}>
        <Icon size={21} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold">{label}</p>
        {children}
      </div>
      <ChevronRight size={21} className="text-[#43516f]" />
    </div>
  );
}

function Switch({ checked, onChange, name, defaultChecked }) {
  return (
    <label className="relative inline-flex h-8 w-14 shrink-0 items-center">
      <input type="checkbox" name={name} checked={checked} defaultChecked={defaultChecked} onChange={onChange} className="peer sr-only" />
      <span className="h-8 w-14 rounded-full bg-[#b8c1d1] transition peer-checked:bg-[#2f55e7]" />
      <span className="absolute left-1 h-6 w-6 rounded-full bg-white shadow transition peer-checked:translate-x-6" />
    </label>
  );
}

export default function SettingsPage() {
  const { settings, updateProfile, updateAppearance, updateNotifications, updateSystem } = useSettings();
  const { setTheme } = useTheme();
  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(profileSchema), defaultValues: settings.profile });

  useEffect(() => reset(settings.profile), [settings.profile, reset]);

  const onSaveProfile = (values) => {
    updateProfile(values);
    toast.success('Profile saved');
  };

  const onToggleTheme = (event) => {
    const theme = event.target.checked ? 'dark' : 'light';
    updateAppearance({ theme });
    setTheme(theme);
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

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto grid max-w-[96rem] gap-5">
      <div>
        <h2 className="text-2xl font-extrabold sm:text-3xl">Settings</h2>
        <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-[#43516f]">
          Profile, appearance, notifications, security and system preferences.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-5">
          <Card>
            <h3 className="text-xl font-extrabold">Profile Settings</h3>
            <form onSubmit={handleSubmit(onSaveProfile)} className="mt-5 grid gap-3">
              <Row icon={User} iconClass="bg-[#eaf2ff] text-[#2f55e7]" label="Admin name">
                <input className="w-full bg-transparent text-base font-medium text-[#43516f] outline-none" {...register('name')} placeholder="Admin" />
              </Row>
              <Row icon={Mail} iconClass="bg-[#eef2ff] text-[#2f55e7]" label="Email">
                <input className="w-full bg-transparent text-base font-medium text-[#43516f] outline-none" {...register('email')} placeholder="admin@example.com" />
              </Row>
              <Row icon={Phone} iconClass="bg-[#e7faf5] text-[#10b981]" label="Phone">
                <input className="w-full bg-transparent text-base font-medium text-[#43516f] outline-none" {...register('phone')} placeholder="+91 98765 43210" />
              </Row>
              <Row icon={Image} iconClass="bg-[#f4ecff] text-[#7c3aed]" label="Profile image URL">
                <input className="w-full bg-transparent text-base font-medium text-[#43516f] outline-none" {...register('avatar')} placeholder="https://example.com/profile.jpg" />
              </Row>
              <button type="submit" className="pm-blue-button mt-2 h-12 w-full">Save profile</button>
            </form>
          </Card>

          <Card>
            <h3 className="text-xl font-extrabold">System Settings</h3>
            <form id="system-form" className="mt-5 grid gap-3">
              <div className="flex min-h-16 items-center gap-4 rounded-xl border border-[#dfe6f2] bg-white/80 px-3 py-2">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#f4ecff] text-[#7c3aed]"><CloudUpload size={21} /></div>
                <p className="flex-1 font-extrabold">Auto backup</p>
                <input type="checkbox" name="autoBackup" defaultChecked={settings.system?.autoBackup} className="h-5 w-5 accent-[#2f55e7]" />
              </div>
              <div className="flex min-h-16 items-center gap-4 rounded-xl border border-[#dfe6f2] bg-white/80 px-3 py-2">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#e6fbfb] text-[#0f9f9b]"><Clock size={21} /></div>
                <label className="flex-1 font-extrabold" htmlFor="refreshInterval">Refresh interval (sec)</label>
                <input id="refreshInterval" name="refreshInterval" defaultValue={settings.system?.refreshInterval || 15} className="pm-field h-11 max-w-28 px-4" />
              </div>
              <button type="button" onClick={onSaveSystem} className="pm-blue-button h-12 w-full">Save system</button>
            </form>
          </Card>
        </div>

        <div className="grid content-start gap-5">
          <Card>
            <h3 className="text-xl font-extrabold">Appearance</h3>
            <div className="mt-5 grid gap-3">
              <div className="flex min-h-16 items-center gap-4 rounded-xl border border-[#dfe6f2] bg-white/80 px-3 py-2">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef2ff] text-[#2f55e7]"><Moon size={21} /></div>
                <p className="flex-1 font-extrabold">Dark mode</p>
                <Switch checked={settings.appearance?.theme === 'dark'} onChange={onToggleTheme} />
              </div>
              <div className="flex min-h-16 items-center gap-4 rounded-xl border border-[#dfe6f2] bg-white/80 px-3 py-2">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef2ff] text-[#2f55e7]"><ListChecks size={21} /></div>
                <p className="flex-1 font-extrabold">Compact mode</p>
                <Switch checked={settings.appearance?.compact} onChange={(event) => updateAppearance({ compact: event.target.checked })} />
              </div>
              <button onClick={() => { updateAppearance({ theme: settings.appearance?.theme, compact: settings.appearance?.compact }); toast.success('Appearance saved'); }} className="pm-blue-button h-12 w-full">Save appearance</button>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-extrabold">Notification Settings</h3>
            <form id="notifications-form" className="mt-5 grid gap-3">
              <div className="flex min-h-16 items-center gap-4 rounded-xl border border-[#dfe6f2] bg-white/80 px-3 py-2">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eaf2ff] text-[#2f55e7]"><Mail size={21} /></div>
                <p className="flex-1 font-extrabold">Email notifications</p>
                <input type="checkbox" name="email" defaultChecked={settings.notifications?.email} className="h-5 w-5 accent-[#2f55e7]" />
              </div>
              <div className="flex min-h-16 items-center gap-4 rounded-xl border border-[#dfe6f2] bg-white/80 px-3 py-2">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#e7faf5] text-[#10b981]"><CheckSquare size={21} /></div>
                <p className="flex-1 font-extrabold">Appointment reminders</p>
                <input type="checkbox" name="reminders" defaultChecked={settings.notifications?.reminders} className="h-5 w-5 accent-[#2f55e7]" />
              </div>
              <div className="flex min-h-16 items-center gap-4 rounded-xl border border-[#dfe6f2] bg-white/80 px-3 py-2">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#fff4dc] text-[#f59e0b]"><Bell size={21} /></div>
                <p className="flex-1 font-extrabold">Push notifications</p>
                <input type="checkbox" name="push" defaultChecked={settings.notifications?.push} className="h-5 w-5 accent-[#2f55e7]" />
              </div>
              <button type="button" onClick={onSaveNotifications} className="pm-blue-button h-12 w-full">Save notifications</button>
            </form>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
