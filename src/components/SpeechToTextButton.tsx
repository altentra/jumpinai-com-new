import React, { useState, useRef, useCallback } from 'react';
import { AudioLines, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SpeechToTextButtonProps {
  onTranscription: (text: string) => void;
  language?: string;
}

export const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({ 
  onTranscription,
  language = 'en'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use speech-to-text.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      console.log('Recording stopped');
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        console.log('Sending audio for transcription...');
        
        // Call edge function
        const { data, error } = await supabase.functions.invoke('speech-to-text', {
          body: { 
            audio: base64Audio,
            language 
          }
        });

        setIsProcessing(false);

        if (error) {
          throw error;
        }

        if (data?.text) {
          onTranscription(data.text);
          console.log('Transcription received:', data.text);
        } else {
          toast({
            title: "No Speech Detected",
            description: "Please try speaking more clearly.",
            variant: "destructive",
          });
        }
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessing(false);
      toast({
        title: "Transcription Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isProcessing}
      className="group relative h-9 w-9 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: isRecording 
          ? 'linear-gradient(135deg, hsl(0 84% 60%) 0%, hsl(0 84% 50%) 100%)'
          : 'linear-gradient(135deg, hsl(240 5% 26%) 0%, hsl(240 6% 10%) 100%)',
        boxShadow: isRecording
          ? '0 4px 20px hsl(0 84% 60% / 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {/* Glass effect overlay */}
      <div 
        className="absolute inset-0 rounded-lg opacity-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)',
        }}
      />
      
      {/* Icon */}
      <div className="relative flex items-center justify-center h-full w-full">
        {isProcessing ? (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        ) : isRecording ? (
          <Square className="h-4 w-4 text-white" fill="white" />
        ) : (
          <AudioLines className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Pulse animation when recording */}
      {isRecording && (
        <div 
          className="absolute inset-0 rounded-lg animate-pulse"
          style={{
            background: 'rgba(239, 68, 68, 0.3)',
          }}
        />
      )}
    </button>
  );
};
