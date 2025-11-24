/**
 * NPC AI Service - Communicate with Supabase Edge Function
 * Integrates with Google Gemini AI via Edge Function
 */

import { supabase } from './supabaseClient';

const EDGE_FUNCTION_URL = 'https://zcjyrssflzlkurmwbowg.supabase.co/functions/v1/npc-chat';

/**
 * Detect language of input text
 * Simple heuristic to detect Vietnamese, English, etc.
 */
function detectLanguage(text) {
  // Vietnamese characters
  const vietnameseChars = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  
  if (vietnameseChars.test(text)) {
    return 'vi';
  }
  return 'en';
}

/**
 * Check if question is related to coding/problem solving
 * Blocks inappropriate or unrelated questions
 */
function isRelevantQuestion(userMessage) {
  const message = userMessage.toLowerCase().trim();
  
  // Blocked keywords (inappropriate/off-topic)
  const blockedKeywords = [
    'troll', 'spam', 'hack', 'cheat', 'inappropriate', 'rude',
    'sexu', 'racist', 'hate', 'kill', 'drug', 'illegal',
    'porn', 'adult', 'xxx', 'nude', 'giải hạn', 'đầu gối',
    'tình dục', 'khiêu dâm', 'phim 18'
  ];
  
  // Check for blocked keywords
  for (const keyword of blockedKeywords) {
    if (message.includes(keyword)) {
      return false;
    }
  }
  
  // Must be related to coding/programming
  const codingKeywords = [
    'code', 'bug', 'error', 'function', 'loop', 'array', 'string',
    'algorithm', 'logic', 'syntax', 'variable', 'condition', 'hint',
    'feedback', 'help', 'understand', 'explain', 'problem',
    'mã', 'lỗi', 'hàm', 'vòng lặp', 'mảng', 'chuỗi', 'thuật toán',
    'logic', 'cú pháp', 'biến', 'điều kiện', 'gợi ý', 'phản hồi',
    'trợ giúp', 'hiểu', 'giải thích', 'bài toán', 'code review',
    'test case', 'output', 'input'
  ];
  
  // Check if message contains coding-related keywords
  const hasCodingKeyword = codingKeywords.some(keyword => message.includes(keyword));
  
  // Allow very general help requests if they seem sincere
  const generalHelpPhrases = [
    'help', 'please', 'can you', 'could you', 'would you',
    'how', 'what', 'why', 'where', 'when',
    'giúp', 'được không', 'có thể', 'làm sao', 'tại sao', 'cái gì'
  ];
  
  const hasHelpPhrase = generalHelpPhrases.some(phrase => message.includes(phrase));
  
  // If no coding keywords but has help phrases, it's questionable
  // Only block if completely irrelevant
  if (!hasCodingKeyword && hasHelpPhrase) {
    // Allow if message is relatively short and seems genuine
    return message.length < 100;
  }
  
  return hasCodingKeyword || message.length < 50; // Allow short genuine questions
}

/**
 * Get AI response from NPC via Edge Function
 * 
 * @param {string} userMessage - User's question/message to NPC
 * @param {string} problemDescription - Current lesson problem description
 * @param {string} userCode - Current code from user
 * @returns {Promise<{success: boolean, reply: string, error?: string}>}
 */
export async function getNPCResponse(userMessage, problemDescription = '', userCode = '') {
  try {
    if (!userMessage || userMessage.trim() === '') {
      return {
        success: false,
        error: 'Empty message',
        reply: 'Please ask me something, Knight!'
      };
    }

    // Check if question is relevant and appropriate
    if (!isRelevantQuestion(userMessage)) {
      const language = detectLanguage(userMessage);
      const blockedMessages = {
        vi: 'Câu hỏi này không liên quan đến bài toán lập trình. Hãy hỏi tôi về code hoặc bài toán của bạn.',
        en: 'This question is not related to coding. Please ask me about your code or the problem.'
      };
      
      return {
        success: false,
        error: 'Blocked question',
        reply: blockedMessages[language] || blockedMessages.en
      };
    }

    // Get auth token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;

    if (!authToken) {
      console.error('No Supabase auth token found');
      return {
        success: false,
        error: 'Authentication required',
        reply: 'Please log in to use the NPC features.'
      };
    }

    // Detect user's language
    const userLanguage = detectLanguage(userMessage);
    
    // Create language-specific prompt
    const systemPrompt = userLanguage === 'vi'
      ? 'Bạn là một trợ lý lập trình thông minh và thân thiện. Hãy trả lời bằng tiếng Việt. Tập trung vào giúp người dùng hiểu và giải quyết vấn đề lập trình của họ. Không sử dụng emoji.'
      : 'You are a smart and friendly programming assistant. Answer in English. Focus on helping the user understand and solve their coding problems. Do not use emojis.';

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        userMessage: userMessage.trim(),
        problemDescription: problemDescription || 'No problem description provided',
        userCode: userCode || '# No code provided yet',
        systemPrompt: systemPrompt,
        language: userLanguage
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('NPC API Error:', response.status, errorData);
      
      const language = detectLanguage(userMessage);
      const errorMessages = {
        vi: `Lỗi máy chủ (${response.status}). Vui lòng thử lại sau.`,
        en: `Server error (${response.status}). Please try again later.`
      };
      
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}`,
        reply: errorMessages[language] || errorMessages.en
      };
    }

    const data = await response.json();

    if (data.reply) {
      return {
        success: true,
        reply: data.reply
      };
    } else if (data.error) {
      console.error('NPC Error:', data.error);
      return {
        success: false,
        error: data.error,
        reply: `NPC Error: ${data.error}`
      };
    } else {
      throw new Error('Unexpected response format from NPC');
    }

  } catch (error) {
    console.error('NPC Service Error:', error.message);
    console.error('Error details:', error);
    
    const language = detectLanguage(userMessage);
    const errorMessages = {
      vi: 'Không thể kết nối với NPC. Vui lòng thử lại sau.',
      en: 'Cannot connect to NPC. Please try again.'
    };
    
    return {
      success: false,
      error: error.message,
      reply: errorMessages[language] || errorMessages.en
    };
  }
}

/**
 * Get a hint from NPC
 * @param {string} problemDescription - Current lesson problem
 * @param {string} userCode - Current user code
 * @returns {Promise<{success: boolean, reply: string}>}
 */
export async function getNPCHint(problemDescription = '', userCode = '') {
  return getNPCResponse('Hãy cho tôi một gợi ý', problemDescription, userCode);
}

/**
 * Ask NPC for feedback on code
 * @param {string} problemDescription - Current lesson problem
 * @param {string} userCode - Current user code
 * @returns {Promise<{success: boolean, reply: string}>}
 */
export async function getNPCCodeFeedback(problemDescription = '', userCode = '') {
  return getNPCResponse('Do you have any feedback on my code?', problemDescription, userCode);
}

/**
 * Ask NPC about a specific error
 * @param {string} errorMessage - Error from test cases
 * @param {string} problemDescription - Current lesson problem
 * @param {string} userCode - Current user code
 * @returns {Promise<{success: boolean, reply: string}>}
 */
export async function getNPCErrorHelp(errorMessage = '', problemDescription = '', userCode = '') {
  const message = errorMessage 
    ? `I encountered an error: "${errorMessage}". Can you help me?`
    : "I don't understand why my code isn't running.";
  
  return getNPCResponse(message, problemDescription, userCode);
}

export default {
  getNPCResponse,
  getNPCHint,
  getNPCCodeFeedback,
  getNPCErrorHelp
};
