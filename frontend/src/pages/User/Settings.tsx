import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bell, Lock, Palette, Accessibility, AlertTriangle, Download, FileText } from 'lucide-react';
import { apiClient } from '@/services/api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import { EXTERNAL_URLS } from '@/config/constants';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeProvider';

const Settings = () => {
  const navigate = useNavigate();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    action: '' as 'delete-chat' | 'deactivate' | 'delete-account' | '',
  });
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    weeklyReports: false,

    // Privacy
    shareDataForResearch: false,
    anonymousAnalytics: true,
    showOnlineStatus: true,

    // Appearance
    theme: 'light',
    language: 'vi',
    fontSize: 'medium',

    // Accessibility
    highContrast: false,
    reduceMotion: false,
    screenReader: false
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<typeof settings>(API_ENDPOINTS.USERS.SETTINGS);
      setSettings(data);
    } catch (error: unknown) {
      console.error('Failed to load settings:', error);
      toast.error('Unable to load settings. Using default values.');
      // Keep default settings if API fails
    } finally {
      setLoading(false);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await apiClient.put(API_ENDPOINTS.USERS.SETTINGS, newSettings);
      toast.success('Settings saved successfully');
    } catch (error: unknown) {
      console.error('Failed to save settings:', error);
      toast.error('Unable to save settings. Please try again.');
      // Revert to previous settings
      loadSettings();
    }
  };

  const handleToggle = (key: string) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key as keyof typeof settings]
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSelect = (key: string, value: string) => {
    // Handle theme changes with ThemeProvider
    if (key === 'theme' && value !== 'auto') {
      const newTheme = value as 'light' | 'dark';
      if (newTheme !== currentTheme) {
        toggleTheme();
      }
    }
    
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleViewPrivacyPolicy = () => {
    navigate(EXTERNAL_URLS.PRIVACY_POLICY);
  };

  const handleDownloadData = async () => {
    try {
      // Note: apiClient.get returns the data directly, not a response object with .data
      // We need to use fetch or axios directly for blob responses
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.USERS.DOWNLOAD_DATA}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download data');
      }
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my-data-${new Date().getTime()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Data downloaded successfully');
    } catch (error) {
      console.error('Failed to download data:', error);
      toast.error('Unable to download data');
    }
  };

  const openConfirmDialog = (action: 'delete-chat' | 'deactivate' | 'delete-account') => {
    const dialogs = {
      'delete-chat': {
        title: 'Delete Chat History',
        description: 'Are you sure you want to delete all your chat history? This action cannot be undone.',
      },
      'deactivate': {
        title: 'Deactivate Account',
        description: 'Your account will be deactivated and you won\'t be able to log in. You can reactivate it later by contacting support.',
      },
      'delete-account': {
        title: 'Delete Account Permanently',
        description: 'This will permanently delete your account and all associated data. This action cannot be undone. Are you absolutely sure?',
      },
    };

    setConfirmDialog({
      open: true,
      ...dialogs[action],
      action,
    });
  };

  const handleConfirmAction = async () => {
    try {
      switch (confirmDialog.action) {
        case 'delete-chat':
          await apiClient.delete(API_ENDPOINTS.CHAT.DELETE_HISTORY);
          toast.success('Chat history deleted');
          break;
        
        case 'deactivate':
          await apiClient.put(API_ENDPOINTS.USERS.DEACTIVATE);
          toast.success('Account deactivated');
          // Log out and redirect
          localStorage.removeItem('token');
          navigate('/login');
          break;
        
        case 'delete-account':
          await apiClient.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT);
          toast.success('Account deleted');
          // Log out and redirect
          localStorage.removeItem('token');
          navigate('/');
          break;
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
      toast.error('Action failed. Please try again.');
    } finally {
      setConfirmDialog({ open: false, title: '', description: '', action: '' });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start gap-3 mb-6">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-7 w-40 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account, notifications and app preferences
        </p>
      </div>

      {/* Info Banner */}
      <Card className="p-4 mb-6 bg-muted/50 border-primary/20">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Auto-save enabled:</strong> Your changes are automatically saved when you toggle settings.
        </p>
      </Card>

      <div className="space-y-6">

      {/* Notifications Section */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Bell size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Manage how you receive notifications
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="email-notif">Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications about consultations and new messages
              </p>
            </div>
            <Switch
              id="email-notif"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="push-notif">Push notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your device
              </p>
            </div>
            <Switch
              id="push-notif"
              checked={settings.pushNotifications}
              onCheckedChange={() => handleToggle('pushNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="session-remind">Session reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminder 30 minutes before consultation
              </p>
            </div>
            <Switch
              id="session-remind"
              checked={settings.sessionReminders}
              onCheckedChange={() => handleToggle('sessionReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="weekly-report">Weekly reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly progress summary via email
              </p>
            </div>
            <Switch
              id="weekly-report"
              checked={settings.weeklyReports}
              onCheckedChange={() => handleToggle('weeklyReports')}
            />
          </div>
        </div>
      </Card>

      {/* Privacy Section */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <Lock size={20} className="text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Privacy</h2>
            <p className="text-sm text-muted-foreground">
              Control your data and privacy
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="share-data">Share research data</Label>
              <p className="text-sm text-muted-foreground">
                Allow anonymous data to be used for medical research
              </p>
            </div>
            <Switch
              id="share-data"
              checked={settings.shareDataForResearch}
              onCheckedChange={() => handleToggle('shareDataForResearch')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="analytics">Anonymous analytics</Label>
              <p className="text-sm text-muted-foreground">
                Send anonymous usage data to improve the app
              </p>
            </div>
            <Switch
              id="analytics"
              checked={settings.anonymousAnalytics}
              onCheckedChange={() => handleToggle('anonymousAnalytics')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="online-status">Show online status</Label>
              <p className="text-sm text-muted-foreground">
                Allow doctors to see when you're online
              </p>
            </div>
            <Switch
              id="online-status"
              checked={settings.showOnlineStatus}
              onCheckedChange={() => handleToggle('showOnlineStatus')}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleViewPrivacyPolicy}>
            <FileText className="w-4 h-4 mr-2" />
            View Privacy Policy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadData}>
            <Download className="w-4 h-4 mr-2" />
            Download My Data
          </Button>
        </div>
      </Card>

      {/* Appearance Section */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <Palette size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Appearance</h2>
            <p className="text-sm text-muted-foreground">
              Customize app appearance
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={settings.theme === 'light' ? 'default' : 'outline'}
                onClick={() => handleSelect('theme', 'light')}
                className="w-full"
              >
                ☀️ Light
              </Button>
              <Button
                variant={settings.theme === 'dark' ? 'default' : 'outline'}
                onClick={() => handleSelect('theme', 'dark')}
                className="w-full"
              >
                🌙 Dark
              </Button>
              <Button
                variant={settings.theme === 'auto' ? 'default' : 'outline'}
                onClick={() => handleSelect('theme', 'auto')}
                className="w-full"
              >
                ⚙️ Auto
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={settings.language} onValueChange={(value: string) => handleSelect('language', value)}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={settings.fontSize === 'small' ? 'default' : 'outline'}
                onClick={() => handleSelect('fontSize', 'small')}
                className="w-full"
              >
                Small
              </Button>
              <Button
                variant={settings.fontSize === 'medium' ? 'default' : 'outline'}
                onClick={() => handleSelect('fontSize', 'medium')}
                className="w-full"
              >
                Medium
              </Button>
              <Button
                variant={settings.fontSize === 'large' ? 'default' : 'outline'}
                onClick={() => handleSelect('fontSize', 'large')}
                className="w-full"
              >
                Large
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Accessibility Section */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
            <Accessibility size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Accessibility</h2>
            <p className="text-sm text-muted-foreground">
              Settings for users with special needs
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="high-contrast">High contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase color contrast for better readability
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={() => handleToggle('highContrast')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="reduce-motion">Reduce motion</Label>
              <p className="text-sm text-muted-foreground">
                Reduce motion effects and animations
              </p>
            </div>
            <Switch
              id="reduce-motion"
              checked={settings.reduceMotion}
              onCheckedChange={() => handleToggle('reduceMotion')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="screen-reader">Screen reader support</Label>
              <p className="text-sm text-muted-foreground">
                Optimize for screen reader software
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={settings.screenReader}
              onCheckedChange={() => handleToggle('screenReader')}
            />
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">
              Irreversible actions
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => openConfirmDialog('delete-chat')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Delete Chat History
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => openConfirmDialog('deactivate')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Deactivate Account
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            onClick={() => openConfirmDialog('delete-account')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Permanently Delete Account
          </Button>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default Settings;
