export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isThinking?: boolean;
  isError?: boolean;
}

export interface AstraConfig {
  mode: 'fast' | 'deep';
  useSearch: boolean;
}

export interface SidebarProps {
    onNewChat: () => void;
    onLoadChat: (topic: string) => void;
    onClose: () => void;
}