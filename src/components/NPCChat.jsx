import React, { useState, useEffect, useContext } from 'react';
import '../assets/CSS/npcchat.css';
import { getNPCResponse, getNPCHint, getNPCCodeFeedback } from '../services/npcAIService';
import { formatNPCResponse } from '../utils/npcResponseFormatter';
import AuthContext from '../contexts/AuthContext';

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

  const { user } = useContext(AuthContext);

  // Fallback NPC responses when AI not available
  const npcResponses = {
    welcome: (userName = 'Knight') => `Hello, ${userName}! I am the Mystery Wizard. Today we will battle this problem. Listen to my advice to win!`,

    hint: [
      'Keep going! You are almost there. Think harder!',
      'Tip: Check your input and output.',
      'You need to handle special cases!',
      'Your mind has what you need.'
    ],

    error: [
      'Oh no! Something is wrong...',
      'Output does not match the requirements.',
      'Your code has some issues!',
      'Review your logic.'
    ],

    success: [
      'Excellent! You got it right!',
      'Perfect! You are great at this!',
      'Wow! You are a true Knight!',
      'Your strength is growing!'
    ],

    thinking: 'Let me examine your code...',
    aiThinking: 'Mystery Wizard is thinking...'
  };

  // Handle asking NPC a question (AI mode)
  const handleAskNPC = async (question = null) => {
    const messageToSend = question || userInput.trim();
    
    if (!messageToSend) {
      setCurrentMessage('Please ask me something, Knight!');
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
      console.log('📨 Asking NPC:', messageToSend);
      const result = await getNPCResponse(
        messageToSend,
        problemDescription,
        userCode
      );

      console.log('📩 NPC Response:', result);

      if (result.success && result.reply) {
        console.log('✅ Setting AI reply:', result.reply);
        setDisplayedText('');
        setCurrentMessage(result.reply);
      } else {
        console.warn('Warning: NPC failed but has reply:', result.reply);
        setDisplayedText('');
        setCurrentMessage(result.reply || 'Hmm... My magic is interrupted. Please try again.');
      }
    } catch (error) {
      console.error('Error getting NPC response:', error);
      setDisplayedText('');
      setCurrentMessage('Oh no! Connection lost. Try again later.');
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
      console.log('💡 Asking for hint...');
      const result = await getNPCHint(problemDescription, userCode);
      
      console.log('💡 Hint Response:', result);
      
      if (result.success && result.reply) {
        console.log('✅ Setting hint:', result.reply);
        setDisplayedText('');
        setCurrentMessage(result.reply);
      } else {
        console.warn('Warning: Hint failed but has reply:', result.reply);
        setDisplayedText('');
        setCurrentMessage(result.reply || 'Hmm... I have no hints right now.');
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      setDisplayedText('');
      setCurrentMessage('Cannot get hint. Please try again.');
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
      console.log('📝 Asking for code feedback...');
      const result = await getNPCCodeFeedback(problemDescription, userCode);
      
      console.log('📝 Feedback Response:', result);
      
      if (result.success && result.reply) {
        console.log('✅ Setting feedback:', result.reply);
        setDisplayedText('');
        setCurrentMessage(result.reply);
      } else {
        console.warn('Warning: Feedback failed but has reply:', result.reply);
        setDisplayedText('');
        setCurrentMessage(result.reply || 'Your code seems... needs improvement.');
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      setDisplayedText('');
      setCurrentMessage('Cannot analyze code. Please try again.');
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
        messageToDisplay = npcResponses.welcome(user?.name || 'Knight');
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
          <div className="npc-fallback-small">Wizard</div>
        </div>
        <div className="npc-header-info">
          <h3 className="npc-title">Mystery Wizard</h3>
          <p className="npc-status">
            {isLoading ? 'Thinking...' : (conversationMode ? 'AI Mode' : 'Ready')}
          </p>
        </div>
      </div>

      {/* Message Area */}
      <div className={`npc-message ${status} ${isLoading ? 'loading' : ''}`}>
        {isVisible ? (
          <>
            <div 
              className="npc-text"
              dangerouslySetInnerHTML={{ __html: formatNPCResponse(displayedText) }}
            />
            {displayedText.length < currentMessage.length && (
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </>
        ) : (
          <p className="npc-placeholder">Waiting for your command, Knight...</p>
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
              title="Get a hint from NPC"
            >
              Hint
            </button>
            <button
              className="npc-btn-feedback"
              onClick={handleGetFeedback}
              disabled={isLoading}
              title="Get feedback on code"
            >
              Feedback
            </button>
          </div>

          {/* Text Input */}
          <div className="npc-input-area">
            <input
              type="text"
              className="npc-input"
              placeholder="Ask NPC a question..."
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
              title="Send message to NPC"
            >
              {isLoading ? 'Loading' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Toggle Conversation Mode - Visible when not in AI mode */}
      {!conversationMode && isVisible && (
        <button
          className="npc-toggle-chat"
          onClick={() => setConversationMode(true)}
          title="Start talking to NPC"
        >
          Ask NPC
        </button>
      )}
    </div>
  );
}
