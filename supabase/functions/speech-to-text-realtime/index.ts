import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  if (!ELEVENLABS_API_KEY) {
    return new Response("ELEVENLABS_API_KEY not configured", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let elevenLabsSocket: WebSocket | null = null;

  socket.onopen = () => {
    console.log("Client connected to relay");
    
    // Connect to ElevenLabs Realtime API
    const wsUrl = new URL("wss://api.elevenlabs.io/v1/speech-to-text/realtime");
    wsUrl.searchParams.set("model_id", "scribe_realtime_v2");
    wsUrl.searchParams.set("language_code", "en");
    wsUrl.searchParams.set("audio_format", "pcm_16000");
    wsUrl.searchParams.set("commit_strategy", "vad");
    
    elevenLabsSocket = new WebSocket(wsUrl.toString(), {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    elevenLabsSocket.onopen = () => {
      console.log("Connected to ElevenLabs Realtime API");
      socket.send(JSON.stringify({ type: "session_started" }));
    };

    elevenLabsSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("ElevenLabs message:", data.type);
        
        // Forward transcription events to client
        if (data.type === "partial_transcript" || data.type === "committed_transcript") {
          socket.send(JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error parsing ElevenLabs message:", error);
      }
    };

    elevenLabsSocket.onerror = (error) => {
      console.error("ElevenLabs WebSocket error:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: "Connection to transcription service failed" 
      }));
    };

    elevenLabsSocket.onclose = () => {
      console.log("ElevenLabs connection closed");
      socket.send(JSON.stringify({ type: "session_ended" }));
    };
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Forward audio chunks to ElevenLabs
      if (message.type === "audio_chunk" && elevenLabsSocket?.readyState === WebSocket.OPEN) {
        elevenLabsSocket.send(JSON.stringify({
          type: "input_audio_chunk",
          audio_chunk: message.audio_chunk,
        }));
      }
    } catch (error) {
      console.error("Error processing client message:", error);
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    if (elevenLabsSocket) {
      elevenLabsSocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error("Client socket error:", error);
    if (elevenLabsSocket) {
      elevenLabsSocket.close();
    }
  };

  return response;
});
