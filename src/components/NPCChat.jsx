import React, { useState, useEffect } from 'react';
import '../assets/CSS/npcchat.css';
import { getNPCResponse, getNPCHint, getNPCCodeFeedback } from '../services/npcAIService';

/**
 * NPC Chat Component - AI-powered with Supabase Edge Function
 * Integrated with Google Gemini via npcAIService
 */
export default function NPCChat({ 
  feedback, 
  status = 'idle',
  autoClose = true,
  problemDescription = '',
  userCode = '',
  onAskNPC = null // Callback to ask custom question
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [conversationMode, setConversationMode] = useState(false); // true = AI chat mode, false = auto feedback mode

  // Fallback NPC responses when AI not available
  const npcResponses = {
    welcome: `Xin chào, Knight! Tôi là Mystery Wizard. Hôm nay chúng ta sẽ chiến đấu với bài toán này. Hãy lắng nghe lời khuyên của tôi để chiến thắng!`,
    
    hint: [
      '💡 Tiếp! Bạn gần đã làm đúng rồi. Hãy suy nghĩ kỹ hơn!',
      '💭 Mẹo: Hãy kiểm tra đầu vào và đầu ra của bạn.',
      '🤔 Bạn cần xử lý các trường hợp đặc biệt!',
      '✨ Bộ óc của bạn có sẵn những gì bạn cần.'
    ],

    error: [
      '❌ Ôi không! Có gì đó không đúng rồi...',
      '😬 Output không khớp với yêu cầu.',
      '🔥 Code của bạn bị vấn đề gì đó!',
      '⚡ Hãy xem lại logic của bạn.'
    ],

    success: [
      '🎉 Tuyệt vời! Bạn đã làm đúng!',
      '✅ Hoàn hảo! Bài này bạn quá giỏi!',
      '🏆 Wow! Bạn xứng đáng là một Knight thực thụ!',
      '⭐ Sức mạnh của bạn ngày càng tăng!'
    ],

    thinking: '⚡ Để tôi xem xét code của bạn...',
    aiThinking: '⚡ Mystery Wizard đang suy nghĩ...'
  };

  // Handle asking NPC a question (AI mode)
  const handleAskNPC = async (question = null) => {
    const messageToSend = question || userInput.trim();
    
    if (!messageToSend) {
      setCurrentMessage('Vui lòng hỏi tôi điều gì đó, Knight!');
      setIsVisible(true);
      return;
    }

    setIsLoading(true);
    setConversationMode(true);
    setUserInput('');
    setCurrentMessage(npcResponses.aiThinking);
    setDisplayedText('');
    setIsVisible(true);

    try {
      const result = await getNPCResponse(
        messageToSend,
        problemDescription,
        userCode
      );

      if (result.success && result.reply) {
        setCurrentMessage(result.reply);
        setDisplayedText('');
      } else {
        setCurrentMessage(result.reply || 'Hmm... Phép thuật của tôi bị gián đoạn. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error getting NPC response:', error);
      setCurrentMessage('Ôi không! Kết nối bị mất. Hãy thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle hint request
  const handleGetHint = async () => {
    setIsLoading(true);
    setConversationMode(true);
    setCurrentMessage(npcResponses.aiThinking);
    setDisplayedText('');
    setIsVisible(true);

    try {
      const result = await getNPCHint(problemDescription, userCode);
      if (result.success && result.reply) {
        setCurrentMessage(result.reply);
      } else {
        setCurrentMessage(result.reply || 'Hmm... Tôi không có gợi ý gì lúc này.');
      }
    } catch (error) {
      setCurrentMessage('Không thể lấy gợi ý. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code feedback request
  const handleGetFeedback = async () => {
    setIsLoading(true);
    setConversationMode(true);
    setCurrentMessage(npcResponses.aiThinking);
    setDisplayedText('');
    setIsVisible(true);

    try {
      const result = await getNPCCodeFeedback(problemDescription, userCode);
      if (result.success && result.reply) {
        setCurrentMessage(result.reply);
      } else {
        setCurrentMessage(result.reply || 'Code của bạn có vẻ... cần cải thiện.');
      }
    } catch (error) {
      setCurrentMessage('Không thể phân tích code. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Typing animation effect
  useEffect(() => {
    if (!currentMessage) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < currentMessage.length) {
        setDisplayedText(currentMessage.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30); // Speed of typing

    return () => clearInterval(interval);
  }, [currentMessage]);

  // Update message based on feedback and status
  useEffect(() => {
    if (feedback && status !== 'idle') {
      setIsVisible(true);
      setDisplayedText('');

      let messageToDisplay = '';

      if (status === 'thinking') {
        messageToDisplay = npcResponses.thinking;
      } else if (status === 'success') {
        const successMsg = npcResponses.success[
          Math.floor(Math.random() * npcResponses.success.length)
        ];
        messageToDisplay = successMsg + ' ' + feedback;
      } else if (status === 'error') {
        const errorMsg = npcResponses.error[
          Math.floor(Math.random() * npcResponses.error.length)
        ];
        messageToDisplay = errorMsg + ' ' + feedback;
      } else if (status === 'hint') {
        const hintMsg = npcResponses.hint[
          Math.floor(Math.random() * npcResponses.hint.length)
        ];
        messageToDisplay = hintMsg;
      } else if (status === 'welcome') {
        messageToDisplay = npcResponses.welcome;
      }

      setCurrentMessage(messageToDisplay);
    }
  }, [feedback, status]);

  return (
    <div className={`npc-chat-container ${isVisible ? 'visible' : ''}`}>
      {/* NPC Header */}
      <div className="npc-chat-header">
        <div className="npc-avatar-small">
          <img 
            src="/icons/masterOogWay.png" 
            alt="Mystery Wizard"
            className="npc-image-small"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'block';
              }
            }}
          />
          <div className="npc-fallback-small">🧙‍♂️</div>
        </div>
        <div className="npc-header-info">
          <h3 className="npc-title">Mystery Wizard</h3>
          <p className="npc-status">
            {isLoading ? '💭 Thinking...' : (conversationMode ? '💬 AI Mode' : 'Ready')}
          </p>
        </div>
      </div>

      {/* Message Area */}
      <div className={`npc-message ${status} ${isLoading ? 'loading' : ''}`}>
        {isVisible ? (
          <>
            <p className="npc-text">{displayedText}</p>
            {displayedText.length < currentMessage.length && (
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </>
        ) : (
          <p className="npc-placeholder">Đợi lệnh của bạn, Knight...</p>
        )}
      </div>

      {/* AI Conversation Mode - Input & Quick Actions */}
      {conversationMode && (
        <div className="npc-ai-controls">
          {/* Quick Action Buttons */}
          <div className="npc-quick-actions">
            <button 
              className="npc-btn-hint"
              onClick={handleGetHint}
              disabled={isLoading}
              title="Nhận một gợi ý từ NPC"
            >
              💡 Gợi ý
            </button>
            <button 
              className="npc-btn-feedback"
              onClick={handleGetFeedback}
              disabled={isLoading}
              title="Nhận phản hồi về code"
            >
              📝 Phản hồi
            </button>
          </div>

          {/* Text Input */}
          <div className="npc-input-area">
            <input
              type="text"
              className="npc-input"
              placeholder="Hỏi NPC một câu hỏi..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleAskNPC();
                }
              }}
              disabled={isLoading}
            />
            <button
              className="npc-send-btn"
              onClick={() => handleAskNPC()}
              disabled={isLoading || !userInput.trim()}
              title="Gửi tin nhắn cho NPC"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}

      {/* Toggle Conversation Mode - Visible when not in AI mode */}
      {!conversationMode && isVisible && (
        <button
          className="npc-toggle-chat"
          onClick={() => setConversationMode(true)}
          title="Bắt đầu nói chuyện với NPC"
        >
          💬 Hỏi NPC
        </button>
      )}
    </div>
  );
}
