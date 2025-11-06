/**
 * NPC AI Service - Communicate with Supabase Edge Function
 * Integrates with Google Gemini AI via Edge Function
 */

import { supabase } from './supabaseClient';

const EDGE_FUNCTION_URL = 'https://zcjyrssflzlkurmwbowg.supabase.co/functions/v1/npc-chat';

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
        error: 'Vui lòng nhập tin nhắn cho NPC'
      };
    }

    // Get auth token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;

    if (!authToken) {
      console.error('❌ No Supabase auth token found');
      return {
        success: false,
        error: 'Authentication required',
        reply: 'Vui lòng đăng nhập để sử dụng NPC.'
      };
    }

    console.log('🧙‍♂️ Sending to NPC AI:', { userMessage, problemDescription: problemDescription.substring(0, 100) + '...' });

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
      }),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ NPC API Error:', response.status, errorData);
      
      // Return error but with fallback reply
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}`,
        reply: `Lỗi từ server (${response.status}): ${errorData.error || response.statusText}. Vui lòng kiểm tra kết nối.`
      };
    }

    const data = await response.json();

    console.log('📦 Response data:', data);

    if (data.reply) {
      console.log('✅ NPC Reply:', data.reply);
      return {
        success: true,
        reply: data.reply
      };
    } else if (data.error) {
      console.error('❌ NPC Error:', data.error);
      return {
        success: false,
        error: data.error,
        reply: `NPC Error: ${data.error}`
      };
    } else {
      throw new Error('Unexpected response format from NPC');
    }

  } catch (error) {
    console.error('❌ NPC Service Error:', error.message);
    console.error('Error details:', error);
    
    // Determine error type
    let userFriendlyMessage = 'Không thể kết nối với NPC. Vui lòng thử lại.';
    
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      userFriendlyMessage = 'Lỗi kết nối: CORS policy. Kiểm tra lại edge function configuration.';
    } else if (error.message.includes('timeout')) {
      userFriendlyMessage = 'Timeout: Edge Function không phản hồi. Thử lại sau.';
    }
    
    return {
      success: false,
      error: error.message,
      reply: userFriendlyMessage
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
  return getNPCResponse('Bạn có nhận xét gì về code của tôi không?', problemDescription, userCode);
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
    ? `Tôi gặp lỗi: "${errorMessage}". Bạn có thể giúp tôi không?`
    : 'Tôi không hiểu tại sao code của tôi không chạy được?';
  
  return getNPCResponse(message, problemDescription, userCode);
}

export default {
  getNPCResponse,
  getNPCHint,
  getNPCCodeFeedback,
  getNPCErrorHelp
};
