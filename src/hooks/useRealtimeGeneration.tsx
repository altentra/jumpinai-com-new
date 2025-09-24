import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface GenerationStatus {
  phase: string;
  message: string;
  progress: number;
}

interface GenerationData {
  prompts: any[];
  workflows: any[];
  blueprints: any[];
  strategies: any[];
  plan: any;
  comprehensivePlan: any;
  fullContent: string;
}

interface UseRealtimeGenerationProps {
  onComplete?: (data: GenerationData) => void;
  onError?: (error: string) => void;
}

export const useRealtimeGeneration = ({ onComplete, onError }: UseRealtimeGenerationProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<GenerationStatus>({
    phase: '',
    message: '',
    progress: 0
  });
  const [generationData, setGenerationData] = useState<GenerationData>({
    prompts: [],
    workflows: [],
    blueprints: [],
    strategies: [],
    plan: null,
    comprehensivePlan: null,
    fullContent: ''
  });
  const [timer, setTimer] = useState(0);
  const [jumpId, setJumpId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const projectId = 'cieczaajcgkgdgenfdzi'; // Your Supabase project ID
    const wsUrl = `wss://${projectId}.functions.supabase.co/jumps-realtime-generation`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      if (isGenerating) {
        // Try to reconnect if we were in the middle of generation
        setTimeout(connect, 2000);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const handleMessage = (message: any) => {
    switch (message.type) {
      case 'connected':
        console.log('Connected to realtime generation');
        break;

      case 'infrastructure_ready':
        // Show empty infrastructure immediately
        setGenerationData({
          prompts: [],
          workflows: [],
          blueprints: [],
          strategies: [],
          plan: null,
          comprehensivePlan: null,
          fullContent: ''
        });
        break;

      case 'status':
        setStatus({
          phase: message.phase,
          message: message.message,
          progress: message.progress
        });
        break;

      case 'plan_ready':
        setGenerationData(prev => ({
          ...prev,
          plan: message.data.structured_plan,
          comprehensivePlan: message.data.comprehensive_plan,
          fullContent: message.data.full_content
        }));
        break;

      case 'component_ready':
        setGenerationData(prev => {
          const newData = { ...prev };
          newData[message.componentType as keyof typeof newData] = [
            ...((prev[message.componentType as keyof typeof prev] as any[]) || []),
            message.data
          ];
          return newData;
        });
        break;

      case 'jump_saved':
        setJumpId(message.jumpId);
        break;

      case 'generation_complete':
        setIsGenerating(false);
        stopTimer();
        toast.success('Your Jump in AI is complete!');
        if (onComplete) {
          onComplete(generationData);
        }
        break;

      case 'error':
        console.error('Generation error:', message.message);
        setIsGenerating(false);
        stopTimer();
        toast.error(message.message || 'Generation failed');
        if (onError) {
          onError(message.message);
        }
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const startGeneration = async (formData: any, userId?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to generation service');
      return;
    }

    setIsGenerating(true);
    setStatus({ phase: 'starting', message: 'Initializing generation...', progress: 0 });
    setGenerationData({
      prompts: [],
      workflows: [],
      blueprints: [],
      strategies: [],
      plan: null,
      comprehensivePlan: null,
      fullContent: ''
    });
    setJumpId(null);
    startTimer();

    wsRef.current.send(JSON.stringify({
      type: 'generate',
      payload: {
        ...formData,
        userId
      }
    }));
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsGenerating(false);
    stopTimer();
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isConnected,
    isGenerating,
    status,
    generationData,
    timer: formatTime(timer),
    jumpId,
    connect,
    disconnect,
    startGeneration
  };
};