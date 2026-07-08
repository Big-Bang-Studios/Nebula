```react
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, Sparkles, Clock, Settings, Film, History, Loader2, Share2, Wand2, MonitorPlay, Menu, X, RefreshCw, CloudRain, Snowflake, Flame, Wind, Zap, Gauge, Volume2, VolumeX, Palette, Layers, ChevronRight, ChevronLeft, Download } from 'lucide-react';

/**
 * NEBULA AI VIDEO GENERATOR (v6.6 - Bulletproof Vercel Edition)
 * * Features:
 * * - ZERO backticks used (Prevents GitHub/Mobile clipboard corruption)
 * * - Frame Download feature in player
 * * - Extra descriptions for FX and Turbo modes
 * * - Custom Nebula SVG Brand Logo
 * * - Multi-Frame Generation (Sequences)
 * * - Smart Video Player with Invisible Controls
 * * - Procedural Audio
 */

// --- CUSTOM NEBULA LOGO ---
const NebulaIcon = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="nebulaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="nebulaGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <ellipse cx="50" cy="50" rx="38" ry="12" transform="rotate(-30 50 50)" stroke="url(#nebulaGrad1)" strokeWidth="4" strokeLinecap="round" filter="url(#glow)"/>
    <ellipse cx="50" cy="50" rx="38" ry="12" transform="rotate(30 50 50)" stroke="url(#nebulaGrad2)" strokeWidth="4" strokeLinecap="round" filter="url(#glow)"/>
    <path d="M50 25 L53 45 L75 50 L53 55 L50 75 L47 55 L25 50 L47 45 Z" fill="white" filter="url(#glow)"/>
    <circle cx="50" cy="50" r="4" fill="#ffffff" />
  </svg>
);

// --- AUDIO ENGINE ---
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.oscillators = [];
    this.gainNode = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }
  }

  async resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  }

  playAtmosphere(type) {
    this.init();
    this.stop(); 
    if (this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(t);
    this.gainNode.gain.setValueAtTime(0.1, t);

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    
    if (type === "rain") {
      filter.type = "lowpass";
      filter.frequency.value = 600; 
      this.gainNode.gain.value = 0.2;
    } else if (type === "fast") {
      filter.type = "lowpass";
      filter.frequency.value = 200; 
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.linearRampToValueAtTime(150, t + 5); 
      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.08;
      osc.connect(oscGain).connect(this.ctx.destination);
      this.oscillators.push(osc);
      osc.start();
    } else if (type === "anime") {
        filter.type = "highpass";
        filter.frequency.value = 800;
        this.gainNode.gain.value = 0.05;
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 880; 
        const oscGain = this.ctx.createGain();
        oscGain.gain.value = 0.05;
        osc.connect(oscGain).connect(this.ctx.destination);
        this.oscillators.push(osc);
        osc.start();
    } else {
      filter.type = "lowpass";
      filter.frequency.value = 100;
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 50; 
      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.15;
      osc.connect(oscGain).connect(this.ctx.destination);
      this.oscillators.push(osc);
      osc.start();
    }

    noise.connect(filter).connect(this.gainNode);
    noise.start();
    this.oscillators.push(noise);
  }

  stop() {
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.oscillators = [];
  }

  setMute(muted) {
    this.isMuted = muted;
    if (this.gainNode && this.ctx) {
       const t = this.ctx.currentTime;
       this.gainNode.gain.setTargetAtTime(muted ? 0 : 0.1, t, 0.1);
    }
  }
}

const audioEngine = new AudioSynth();


// --- VFX COMPONENTS ---

const FilmGrain = () => {
  const bgUrl = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")";
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay z-10" 
      style={{
        backgroundImage: bgUrl,
        animation: "grain 1s steps(5) infinite"
      }}
    />
  );
};

const SpeedLines = () => {
  const lines = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    rotate: Math.random() * 360,
    delay: Math.random() * 0.5,
    length: Math.random() * 50 + 50
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex items-center justify-center">
      {lines.map((line, i) => (
        <div 
          key={i} 
          className="absolute bg-gradient-to-r from-transparent via-white/30 to-transparent w-[300px] h-[1px]"
          style={{
            transform: "rotate(" + line.rotate + "deg) translateX(400px)",
            animation: "warpSpeed 0.3s linear infinite",
            animationDelay: line.delay + "s",
            width: line.length + "%"
          }}
        />
      ))}
    </div>
  );
};

const Particles = ({ type }) => {
  const particles = useMemo(() => {
    const count = type === "rain" ? 80 : type === "snow" ? 50 : 30;
    return Array.from({ length: count }).map((_, i) => ({
      left: Math.random() * 100 + "%",
      animationDuration: (Math.random() * 2 + 0.5) + "s",
      animationDelay: -(Math.random() * 2) + "s",
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [type]);

  if (type === "rain") {
    return (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {particles.map((p, i) => (
          <div key={i} className="absolute w-[1px] h-12 bg-blue-100/40"
               style={{
                 left: p.left,
                 top: "-20px",
                 transform: "rotate(10deg)",
                 animation: "rain " + p.animationDuration + " linear infinite",
                 animationDelay: p.animationDelay,
                 opacity: p.opacity
               }}
          />
        ))}
      </div>
    );
  }
  return null;
};

// --- MAIN APP ---

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); 
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  // Settings
  const [activeEffect, setActiveEffect] = useState("none"); 
  const [motionMode, setMotionMode] = useState("fast"); 
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [selectedStyle, setSelectedStyle] = useState("Cinematic");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- PLAYBACK LOGIC ---
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= selectedDuration) {
             setIsPlaying(false);
             audioEngine.stop();
             return 0; 
          }
          return prev + 0.05; 
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedDuration]);

  // Sync Frame Index with Time
  useEffect(() => {
    if (!generatedVideo) return;
    const timePerFrame = selectedDuration / generatedVideo.frames.length;
    const index = Math.floor(currentTime / timePerFrame);
    const safeIndex = Math.min(index, generatedVideo.frames.length - 1);
    setCurrentFrameIndex(safeIndex);
  }, [currentTime, selectedDuration, generatedVideo]);

  // Audio Sync
  useEffect(() => {
    if (isPlaying && generatedVideo) {
      let audioType = generatedVideo.mode === "fast" ? "fast" : generatedVideo.effect;
      if (generatedVideo.style === "Anime") audioType = "anime";
      audioEngine.playAtmosphere(audioType);
    } else {
      audioEngine.stop();
    }
  }, [isPlaying, generatedVideo]);

  useEffect(() => {
    audioEngine.setMute(isMuted);
  }, [isMuted]);

  const togglePlay = async (e) => {
    if (e) e.stopPropagation();
    if (!isPlaying) {
      await audioEngine.resume();
      if (currentTime >= selectedDuration) setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = (e) => {
    if (e) e.stopPropagation();
    if (!generatedVideo || !generatedVideo.frames || generatedVideo.frames.length === 0) return;
    
    const currentFrameData = generatedVideo.frames[currentFrameIndex];
    const link = document.createElement("a");
    link.href = currentFrameData;
    link.download = "nebula_export_" + generatedVideo.id + "_frame.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- GENERATION LOGIC ---
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setProgress(0);
    setGeneratedVideo(null);
    setCurrentTime(0);
    setIsPlaying(false);
    audioEngine.stop();

    const lower = prompt.toLowerCase();
    let effect = "none";
    if (lower.includes("rain")) effect = "rain";
    else if (lower.includes("snow")) effect = "snow";
    
    const baseStyle = selectedStyle === "Cinematic" ? "cinematic shot, 8k, photorealistic, anamorphic lens" :
                      selectedStyle === "Anime" ? "anime style, studio ghibli, vibrant, 2d" :
                      selectedStyle === "3D" ? "3d render, unreal engine 5, volumetric lighting" :
                      "raw photo, dslr, realistic texture";
    
    const sequencePrompts = [
        baseStyle + ", establishing shot, " + prompt,
        baseStyle + ", dynamic action angle, motion blur, " + prompt,
        baseStyle + ", detailed close up shot, depth of field, " + prompt,
        baseStyle + ", wide cinematic perspective, atmospheric, " + prompt
    ];

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 90 ? prev : prev + 2));
    }, 150); 

    try {
      const apiKey = ""; 

      const imagePromises = sequencePrompts.map(p => 
        fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=" + apiKey,
            {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{ prompt: p }],
                parameters: { sampleCount: 1, aspectRatio: aspectRatio === "16:9" ? "16:9" : "9:16" },
            }),
            }
        ).then(res => res.json())
      );

      const results = await Promise.all(imagePromises);
      
      const frames = results.map(data => 
        data.predictions?.[0]?.bytesBase64Encoded 
          ? "data:image/png;base64," + data.predictions[0].bytesBase64Encoded
          : null
      ).filter(Boolean);

      if (frames.length === 0) throw new Error("No frames generated");

      const newVideo = {
        id: Date.now(),
        prompt,
        frames: frames, 
        thumbnail: frames[0],
        timestamp: new Date().toLocaleTimeString(),
        effect,
        mode: motionMode,
        style: selectedStyle,
        duration: selectedDuration 
      };

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setGeneratedVideo(newVideo);
        setActiveEffect(effect);
        setHistory(prev => [newVideo, ...prev]);
        setIsGenerating(false);
        setIsPlaying(false); 
      }, 500);

    } catch (error) {
      console.error(error);
      setIsGenerating(false);
      clearInterval(progressInterval);
    }
  };

  const getTransform = () => {
    const timePerFrame = selectedDuration / (generatedVideo?.frames.length || 1);
    const timeInCurrentFrame = currentTime % timePerFrame;
    const frameProgress = timeInCurrentFrame / timePerFrame;

    if (motionMode === "fast") {
      const scale = 1 + (frameProgress * 0.15); 
      return "scale(" + scale + ")";
    } else {
      return "scale(1.1) translateX(" + (frameProgress * -2) + "%)";
    }
  };

  const formatTime = (time) => {
    const s = Math.floor(time);
    return "00:" + (s < 10 ? "0" : "") + s;
  };

  const handleSeek = (e) => {
    if (!generatedVideo) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    setCurrentTime(percentage * selectedDuration);
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col md:flex-row">
      
      <style>
        {"@keyframes warpSpeed { 0% { opacity: 0; transform: rotate(var(--r)) translateX(100px) scaleX(0.1); } 50% { opacity: 0.8; } 100% { opacity: 0; transform: rotate(var(--r)) translateX(600px) scaleX(1.5); } } @keyframes grain { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-5%, 5%); } } @keyframes rain { 0% { transform: translateY(0); opacity:0; } 20% { opacity:1; } 100% { transform: translateY(600px); opacity:0; } }"}
      </style>

      {/* Sidebar */}
      <div className={"fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex flex-col shrink-0 " + (isSidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-3">
            <NebulaIcon className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">Nebula <span className="text-purple-400 text-xs">SEQ</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white flex items-center gap-1">
             <X className="w-5 h-5"/>
             <span className="text-xs font-medium">Close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Library</h3>
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No videos yet</p>
            </div>
          ) : (
            history.map((video) => (
              <div 
                key={video.id}
                onClick={() => { 
                  setGeneratedVideo(video); 
                  setActiveEffect(video.effect);
                  setMotionMode(video.mode);
                  setSelectedDuration(video.duration);
                  setSelectedStyle(video.style);
                  setIsPlaying(false);
                  setCurrentTime(0);
                  setIsSidebarOpen(false);
                  audioEngine.stop();
                }}
                className={"group relative rounded-xl overflow-hidden cursor-pointer border transition-all shrink-0 " + (generatedVideo && generatedVideo.id === video.id ? "border-purple-500/50 ring-1 ring-purple-500/20" : "border-slate-800 hover:border-slate-700")}
              >
                <img src={video.thumbnail} alt="thumb" className="w-full h-16 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent flex flex-col justify-end p-2">
                   <div className="flex justify-between items-end">
                      <p className="text-xs text-slate-300 font-medium line-clamp-1">{video.prompt}</p>
                      <Layers className="w-3 h-3 text-white/50" />
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-slate-950/50">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
             <NebulaIcon className="w-6 h-6" />
             <span className="font-bold">Nebula Sequence</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-1 text-slate-400 hover:text-white">
             <Menu className="w-5 h-5" />
             <span className="text-xs font-medium">Menu</span>
          </button>
        </div>

        {/* Player Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col items-center">
          
          <div className="w-full max-w-5xl space-y-4 my-auto min-h-[300px]">
            {/* VIDEO CONTAINER */}
            <div className={"relative w-full bg-black rounded-2xl border border-slate-800 shadow-2xl overflow-hidden aspect-video group/video mx-auto " + (!generatedVideo ? "flex items-center justify-center bg-slate-900" : "")}>
              
              {!generatedVideo && !isGenerating ? (
                <div className="text-center space-y-4 max-w-md px-6 flex flex-col items-center">
                  <NebulaIcon className="w-20 h-20 mb-2 opacity-80" />
                  <h2 className="text-2xl font-bold text-white tracking-tight">Nebula Sequence Engine</h2>
                  <p className="text-sm text-slate-400">Generates <span className="text-purple-400 font-bold">multi-shot sequences</span> with synced audio.</p>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
                   <div className="relative w-12 h-12">
                     <svg className="animate-spin w-full h-full text-purple-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                   </div>
                   <div className="text-center">
                       <p className="text-sm font-medium text-white">Generating Sequence...</p>
                       <p className="text-xs text-slate-500 mt-1">Rendering 4 distinct Keyframes</p>
                   </div>
                   {/* Frame Progress Indicator */}
                   <div className="flex gap-2">
                       {[0,1,2,3].map(i => (
                           <div key={i} className={"w-3 h-3 rounded-full " + (progress > (i*25) ? "bg-purple-500" : "bg-slate-800")}></div>
                       ))}
                   </div>
                </div>
              ) : (
                <>
                  {/* --- RENDER ENGINE --- */}
                  <div className="w-full h-full relative overflow-hidden bg-black select-none">
                    
                    {/* 1. Base Image Layer */}
                    <div className="absolute inset-0 w-full h-full">
                         {generatedVideo.frames.map((frame, index) => (
                             <div 
                                key={index}
                                className={"absolute inset-0 w-full h-full transition-opacity duration-0 " + (index === currentFrameIndex ? "opacity-100 z-10" : "opacity-0 z-0")}
                             >
                                <div className="w-full h-full"
                                    style={{
                                        transform: getTransform(),
                                        transition: "transform 0.05s linear",
                                        transformOrigin: "center center"
                                    }}>
                                    <img 
                                        src={frame} 
                                        alt={"Frame " + index}
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                             </div>
                         ))}
                    </div>

                    {/* 2. VFX Layers */}
                    <div className="absolute inset-0 pointer-events-none z-20">
                       <FilmGrain />
                       {isPlaying && motionMode === "fast" && <SpeedLines />}
                       {isPlaying && <Particles type={activeEffect} />}
                    </div>

                    {/* 3. Replay/Start Overlay */}
                    {!isPlaying && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-30 cursor-pointer group/play" onClick={togglePlay}>
                         <div className="flex flex-col items-center gap-3 transform group-hover/play:scale-105 transition-transform duration-300">
                             <div className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-md shadow-2xl">
                                {currentTime >= selectedDuration ? <RefreshCw className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white fill-white ml-1" />}
                             </div>
                             <span className="text-sm font-semibold tracking-wide text-white">
                                {currentTime >= selectedDuration ? "Replay Video" : "Play Video"}
                             </span>
                         </div>
                      </div>
                    )}
                    
                    {/* 4. Controls Overlay */}
                    <div className={"absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 z-40 " + (isPlaying ? "opacity-0 group-hover/video:opacity-100" : "opacity-100")}>
                        <div className="flex items-center gap-4 mb-2">
                           <div 
                             className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer relative group/timeline hover:h-1.5 transition-all"
                             onClick={handleSeek}
                           >
                              <div 
                                className="absolute top-0 left-0 h-full bg-purple-500 rounded-full pointer-events-none" 
                                style={{width: ((currentTime / selectedDuration) * 100) + "%"}}
                              ></div>
                              {/* Frame Markers */}
                              {[1,2,3].map(i => (
                                  <div key={i} className="absolute top-0 w-[1px] h-full bg-black/50" style={{left: ((i/4)*100) + "%"}}></div>
                              ))}
                           </div>
                        </div>

                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              {/* PLAY/PAUSE */}
                              <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors flex items-center gap-1.5">
                                 {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : (currentTime >= selectedDuration ? <RefreshCw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />)}
                                 <span className="text-xs font-semibold hidden sm:inline-block">
                                    {isPlaying ? "Pause" : (currentTime >= selectedDuration ? "Replay" : "Play")}
                                 </span>
                              </button>
                              
                              <span className="text-xs font-mono text-slate-300 ml-2">
                                 {formatTime(currentTime)} / {formatTime(selectedDuration)}
                              </span>
                              
                              {/* MUTE */}
                              <button onClick={() => setIsMuted(!isMuted)} className="text-slate-300 hover:text-white flex items-center gap-1.5 ml-2">
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                <span className="text-xs font-semibold hidden sm:inline-block">{isMuted ? "Unmute" : "Mute"}</span>
                              </button>
                              
                              {/* DOWNLOAD */}
                              <button onClick={handleDownload} className="text-slate-300 hover:text-white flex items-center gap-1.5 ml-2">
                                 <Download className="w-4 h-4" />
                                 <span className="text-xs font-semibold hidden sm:inline-block">Save Frame</span>
                              </button>
                           </div>
                           <div className="flex items-center gap-2">
                               <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{generatedVideo.style}</span>
                           </div>
                        </div>
                      </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Creation Bar */}
        <div className="shrink-0 bg-slate-900/90 border-t border-slate-800 backdrop-blur-lg z-20">
           <div className="max-w-4xl mx-auto flex flex-col">
              
              {/* Input Row */}
              <div className="p-4 flex gap-3 items-stretch">
                 <div className="flex-1 relative">
                    <div className="absolute top-3 left-3">
                      <Wand2 className="w-4 h-4 text-purple-500" />
                    </div>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your scene..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none h-14 text-sm leading-relaxed shadow-inner"
                    />
                 </div>
                 <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="w-24 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg disabled:opacity-50 transition-all flex flex-col items-center justify-center gap-1"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Generate</span>
                  </button>
              </div>

              {/* Bottom Settings Row */}
              <div className="px-4 pb-4 flex flex-wrap gap-y-2 gap-x-6 items-center justify-between text-[10px] sm:text-xs border-t border-slate-800/50 pt-3">
                 
                 <div className="flex flex-wrap gap-4">
                    {/* Style Selector */}
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 uppercase flex items-center gap-1"><Palette className="w-3 h-3"/> Style</span>
                        <div className="flex bg-slate-950 p-1 rounded-md border border-slate-800">
                           {["Cinematic", "Anime", "Realistic", "3D"].map(s => (
                             <button 
                               key={s}
                               onClick={() => setSelectedStyle(s)}
                               className={"px-2 py-0.5 rounded text-[10px] font-medium transition-colors " + (selectedStyle === s ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300")}
                             >
                               {s}
                             </button>
                           ))}
                        </div>
                    </div>

                    {/* Duration Select */}
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <span className="font-bold text-slate-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3"/> Duration</span>
                        <div className="flex bg-slate-950 p-1 rounded-md border border-slate-800">
                           {[8, 15, 20].map(d => (
                             <button 
                               key={d}
                               onClick={() => setSelectedDuration(d)}
                               className={"px-2 py-1 rounded text-[10px] font-medium transition-colors " + (selectedDuration === d ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300")}
                             >
                               {d + "s"}
                             </button>
                           ))}
                        </div>
                    </div>
                 </div>

                 {/* FX Toggles */}
                 <div className="flex items-center gap-2">
                     {/* Aspect */}
                    <div className="flex items-center gap-2 mr-2">
                           <span className="font-bold text-slate-500 uppercase hidden sm:inline-block">Aspect</span>
                           <div className="flex bg-slate-950 p-1 rounded-md border border-slate-800">
                               <button onClick={() => setAspectRatio("16:9")} className={"px-2 py-1 rounded text-[10px] " + (aspectRatio==="16:9" ? "bg-slate-800 text-white" : "text-slate-500")}>16:9</button>
                               <button onClick={() => setAspectRatio("9:16")} className={"px-2 py-1 rounded text-[10px] " + (aspectRatio==="9:16" ? "bg-slate-800 text-white" : "text-slate-500")}>9:16</button>
                           </div>
                    </div>

                    <div className="h-6 w-px bg-slate-700 hidden sm:block mx-1"></div>

                    <button 
                        onClick={() => setActiveEffect(activeEffect === "rain" ? "none" : "rain")} 
                        className={"px-3 py-1 rounded-md border flex flex-col items-center justify-center transition-colors " + (activeEffect === "rain" ? "bg-blue-900/30 border-blue-500/50 text-blue-400" : "border-slate-800 text-slate-500 hover:bg-slate-800")} 
                        title="Rain FX"
                    >
                        <div className="flex items-center gap-1.5">
                           <CloudRain className="w-3 h-3" />
                           <span className="text-[10px] font-semibold uppercase">Rain</span>
                        </div>
                        <span className="text-[7px] font-medium opacity-60 mt-0.5 leading-none">Weather FX</span>
                    </button>
                    <button 
                        onClick={() => setMotionMode(motionMode === "fast" ? "cinematic" : "fast")} 
                        className={"px-3 py-1 rounded-md border flex flex-col items-center justify-center transition-colors " + (motionMode === "fast" ? "bg-red-900/30 border-red-500/50 text-red-400" : "border-slate-800 text-slate-500 hover:bg-slate-800")} 
                        title="Fast Motion"
                    >
                        <div className="flex items-center gap-1.5">
                           <Zap className="w-3 h-3" />
                           <span className="text-[10px] font-semibold uppercase">Turbo</span>
                        </div>
                        <span className="text-[7px] font-medium opacity-60 mt-0.5 leading-none">Fast Motion</span>
                    </button>
                 </div>

              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;


```
