import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Upload, User, X } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Pre-made avatar gallery
const AVATAR_GALLERY = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Princess',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Dusty',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Chester',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna'
];

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  userName: string;
  userType?: 'user' | 'doctor';
  onSave?: (avatarUrl?: string) => Promise<void>;
}

export default function AvatarUpload({ currentAvatar, onAvatarChange, userName, userType = 'user', onSave }: AvatarUploadProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[AvatarUpload] handleFileUpload called');
    const file = event.target.files?.[0];
    console.log('[AvatarUpload] Selected file:', file);
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image must not exceed 5MB',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload to appropriate endpoint based on user type
      const endpoint = userType === 'doctor' ? '/doctors/avatar/upload' : '/users/avatar/upload';
      const response = await apiClient.postFormData<{ avatar_url: string }>(endpoint, formData);

      // Update local state
      onAvatarChange(response.avatar_url);
      
      // Save to database immediately
      if (onSave) {
        await onSave(response.avatar_url);
      }
      
      toast({
        title: 'Success',
        description: 'Avatar uploaded and saved successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to upload image';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSelectFromGallery = async (avatarUrl: string) => {
    try {
      setSelectedAvatar(avatarUrl);
      
      // Update state and save to database immediately
      onAvatarChange(avatarUrl);
      
      if (onSave) {
        await onSave(avatarUrl);
      }
      
      setShowGallery(false);
      
      toast({
        title: 'Success',
        description: 'Avatar selected and saved'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to update avatar';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      // Update state and save to database immediately
      onAvatarChange('');
      setSelectedAvatar('');
      
      if (onSave) {
        await onSave('');
      }
      
      toast({
        title: 'Success',
        description: 'Avatar removed'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to remove avatar';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const displayAvatar = selectedAvatar || currentAvatar;

  return (
    <div className="space-y-4">
      {/* Current Avatar */}
      <div className="flex items-center gap-6">
        <Avatar className="w-24 h-24 border-4 border-muted">
          <AvatarImage src={displayAvatar} alt={userName} />
          <AvatarFallback className="text-2xl">
            <User className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex gap-2 flex-wrap">
            {/* Upload Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => {
                console.log('[AvatarUpload] Upload button clicked');
                document.getElementById('avatar-upload')?.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                console.log('[AvatarUpload] File selected:', e.target.files?.[0]);
                handleFileUpload(e);
              }}
            />

            {/* Choose from Gallery */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowGallery(!showGallery)}
            >
              Choose from Gallery
            </Button>

            {/* Remove Avatar */}
            {displayAvatar && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveAvatar}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or GIF. Maximum 5MB.
          </p>
        </div>
      </div>

      {/* Avatar Gallery */}
      {showGallery && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select Avatar</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowGallery(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {AVATAR_GALLERY.map((avatarUrl, index) => (
                <button
                  key={index}
                  type="button"
                  className={`relative rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                    selectedAvatar === avatarUrl
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-muted hover:border-primary'
                  }`}
                  onClick={() => handleSelectFromGallery(avatarUrl)}
                >
                  <Avatar className="w-full h-full">
                    <AvatarImage src={avatarUrl} />
                  </Avatar>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
