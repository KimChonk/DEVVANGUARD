import React, { useState, useEffect } from 'react';
import '../assets/CSS/interactivegreeting.css';

// Array of greetings for character interactions
const greetings = [
  "What's up? Hakuna matata, good vibes only!",
  "Welcome back, young coder! Let's make some magic!",
  "Ayo! Ready to level up your skills?",
  "Great to see you! Time to code like a warrior!",
  "Let's go! The realm of code awaits!",
  "Hey there! Ready to conquer new challenges?",
  "Welcome, adventurer! Your coding quest begins here!",
  "Lights, camera, action! Let's code something awesome!",
  "Greetings, noble knight! Time for some legendary coding!",
  "Ready to unlock new powers? Let's start learning!"
];

export default function InteractiveGreeting() {
  const [displayText, setDisplayText] = useState('');
  const [currentGreeting, setCurrentGreeting] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isBouncing, setIsBouncing] = useState(false);

  // Typing animation effect
  useEffect(() => {
    if (!isTyping) return;

    const greeting = greetings[currentGreeting];
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex <= greeting.length) {
        setDisplayText(greeting.substring(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 50); // Speed of typing

    return () => clearInterval(typeInterval);
  }, [isTyping, currentGreeting]);

  // Handle character click for bounce and new greeting
  const handleCharacterClick = () => {
    // Trigger bounce animation
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 300);

    // Change to next greeting
    const nextIndex = (currentGreeting + 1) % greetings.length;
    setCurrentGreeting(nextIndex);
    setDisplayText('');
    setIsTyping(true);
  };

  return (
    <div className="interactive-greeting-section">
      <img 
        src="/images/compni.png" 
        alt="Compni" 
        className={`greeting-character ${isBouncing ? 'bounce' : ''}`}
        onClick={handleCharacterClick}
        onError={(e) => {
          e.target.style.display = "none";
        }}
        style={{ cursor: 'pointer' }}
      />
      <div className="greeting-bubble">
        <p className="greeting-text">
          {displayText}
          {isTyping && <span className="typing-cursor">|</span>}
        </p>
      </div>
    </div>
  );
}
