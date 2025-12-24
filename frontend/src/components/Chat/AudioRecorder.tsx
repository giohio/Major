import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export const AudioRecorder = ({ onSendAudio, disabled = false }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Cleanup audio URL
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      setError('');
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        setAudioBlob(blob);
        setAudioURL(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      toast.success('🎤 Đang ghi âm... Hãy nói!');
      
    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      const errorMsg = error.name === 'NotAllowedError' 
        ? 'Vui lòng cấp quyền microphone trong cài đặt trình duyệt'
        : 'Không thể truy cập microphone';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info('Đã dừng ghi âm');
    }
  };

  const sendAudio = () => {
    if (audioBlob) {
      if (audioBlob.size < 1000) {
        toast.error('Audio quá ngắn. Vui lòng ghi âm lại!');
        return;
      }
      
      onSendAudio(audioBlob);
      // Reset state
      resetRecorder();
    }
  };

  const cancelRecording = () => {
    resetRecorder();
    toast.info('Đã hủy ghi âm');
  };

  const resetRecorder = () => {
    setAudioBlob(null);
    setAudioURL('');
    setRecordingTime(0);
    setError('');
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render error state
  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <span className="text-xs text-destructive">{error}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setError('')}
          className="ml-auto"
        >
          Đóng
        </Button>
      </div>
    );
  }

  // Render recording state
  if (isRecording) {
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
        "bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800"
      )}>
        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            Đang ghi... {formatTime(recordingTime)}
          </span>
        </div>
        
        {/* Waveform animation */}
        <div className="flex items-center gap-1 h-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={stopRecording}
          className="shrink-0"
        >
          <Square className="w-3 h-3 mr-1  fill-current" />
          Dừng
        </Button>
      </div>
    );
  }

  // Render playback state
  if (audioBlob && audioURL) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-muted/50 border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <audio 
              src={audioURL} 
              controls 
              className="w-full h-8" 
              style={{ maxWidth: '200px' }}
            />
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              onClick={sendAudio}
              title="Gửi audio"
              className="h-8 w-8 bg-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={cancelRecording}
              title="Hủy"
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Audio: {formatTime(recordingTime)} • {(audioBlob.size / 1024).toFixed(1)} KB
        </div>
      </div>
    );
  }

  // Render initial state (record button)
  return (
    <Button
      size="icon"
      variant="outline"
      onClick={startRecording}
      disabled={disabled}
      title="Ghi âm tin nhắn"
      className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
    >
      <Mic className="w-4 h-4" />
    </Button>
  );
};
