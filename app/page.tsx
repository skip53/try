'use client';

import { useState } from 'react';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    try {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: ''
      }]);

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
          messages: [{ 
            role: "user", 
            content: message 
          }],
          temperature: 0.4,
          max_tokens: 3000,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 解码并处理数据
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              if (jsonStr.trim() === '[DONE]') continue;
              
              try {
                const jsonData = JSON.parse(jsonStr);
                const content = jsonData.choices[0].delta.content || '';
                accumulatedContent += content;

                // 更新消息内容
                setMessages(prev => prev.map((msg, idx) => 
                  idx === prev.length - 1
                    ? { ...msg, content: `### 回答\n${accumulatedContent}` }
                    : msg
                ));
              } catch (e) {
                console.error('JSON parse error:', e);
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，请求失败。可能原因：\n1. API密钥无效\n2. 网络连接问题\n3. 服务器错误'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="w-full bg-gradient-to-b from-white to-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6 py-12 flex items-center gap-12">
          {/* 左侧介绍文案 */}
          <div className="w-[480px] flex-shrink-0 pt-12">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/images/savingsLogo.png"
                alt="一滤了然 Logo"
                width={360}
                height={120}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text animate-gradient">
              一滤了然问答系统
            </h1>
            <div className="space-y-6 mb-12">
              <p className="text-xl text-gray-600 leading-relaxed pl-4 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent py-2">
                基于公司 23 年案例沉淀，为您提供准确、可信的解决方案。
              </p>
              <p className="text-xl text-gray-600 leading-relaxed pl-4 border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-transparent py-2">
                无论技术疑难还是行业知识，都能帮您一滤了然。
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                已服务 5000+ 用户
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                98% 满意度
              </div>
            </div>
          </div>

          {/* 右侧聊天界面 */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
              {/* 聊天区域 */}
              <div className="h-[800px] flex flex-col">
                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        开始您的对话
                      </h2>
                      <p className="text-lg text-gray-600 max-w-lg">
                        输入您的问题，AI 助手将为您提供专业的解答
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <ChatMessage
                          key={index}
                          role={message.role}
                          content={message.content}
                        />
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-50 rounded-2xl px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 输入区域 */}
                <div className="border-t border-gray-100 bg-white p-8">
                  <ChatInput onSendMessage={handleSendMessage} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
