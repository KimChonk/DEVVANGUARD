// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// Import CORS headers
import { corsHeaders } from '../_shared/cors.ts'

// Lấy API Key bí mật của Google mà bạn đã lưu
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

console.log("NPC Chat Function Initialized (Fantasy Version)");

Deno.serve(async (req) => {
  // Xử lý CORS Preflight (bắt buộc)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Lấy dữ liệu từ React (gồm code, đề bài, và tin nhắn của user)
    const { problemDescription, userCode, userMessage } = await req.json()

    // Validate input
    if (!userMessage || userMessage.trim() === '') {
      return new Response(JSON.stringify({ error: 'User message is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 2. "Linh hồn" của NPC (System Prompt)
    // Đây là chỉ thị bí mật bạn gửi cho AI để nó biết phải đóng vai ai.
    const systemPrompt = `
      Bạn là "Mystery Wizard", một NPC pháp sư bí ẩn trong một game học lập trình.
      Tên bạn là "Merlin". Người dùng là một "Hiệp sĩ tập sự" (Knight).
      
      BỐI CẢNH HIỆN TẠI (KHÔNG được nhắc lại bối cảnh này):
      - Đề bài: ${problemDescription || 'No problem description'}
      - Code của Hiệp sĩ: ${userCode || 'No code yet'}

      QUY TẮC CỦA BẠN:
      1. Luôn nói chuyện với giọng điệu bí ẩn, cổ xưa, và khôn ngoan (ví dụ: "Hmm...", "Ta thấy rằng...", "Phép thuật của ngươi...").
      2. KHÔNG BAO GIỜ đưa ra đáp án code hoàn chỉnh.
      3. Thay vào đó, hãy GỢI Ý. Phân tích code của họ và chỉ ra lỗi (nếu có).
      4. Nếu họ hỏi "Gợi ý", hãy đưa ra gợi ý tiếp theo.
      5. Nếu code của họ đúng, hãy chúc mừng.
      6. Nếu code sai, hãy an ủi và chỉ ra vấn đề (ví dụ: "Hmm, có vẻ như phép thuật print() của ngươi đang thiếu một dấu ngoặc...").
      7. Giữ câu trả lời ngắn gọn (dưới 50 từ).
    `

    // 3. Xây dựng payload gửi cho Google Gemini
    const payload = {
      // systemInstruction dùng để định nghĩa vai trò của AI
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        // contents là lịch sử trò chuyện (ta chỉ gửi tin nhắn mới nhất)
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150, // Giới hạn độ dài trả lời
      }
    }

    // 4. Gọi API của Google Gemini
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lỗi từ Google AI:', errorText);
      throw new Error(`Google AI API error: ${response.statusText}`);
    }

    const data = await response.json()
    
    // 5. Lấy câu trả lời của AI
    // (Đoạn này hơi phức tạp vì cấu trúc trả về của Gemini)
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Ta đang suy nghĩ... Hãy hỏi lại sau.";

    // 6. Trả lời về cho React
    return new Response(JSON.stringify({ reply: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Lỗi trong Edge Function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

