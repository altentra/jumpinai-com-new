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

  socket.onopen = async () => {
    console.log("Client connected to relay");
    
    try {
      // Generate a single-use token for WebSocket authentication
      console.log("Generating single-use token from ElevenLabs...");
      const tokenResponse = await fetch('https://api.elevenlabs.io/v1/single-use-token/realtime_scribe', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to generate token: ${tokenResponse.status} ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      const token = tokenData.token;
      
      if (!token) {
        throw new Error('No token received from ElevenLabs');
      }

      console.log("Token generated successfully, connecting to WebSocket...");
      
      // Connect to ElevenLabs Realtime API using token
      const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&language_code=en&audio_format=pcm_16000&commit_strategy=vad&token=${token}`;
      
      console.log("Connecting to ElevenLabs with model: scribe_v2_realtime");
      elevenLabsSocket = new WebSocket(wsUrl);
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: `Failed to create connection: ${error.message}` 
      }));
      return;
    }

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
      const errorMessage = error instanceof Error ? error.message : "Connection to transcription service failed";
      console.error("Error details:", errorMessage);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: `ElevenLabs connection failed: ${errorMessage}` 
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
