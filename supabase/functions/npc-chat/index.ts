// Setup type definitions

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Import CORS headers

import { corsHeaders } from '../_shared/cors.ts'

// MỚI: Import createClient để đọc JWT

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'



// Lấy API Key bí mật của OpenAI

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'



console.log("NPC Chat Function Initialized (Fantasy Version - OpenAI, JWT Secured)");

console.log('🔑 OPENAI_API_KEY exists:', !!OPENAI_API_KEY);



Deno.serve(async (req) => {

  // Xử lý CORS Preflight

  if (req.method === 'OPTIONS') {

    console.log('✅ [NPC] Handling CORS preflight');

    return new Response('ok', { 

      headers: corsHeaders,

      status: 200,

    })

  }



  try {

    // MỚI: Xác thực người dùng bằng JWT

    // 1. Tạo một Supabase client tạm thời BÊN TRONG function

    const supabaseClient = createClient(

      // Lấy URL và Anon Key từ biến môi trường

      Deno.env.get('SUPABASE_URL')!,

      Deno.env.get('SUPABASE_ANON_KEY')!,

      // Lấy header 'Authorization' (chứa JWT) từ request

      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }

    )



    // 2. Lấy thông tin người dùng từ JWT

    const { data: { user } } = await supabaseClient.auth.getUser()



    if (!user) {

      console.warn('⚠️ [NPC] Unauthorized attempt');

      return new Response(JSON.stringify({ error: 'Unauthorized' }), {

        headers: { ...corsHeaders, 'Content-Type': 'application/json' },

        status: 401,

      })

    }

    

    // Đã xác thực! Giờ chúng ta biết user.id

    console.log('👤 [NPC] Authenticated user:', user.id);



    console.log('📥 [NPC] Received request');

    

    const { problemDescription, userCode, userMessage } = await req.json()



    if (!userMessage) {

      throw new Error('User message is required');

    }



    // 2. "Linh hồn" của NPC (System Prompt)

    const systemPrompt = `

      Bạn là "Mystery Wizard", một NPC pháp sư bí ẩn trong một game học lập trình.

      Tên bạn là "Merlin". Người dùng là một "Hiệp sĩ tập sự" (Knight) có ID: ${user.id}.

      

      BỐI CẢNH HIỆN TẠI (KHÔNG được nhắc lại bối cảnh này):

      - Đề bài: ${problemDescription || 'No problem description'}

      - Code của Hiệp sĩ: ${userCode || 'No code yet'}



      QUY TẮC CỦA BẠN:

      1. Luôn nói chuyện với giọng điệu bí ẩn, cổ xưa, và khôn ngoan.

      2. KHÔNG BAO GIỜ đưa ra đáp án code hoàn chỉnh.

      3. Thay vào đó, hãy GỢI Ý. Phân tích code của họ và chỉ ra lỗi (nếu có).

      4. Giữ câu trả lời ngắn gọn (dưới 50 từ).

    `

    console.log('🤖 [NPC] System prompt ready for user:', user.id);



    // 3. Cập nhật payload cho OpenAI

    const payload = {

      model: 'gpt-3.5-turbo',

      messages: [

        { role: 'system', content: systemPrompt },

        { role: 'user', content: userMessage }

      ],

      temperature: 0.7,

      max_tokens: 150,

      user: user.id, // MỚI: Gửi user_id cho OpenAI để cá nhân hóa

    }



    console.log('📤 [NPC] Calling OpenAI API...');



    // 4. Gọi API của OpenAI

    const response = await fetch(OPENAI_API_URL, {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

        'Authorization': `Bearer ${OPENAI_API_KEY}`

      },

      body: JSON.stringify(payload),

    })



    console.log('📩 [NPC] OpenAI response status:', response.status);



    if (!response.ok) {

      const errorText = await response.text();

      console.error('❌ [NPC] OpenAI API error:', errorText);

      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);

    }



    const data = await response.json()

    

    const aiResponse = data.choices?.[0]?.message?.content || "Ta đang suy nghĩ... Hãy hỏi lại sau.";



    console.log('✅ [NPC] AI Response:', aiResponse);



    // 6. Trả lời về cho React

    return new Response(JSON.stringify({ reply: aiResponse }), {

      headers: { ...corsHeaders, 'Content-Type': 'application/json' },

      status: 200,

    })



  } catch (error) {

    console.error('❌ [NPC] Error in Edge Function:', error.message);

    return new Response(JSON.stringify({ error: error.message }), {

      headers: { ...corsHeaders, 'Content-Type': 'application/json' },

      status: 500,

    })

  }

})
