import { useState } from 'react';
import { Bell, Lock, Globe, Moon, Sun, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card3D } from '@/components/global/Card3D';
import { GlassCard } from '@/components/global/GlassCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

export function DriverSettingsSection() {
  const { theme, toggleTheme } = useTheme();

  const [settings, setSettings] = useState({
    shareLocation: true,
    showOnlineStatus: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem('driverSettings', JSON.stringify(updated));
    toast.success('Setting updated');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Appearance */}
      <Card3D>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </div>
        </GlassCard>
      </Card3D>

      {/* Privacy & Security */}
      <Card3D>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Share Location</Label>
                <p className="text-sm text-muted-foreground">
                  Allow location sharing during deliveries
                </p>
              </div>
              <Switch
                checked={settings.shareLocation}
                onCheckedChange={() => handleToggle('shareLocation')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Online Status</Label>
                <p className="text-sm text-muted-foreground">
                  Display your availability status to dispatchers
                </p>
              </div>
              <Switch
                checked={settings.showOnlineStatus}
                onCheckedChange={() => handleToggle('showOnlineStatus')}
              />
            </div>

          </div>
        </GlassCard>
      </Card3D>
    </div>
  );
}


