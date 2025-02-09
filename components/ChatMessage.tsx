import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 添加类型声明
declare module 'marked' {
  export interface MarkedOptions {
    highlight?: (code: string, lang: string) => string;
  }
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  // 配置 marked
  marked.setOptions({
    gfm: true,
    breaks: true,
    highlight: function(code, language) {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-2xl px-6 py-4 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white shadow-sm border border-gray-100'
        }`}
      >
        {isUser ? (
          <div className="text-white text-lg">{content}</div>
        ) : (
          <article 
            className="prose prose-slate max-w-none
              prose-headings:font-semibold
              prose-h1:text-xl
              prose-h2:text-lg
              prose-p:text-gray-600
              prose-p:my-2
              prose-ul:my-2
              prose-li:my-0
              prose-pre:bg-gray-50
              prose-pre:border
              prose-pre:border-gray-200
              prose-pre:p-3
              prose-pre:rounded-lg
              prose-code:text-blue-600
              prose-code:bg-blue-50
              prose-code:px-1.5
              prose-code:py-0.5
              prose-code:rounded
              prose-code:before:content-none
              prose-code:after:content-none
              prose-strong:font-semibold
              prose-strong:text-gray-700"
            dangerouslySetInnerHTML={{ 
              __html: marked(content, { sanitize: true }) 
            }}
          />
        )}
      </div>
    </div>
  );
} 