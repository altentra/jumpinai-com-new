import React, { useState, useRef, useCallback } from 'react';
import { AudioLines, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpeechToTextButtonProps {
  onTranscription: (text: string) => void;
  language?: string;
}

export const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({ 
  onTranscription,
  language = 'en'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'listening'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Maximum recording duration: 30 seconds
  const MAX_RECORDING_DURATION = 30000; // milliseconds

  const stopRecording = useCallback((timedOut: boolean = false) => {
    console.log('Stopping recording...');
    
    // Clear recording timer
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clean up audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setIsConnecting(false);
    setConnectionStatus('idle');

    // Show timeout message if stopped due to time limit
    if (timedOut) {
      toast({
        title: "Recording Stopped",
        description: "Maximum recording duration of 30 seconds reached.",
        variant: "default",
      });
    }
  }, [toast]);

  const startRecording = useCallback(async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      // Connect to WebSocket relay
      const wsUrl = `wss://cieczaajcgkgdgenfdzi.supabase.co/functions/v1/speech-to-text-realtime`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to relay');
        setIsConnecting(false);
        setIsRecording(true);

        // Set up automatic timeout after 30 seconds
        recordingTimerRef.current = setTimeout(() => {
          console.log('Recording time limit reached (30s)');
          stopRecording(true);
        }, MAX_RECORDING_DURATION);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data.message_type || data.type, data);

          if (data.message_type === 'session_started') {
            console.log('ElevenLabs session started');
            setConnectionStatus('listening');
          } else if (data.message_type === 'partial_transcript' && data.text) {
            // Partial transcript - just replace with the latest full text
            console.log('Partial transcript:', data.text);
            onTranscription(data.text);
          } else if (data.message_type === 'committed_transcript' && data.text) {
            // Committed transcript - replace with the latest full text
            console.log('Committed transcript:', data.text);
            onTranscription(data.text);
          } else if (data.message_type === 'input_error' || data.type === 'error') {
            console.error('Transcription error:', data);
            toast({
              title: "Transcription Error",
              description: data.error || data.message || "An error occurred",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to transcription service",
          variant: "destructive",
        });
        stopRecording();
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        if (isRecording) {
          stopRecording();
        }
      };

      // Set up audio processing
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Convert Float32Array to Int16Array
          const int16Data = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          // Convert to base64
          const uint8Data = new Uint8Array(int16Data.buffer);
          let binary = '';
          const chunkSize = 0x8000;
          for (let i = 0; i < uint8Data.length; i += chunkSize) {
            const chunk = uint8Data.subarray(i, Math.min(i + chunkSize, uint8Data.length));
            binary += String.fromCharCode.apply(null, Array.from(chunk));
          }
          const base64Audio = btoa(binary);

          // Send audio chunk in ElevenLabs format
          ws.send(JSON.stringify({
            type: 'input_audio_chunk',
            audio_chunk: base64Audio,
          }));
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use speech-to-text.",
        variant: "destructive",
      });
      setIsConnecting(false);
      stopRecording();
    }
  }, [toast, onTranscription, stopRecording, isRecording]);

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isConnecting) {
      startRecording();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status indicator */}
      {connectionStatus !== 'idle' && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in">
          {connectionStatus === 'connecting' && (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Connecting...</span>
            </>
          )}
          {connectionStatus === 'listening' && (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Listening...</span>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={isConnecting}
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
          {isConnecting ? (
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
    </div>
  );
};
