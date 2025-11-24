import React, { useState, useEffect, useRef } from 'react';
import { Menu, Plus, Settings, Sparkles, Send, Mic, StopCircle, Zap, BrainCircuit, X } from 'lucide-react';
import { ChatMessage, AstraConfig, MessageRole } from './types';
import { streamAstraResponse } from './services/gemini';
import { MessageBubble } from './components/MessageBubble';
import { Sidebar } from './components/Sidebar';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [config, setConfig] = useState<AstraConfig>({
    mode: 'fast', // 'fast' or 'deep'
    useSearch: false,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'init-1',
        role: MessageRole.ASSISTANT,
        content: "Hello! I am **Astra-X**, India's fastest and most advanced AI system.",
        timestamp: Date.now(),
      }
    ]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
  };

  const handleLoadChat = (topic: string) => {
      if (topic.includes("Project Veda")) {
          setMessages([
              {
                  id: 'veda-req',
                  role: MessageRole.USER,
                  content: "Create a fully custom LLM architecture for my AI Chat Box. The LLM must be fast, accurate, multilingual (Gujarati, Hindi, English), and optimized for coding.",
                  timestamp: Date.now() - 10000,
              },
              {
                  id: 'veda-res',
                  role: MessageRole.ASSISTANT,
                  content: `### 1. Model Name: **Veda-X 7B** (Agni-Code / Tark-AI)

### 2. Architecture (Hybrid MoE)
*   **Type:** Decoded-only Transformer with MoE (8 Experts, Top-2 Gating)
*   **Params:** 7B (Active: 2.1B per token)
*   **Context:** 32k tokens (RoPE)
*   **Attention:** FlashAttention-2 (GQA)
*   **Vocab:** 64k (Optimized for Indic Scripts)

### 3. Training Pipeline
*   **Data:** The Stack v2 (Code), Samanantar (Indic), OpenWebMath.
*   **Method:** QLoRA Fine-tuning on Mistral-7B base.
*   **Hardware:** 1x RTX 4090 (24GB) via 4-bit quantization.

### 4. Implementation Code
I have generated the following files for you in the \`veda_llm/\` directory:
*   \`veda_llm/train.py\`: Full PyTorch training loop with QLoRA.
*   \`veda_llm/api_server.py\`: Ray Serve backend with auto-scaling.
*   \`veda_llm/requirements.txt\`: Dependencies.

### 5. Deployment
Use **vLLM** for the engine and **FastAPI** for the interface.`,
                  timestamp: Date.now(),
              }
          ]);
      } else if (topic.includes("100k")) {
          setMessages([
              {
                  id: '100k-req',
                  role: MessageRole.USER,
                  content: "How can I architect this system to handle 100,000 concurrent requests?",
                  timestamp: Date.now() - 10000,
              },
              {
                  id: '100k-res',
                  role: MessageRole.ASSISTANT,
                  content: `To handle **100,000 concurrent requests**, a single server will crash immediately. We need a "Hyper-Scale" distributed architecture.

### 🚀 High-Scale Architecture Plan

**1. Inference Layer (The Bottleneck)**
*   **Framework:** **Ray Serve** (Distributed Python).
*   **Engine:** **vLLM** (Continuous Batching).
*   **Scaling:** 200 to 500 Replicas (GPUs) required.
*   **Throughput:** Each A100 GPU handles ~200 req/sec via batching.

**2. Infrastructure Layer**
*   **Orchestrator:** **Kubernetes (K8s)** with KubeRay.
*   **Load Balancing:** AWS ALB -> NGINX Ingress -> Ray Head Node.
*   **Queue:** Redis Streams / Kafka (Buffer for traffic spikes).

**3. Code Implementation**
I have updated your backend files to support this scale:

*   **\`veda_llm/api_server.py\`**: Migrated from FastAPI to **Ray Serve** for auto-scaling and batching.
*   **\`veda_llm/scale_config.yaml\`**: Added Kubernetes Autoscaler config to spin up 800 GPUs.

### Why Ray Serve?
It allows "Pipeline Parallelism". We can split the model across multiple GPUs and handle HTTP requests asynchronously without blocking.`,
                  timestamp: Date.now(),
              }
          ]);
      } else {
          // Placeholder for other history items
          setMessages([
              {
                  id: `hist-${Date.now()}`,
                  role: MessageRole.ASSISTANT,
                  content: `reloaded session: **${topic}**\n\n(This is a simulated history item for demonstration.)`,
                  timestamp: Date.now(),
              }
          ]);
      }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    
    // Create placeholder for Astra's response
    const astraMsgId = (Date.now() + 1).toString();
    const astraPlaceholder: ChatMessage = {
      id: astraMsgId,
      role: MessageRole.ASSISTANT,
      content: '', // Will fill this incrementally
      timestamp: Date.now(),
      isThinking: true,
    };
    
    setMessages(prev => [...prev, astraPlaceholder]);

    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Prepare history for API
      const historyForApi = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      // Add current user message
      historyForApi.push({ role: MessageRole.USER, content: userMsg.content });

      let fullResponseText = '';

      await streamAstraResponse(
        historyForApi,
        config,
        (chunkText) => {
            fullResponseText += chunkText;
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === astraMsgId 
                    ? { ...msg, content: fullResponseText, isThinking: false } 
                    : msg
                )
            );
        },
        controller.signal
      );

    } catch (error) {
      // If aborted, we don't treat it as an error
      if (controller.signal.aborted) {
          return;
      }
      console.error("Error generating response:", error);
      setMessages(prev => 
        prev.map(msg => 
            msg.id === astraMsgId 
            ? { ...msg, content: "⚠️ Connection interrupted. Please try again.", isThinking: false, isError: true } 
            : msg
        )
      );
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
      // Focus back on input after sending (desktop mostly)
      if (window.innerWidth > 768) {
          inputRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMode = () => {
    setConfig(prev => ({
      ...prev,
      mode: prev.mode === 'fast' ? 'deep' : 'fast'
    }));
  };

  return (
    <div className="flex h-screen bg-deep-bg text-slate-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-deep-card border-r border-deep-border transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          onNewChat={() => setMessages([messages[0]])} 
          onLoadChat={handleLoadChat}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        {/* Header */}
        <header className="h-16 border-b border-deep-border flex items-center justify-between px-4 bg-deep-bg/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
                    Astra-X
                </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <button
                onClick={toggleMode}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300
                    ${config.mode === 'deep' 
                        ? 'bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                        : 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                    }
                `}
            >
                {config.mode === 'deep' ? <BrainCircuit size={14} /> : <Zap size={14} />}
                <span>{config.mode === 'deep' ? 'Deep Reason' : 'Fast Mode'}</span>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isThinking && messages[messages.length - 1]?.role === MessageRole.USER && (
             <div className="flex justify-start animate-pulse">
                <div className="bg-deep-card border border-deep-border rounded-2xl rounded-tl-none px-6 py-4 flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-deep-bg border-t border-deep-border">
          <div className="max-w-4xl mx-auto relative group">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={config.mode === 'deep' ? "Ask a complex reasoning question..." : "Ask Astra-X..."}
              className={`
                w-full bg-deep-card text-white placeholder-slate-400 rounded-2xl border 
                ${config.mode === 'deep' ? 'border-purple-500/30 focus:border-purple-500' : 'border-deep-border focus:border-blue-500'}
                pl-5 pr-28 py-4 focus:outline-none focus:ring-1 
                ${config.mode === 'deep' ? 'focus:ring-purple-500/50' : 'focus:ring-blue-500/50'}
                resize-none shadow-xl transition-all
              `}
              rows={1}
              style={{ minHeight: '60px', maxHeight: '200px' }}
            />
            
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {isThinking && (
                    <button
                        onClick={handleStop}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20 animate-fade-in"
                        title="Stop generating"
                    >
                        <StopCircle size={20} />
                    </button>
                )}
                <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isThinking}
                className={`
                    p-2 rounded-xl transition-all
                    ${input.trim() && !isThinking
                        ? (config.mode === 'deep' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white')
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }
                `}
                >
                {isThinking ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Send size={20} />
                )}
                </button>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-500">
                Astra-X
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
