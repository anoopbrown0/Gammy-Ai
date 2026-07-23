import React, { useState, useEffect, useRef } from "react";
import LucideIcon from "./LucideIcon";

interface LiveVoiceCoachProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const LiveVoiceCoach: React.FC<LiveVoiceCoachProps> = ({ isOpen, onClose, isDark = true }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState("Tap to start live voice session");
  const [transcripts, setTranscripts] = useState<Array<{ sender: "user" | "coach"; text: string }>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef(false);

  isMutedRef.current = isMuted;

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      disconnectSession();
    }
    return () => {
      disconnectSession();
    };
  }, [isOpen]);

  const disconnectSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setStatusText("Voice session ended");
  };

  const startSession = async () => {
    setErrorMessage(null);
    setIsConnecting(true);
    setStatusText("Connecting to Gemini Live API...");

    try {
      // Setup output audio context at 24kHz for model audio playback
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // Setup WebSocket connection
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStatusText("Live with Sabit AI Voice Coach. Speak freely!");

        // Request microphone access
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;

          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          inputAudioCtxRef.current = inputCtx;

          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = processor;

          source.connect(processor);
          processor.connect(inputCtx.destination);

          processor.onaudioprocess = (e) => {
            if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
              return;
            }
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert float32 [-1, 1] to PCM 16-bit Little Endian base64
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            // Base64 encode PCM16 bytes
            const bytes = new Uint8Array(pcm16.buffer);
            let binary = "";
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64Audio = btoa(binary);

            ws.send(JSON.stringify({ audio: base64Audio }));
          };
        } catch (micErr: any) {
          console.error("Microphone access error:", micErr);
          setErrorMessage("Microphone access is required for Live Voice Mode.");
          setStatusText("Microphone permission denied");
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.error) {
            setErrorMessage(msg.error);
            setStatusText("Voice Session Error");
            return;
          }

          if (msg.interrupted) {
            setIsSpeaking(false);
            if (outputAudioCtxRef.current) {
              nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
            }
          }

          if (msg.text) {
            setTranscripts((prev) => [...prev, { sender: "coach", text: msg.text }]);
          }

          if (msg.audio && outputAudioCtxRef.current) {
            setIsSpeaking(true);
            playAudioChunk(msg.audio);
          }
        } catch (err) {
          console.error("Error handling WS message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setErrorMessage("Could not establish WebSocket connection to Live API.");
        disconnectSession();
      };

      ws.onclose = () => {
        disconnectSession();
      };
    } catch (err: any) {
      console.error("Failed to start Live session:", err);
      setErrorMessage(err?.message || "Failed to start Live Voice session.");
      disconnectSession();
    }
  };

  const playAudioChunk = (base64Data: string) => {
    try {
      const outputCtx = outputAudioCtxRef.current;
      if (!outputCtx) return;

      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = outputCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = outputCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputCtx.destination);

      const currentTime = outputCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;

      source.onended = () => {
        if (outputCtx.currentTime >= nextStartTimeRef.current - 0.05) {
          setIsSpeaking(false);
        }
      };
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 flex flex-col items-center relative shadow-2xl ${
        isDark ? "bg-[#0F172A] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
            isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <LucideIcon name="X" size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm">
            Live API Voice Mode
          </span>
          <span className="text-xs text-purple-400 font-bold">gemini-3.1-flash-live-preview</span>
        </div>

        <h3 className="text-xl font-black text-center mb-1">Sabit Live Voice Coach</h3>
        <p className="text-xs text-slate-400 text-center max-w-xs mb-8">{statusText}</p>

        {/* Central Audio Visualizer Orb */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Animated pulsing outer rings when active */}
          {isConnected && (
            <>
              <div className={`absolute w-36 h-36 rounded-full animate-ping opacity-20 ${
                isSpeaking ? "bg-purple-500" : "bg-emerald-500"
              }`} />
              <div className={`absolute w-44 h-44 rounded-full animate-pulse opacity-10 ${
                isSpeaking ? "bg-indigo-500" : "bg-blue-500"
              }`} />
            </>
          )}

          {/* Main Voice Orb Button */}
          <button
            onClick={isConnected ? disconnectSession : startSession}
            disabled={isConnecting}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-2xl cursor-pointer relative z-10 border-4 ${
              isConnected
                ? isSpeaking
                  ? "bg-gradient-to-tr from-purple-600 to-indigo-600 border-purple-400 text-white shadow-purple-500/50"
                  : "bg-gradient-to-tr from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-emerald-500/50"
                : "bg-gradient-to-tr from-slate-800 to-slate-900 border-slate-700 text-slate-300 hover:border-purple-500"
            }`}
          >
            {isConnecting ? (
              <LucideIcon name="Loader2" size={36} className="animate-spin text-purple-400" />
            ) : isConnected ? (
              <>
                <LucideIcon name={isSpeaking ? "Volume2" : "Mic"} size={32} className={isSpeaking ? "animate-pulse" : ""} />
                <span className="text-[9px] font-black uppercase tracking-wider mt-1">
                  {isSpeaking ? "Speaking" : "Listening"}
                </span>
              </>
            ) : (
              <>
                <LucideIcon name="Mic" size={32} className="text-purple-400" />
                <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-slate-300">Tap to Start</span>
              </>
            )}
          </button>
        </div>

        {/* Error message banner if any */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Action Controls when connected */}
        {isConnected && (
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl border font-semibold text-xs flex items-center gap-2 transition-colors ${
                isMuted
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  : isDark
                    ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
              }`}
            >
              <LucideIcon name={isMuted ? "MicOff" : "Mic"} size={16} />
              <span>{isMuted ? "Microphone Muted" : "Mute Mic"}</span>
            </button>

            <button
              onClick={disconnectSession}
              className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <LucideIcon name="PhoneOff" size={16} />
              <span>End Call</span>
            </button>
          </div>
        )}

        {/* Live Conversation Transcript Feed */}
        <div className={`w-full h-32 rounded-2xl border p-3 overflow-y-auto space-y-2 text-xs custom-scrollbar ${
          isDark ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          {transcripts.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic text-center pt-8">
              Live conversation speech transcripts will appear here...
            </p>
          ) : (
            transcripts.map((item, index) => (
              <div key={index} className="flex gap-2 leading-relaxed">
                <span className={`font-bold shrink-0 ${item.sender === "user" ? "text-blue-400" : "text-purple-400"}`}>
                  {item.sender === "user" ? "You:" : "Sabit AI:"}
                </span>
                <span>{item.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceCoach;
