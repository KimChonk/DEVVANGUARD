import React, { useState, useEffect } from 'react';
import '../assets/CSS/npcchat.css';

/**
 * NPC Chat Component - Fixed in quest panel
 */
export default function NPCChat({ 
  feedback, 
  status = 'idle',
  autoClose = true 
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // NPC personality responses
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

    thinking: '⚡ Để tôi xem xét code của bạn...'
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
          <p className="npc-status">{status === 'thinking' ? 'Thinking...' : 'Ready'}</p>
        </div>
      </div>

      {/* Message Area */}
      <div className={`npc-message ${status}`}>
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
    </div>
  );
}
