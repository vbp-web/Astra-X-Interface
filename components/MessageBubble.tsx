import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageRole, ChatMessage } from '../types';
import { User, Sparkles, Copy, Check, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-4 max-w-4xl w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1
          ${isUser ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]'}
        `}>
          {isUser ? <User size={16} className="text-slate-300" /> : <Sparkles size={16} className="text-white" />}
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-hidden ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
             <span className="text-xs font-medium text-slate-400">
                {isUser ? 'You' : 'Astra-X'}
             </span>
             {!isUser && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    AI
                </span>
             )}
          </div>

          <div className={`
            prose prose-invert max-w-none rounded-2xl px-5 py-4 text-sm md:text-base leading-relaxed
            ${isUser 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-deep-card border border-deep-border/60 text-slate-200 rounded-tl-none shadow-sm'
            }
          `}>
             {isUser ? (
                 <p className="whitespace-pre-wrap">{message.content}</p>
             ) : (
                <ReactMarkdown
                    components={{
                        code({node, inline, className, children, ...props}: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <div className="relative group my-4 rounded-lg overflow-hidden border border-deep-border bg-[#1e1e1e]">
                                    <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-deep-border">
                                        <div className="flex items-center gap-2">
                                            <Terminal size={12} className="text-slate-400" />
                                            <span className="text-xs text-slate-300 font-mono">{match[1]}</span>
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(String(children))}
                                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {copied ? <Check size={12} /> : <Copy size={12} />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                </div>
                            ) : (
                                <code className={`${inline ? 'bg-slate-700/50 px-1.5 py-0.5 rounded text-blue-200 font-mono text-xs' : ''}`} {...props}>
                                    {children}
                                </code>
                            );
                        },
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 border-b border-deep-border pb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mb-3 mt-5" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-white mb-2 mt-4" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-4 space-y-1 text-slate-300" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-4 space-y-1 text-slate-300" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-400 hover:underline hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500/50 pl-4 py-1 my-4 bg-blue-500/5 rounded-r italic text-slate-400" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-deep-border"><table className="min-w-full divide-y divide-deep-border bg-deep-bg/50" {...props} /></div>,
                        th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider bg-deep-card" {...props} />,
                        td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-300 border-t border-deep-border/50" {...props} />,
                    }}
                >
                    {message.content}
                </ReactMarkdown>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};