// Setup type definitions

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Import CORS headers

import { corsHeaders } from '../_shared/cors.ts'

// Import createClient to read JWT

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'



// Get Google Gemini API Key

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'



console.log("NPC Chat Function Initialized (Fantasy Version - Google Gemini, JWT Secured)");

console.log('🔑 GEMINI_API_KEY exists:', !!GEMINI_API_KEY);



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

    

    // Lấy thông tin user từ database để có full name

    const { data: userData, error: userError } = await supabaseClient

      .from('users')

      .select('full_name')

      .eq('user_id', user.id)

      .single()

    

    const userName = userData?.full_name || 'Knight'

    console.log(' [NPC] User name:', userName);



    console.log(' [NPC] Received request');

    

    const { problemDescription, userCode, userMessage } = await req.json()



    if (!userMessage) {

      throw new Error('User message is required');

    }



    // 2. "Linh hồn" của NPC (System Prompt) - IMPROVED VERSION

    const systemPrompt = `You are "Merlin", a wise programming mentor wizard helping ${userName} learn to code.

CONTEXT:
- Problem: ${problemDescription || 'General coding help'}
- Student Code: ${userCode || 'None yet'}

YOUR TEACHING RULES:
1. Keep responses SHORT (max 100 words)
2. Format code clearly with proper line breaks and indentation:
   - Use triple backticks for code blocks
   - One statement per line
   - Show indentation clearly
3. Give WORKING CODE EXAMPLES directly (not hints)
4. Explain briefly WHY it works
5. Be friendly and encouraging
6. Address the specific question directly

CODE FORMAT EXAMPLE:
\`\`\`python
a = int(input())
b = int(input())
print(a + b)
\`\`\`
Then explain: "input() gets text, int() converts to numbers, + adds them, print() shows result"

Remember: Be concise, clear, and helpful. Use code blocks properly.`

    console.log('🤖 [NPC] System prompt ready for user:', userName);



    // 3. Update payload for Google Gemini

    const payload = {

      contents: [

        {

          role: 'user',

          parts: [

            {

              text: `System: ${systemPrompt}\n\nUser message: ${userMessage}`

            }

          ]

        }

      ],

      generationConfig: {

        temperature: 0.7,

        maxOutputTokens: 120,

      },

    }



    console.log('📤 [NPC] Calling Google Gemini API...');



    // 4. Call Google Gemini API

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

      },

      body: JSON.stringify(payload),

    })



    console.log('📩 [NPC] Gemini response status:', response.status);



    if (!response.ok) {

      const errorText = await response.text();

      console.error('❌ [NPC] Gemini API error:', errorText);

      throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);

    }



    const data = await response.json()

    

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Ta đang suy nghĩ... Hãy hỏi lại sau.";



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
