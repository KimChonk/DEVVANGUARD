import React, { useState, useEffect } from "react";
import "../assets/CSS/npcguide.css";

/**
 * NPC Guide v2 - Simplified with typing animation
 */
export default function NPCGuide({ 
  lessonTitle, 
  feedback, 
  status = "idle",
  autoClose = true 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");

  // NPC personality responses - simplified
  const npcResponses = {
    welcome: `Xin chào, Knight! Tôi là Master OogWay. Hôm nay chúng ta sẽ chiến đấu với bài toán: "${lessonTitle}". Hãy lắng nghe lời khuyên của tôi để chiến thắng!`,
    
    hint: [
      "💡 Tiếp! Bạn gần đã làm đúng rồi. Hãy suy nghĩ kỹ hơn!",
      "💭 Mẹo: Hãy kiểm tra đầu vào và đầu ra của bạn.",
      "🤔 Bạn cần xử lý các trường hợp đặc biệt!",
      "✨ Bộ óc của bạn có sẵn những gì bạn cần."
    ],

    error: [
      "❌ Ôi không! Có gì đó không đúng rồi...",
      "😬 Output không khớp với yêu cầu.",
      "🔥 Code của bạn bị vấn đề gì đó!",
      "⚡ Hãy xem lại logic của bạn."
    ],

    success: [
      "🎉 Tuyệt vời! Bạn đã làm đúng!",
      "✅ Hoàn hảo! Bài này bạn quá giỏi!",
      "🏆 Wow! Bạn xứng đáng là một Knight thực thụ!",
      "⭐ Sức mạnh của bạn ngày càng tăng!"
    ],

    thinking: "⚡ Để tôi xem xét code của bạn..."
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
        
        // Auto-close after message completes
        if (autoClose && status !== "error") {
          const timer = setTimeout(() => {
            setIsVisible(false);
          }, 2000);
          return () => clearTimeout(timer);
        }
      }
    }, 30); // Speed of typing (30ms per character)

    return () => clearInterval(interval);
  }, [currentMessage, autoClose, status]);

  // Update message based on feedback and status
  useEffect(() => {
    if (feedback && status !== "idle") {
      setIsVisible(true);
      setDisplayedText("");

      let messageToDisplay = "";

      if (status === "thinking") {
        messageToDisplay = npcResponses.thinking;
      } else if (status === "success") {
        const successMsg = npcResponses.success[
          Math.floor(Math.random() * npcResponses.success.length)
        ];
        messageToDisplay = successMsg + " " + feedback;
      } else if (status === "error") {
        const errorMsg = npcResponses.error[
          Math.floor(Math.random() * npcResponses.error.length)
        ];
        messageToDisplay = errorMsg + " " + feedback;
      } else if (status === "hint") {
        const hintMsg = npcResponses.hint[
          Math.floor(Math.random() * npcResponses.hint.length)
        ];
        messageToDisplay = hintMsg;
      } else if (status === "welcome") {
        messageToDisplay = npcResponses.welcome;
      }

      setCurrentMessage(messageToDisplay);
    }
  }, [feedback, status]);

  return (
    <div className="npc-guide-v2">
      <div className="npc-container">
        {/* NPC Avatar with Name */}
        <div className="npc-avatar-section">
          <div className="npc-avatar-v2">
            <img 
              src="/icons/masterOogWay.png" 
              alt="Mystery Wizard"
              className="npc-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            {/* Fallback avatar if image not found */}
            <div className="npc-fallback">🧙‍♂️</div>
          </div>
          <div className="npc-name">Mystery Wizard</div>
        </div>

        {/* Speech Bubble */}
        <div className={`speech-bubble-v2 ${status}`}>
          <div className="speech-content-v2">
            <p className="speech-text-v2">{displayedText}</p>
            {displayedText.length > 0 && displayedText.length === currentMessage.length && (
              <div className="message-complete">
                <button 
                  className="close-btn"
                  onClick={() => setIsVisible(false)}
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <div className="bubble-pointer-v2"></div>
        </div>
      </div>

      {/* Typing indicator */}
      {displayedText.length < currentMessage.length && (
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </div>
  );
}
