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
console.log('GEMINI_API_KEY exists:', !!GEMINI_API_KEY);

Deno.serve(async (req) => {
  // Xử lý CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200,
    })
  }

  try {
    // Xác thực người dùng bằng JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Lấy thông tin người dùng từ JWT
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      console.warn('⚠️ [NPC] Unauthorized attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Lấy thông tin user từ database để có full name
    const { data: userData } = await supabaseClient
      .from('users')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    const userName = userData?.full_name || 'Knight'

    // Parse request body with support for custom system prompt and language
    const { 
      problemDescription, 
      userCode, 
      userMessage,
      systemPrompt: clientSystemPrompt,
      language 
    } = await req.json()

    if (!userMessage) {
      throw new Error('User message is required');
    }

    // Default system prompt
    const defaultSystemPrompt = `You are "Merlin", a wise programming mentor wizard helping ${userName} learn to code.

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
7. DO NOT use emojis
8. Respond in the same language as the user's question

Remember: Be concise, clear, and helpful. Use code blocks properly. No emojis.`

    // Use client's system prompt if provided, otherwise use default
    const finalSystemPrompt = clientSystemPrompt || defaultSystemPrompt;

    // Prepare payload for Google Gemini
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${finalSystemPrompt}\n\nUser question: ${userMessage}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 120,
      },
    }


    // Call Google Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })


    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [NPC] Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json()

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm thinking... Please try again.";

    // Return response to React
    return new Response(JSON.stringify({ reply: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [NPC] Error in Edge Function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
