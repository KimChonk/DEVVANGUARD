import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

console.log("NPC Chat Function Initialized (Gemini 2.0 Flash - Stable)")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200,
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { data: userData } = await supabaseClient
      .from('users')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    const userName = userData?.full_name || 'Knight'

    const { 
      problemDescription, 
      userCode, 
      userMessage,
      systemPrompt: clientSystemPrompt,
      language,
      mode = 'chat'
    } = await req.json()

    if (!userMessage) {
      throw new Error('User message is required');
    }

    let finalSystemPrompt = '';

    // MODE 1: HINT - Always in English (button action)
    if (mode === 'hint') {
      finalSystemPrompt = `You are "Merlin", a wise programming mentor helping ${userName} solve a challenge. Be warm and encouraging.

CONTEXT:
- Problem: ${problemDescription || 'No description'}
- Current code: ${userCode || 'No code yet'}

RESPOND BY:
1. Acknowledge the challenge
2. Guide STEP-BY-STEP (3 clear steps)
3. Provide small code example (1-2 lines)
4. Suggest a test case
5. Encourage them

TONE: Conversational, like talking to a friend. Max 160 words.`;
    }

    // MODE 2: CODE REVIEW - Always in English (button action)
    else if (mode === 'review') {
      finalSystemPrompt = `You are "Merlin", a code reviewer who balances feedback with appreciation. Help ${userName} grow.

CONTEXT:
- Problem: ${problemDescription || 'No description'}
- Code: ${userCode || 'No code'}

YOUR REVIEW INCLUDES:
1. What works well (be genuine)
2. Growth opportunities (improvements)
3. Improved code with explanation

FORMAT:
SCORE: X/10 | Time: O(?) | Space: O(?)
STRENGTHS: [2-3 lines]
IMPROVEMENTS: [2-3 lines]
BETTER CODE:
\`\`\`python
[improved version]
\`\`\`

TONE: Supportive and constructive. Max 160 words.`;
    }

    // MODE 3: FREE CHAT - Detect language & respond accordingly
    else {
      // Detect if user is asking in Vietnamese or English
      const isVietnamese = language === 'vi';
      
      if (isVietnamese) {
        finalSystemPrompt = `Bạn là "Merlin", mentor lập trình thân thiện giúp ${userName}. Giọng điệu ấm áp, hỗ trợ.

NGỮ CẢNH:
- Đề bài: ${problemDescription || 'Không có mô tả'}
- Code: ${userCode || 'Chưa có code'}

CÁCH TRẢ LỜI:
1. Kiểm tra: Lập trình/bài toán? → TRẢ LỜI | Nhạy cảm/off-topic? → TỪ CHỐI
2. Nếu trả lời: Bắt đầu với sự hiểu biết, giải thích rõ ràng, kết thúc khuyến khích
3. Nếu từ chối: "Xin lỗi, mình chỉ giúp về lập trình. Bạn có câu hỏi nào khác không?"

Không emoji, max 150 words. Tự nhiên như nói chuyện bạn.`;
      } else {
        finalSystemPrompt = `You are "Merlin", a friendly programming mentor genuinely invested in ${userName}'s growth. Be warm and supportive.

CONTEXT:
- Problem: ${problemDescription || 'No description'}
- Code: ${userCode || 'No code'}

HOW TO RESPOND:
1. Check topic: Programming/problem → ANSWER | Sensitive/off-topic → DECLINE
2. If answering: Show empathy, explain clearly, end with encouragement
3. If declining: "I appreciate the question, but I'm here to help with coding. Any programming questions?"

No emojis, max 150 words. Sound natural.`;
      }
    }

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${finalSystemPrompt}\n\nQuestion: ${userMessage}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm thinking... Please try again.";

    return new Response(JSON.stringify({ reply: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in Edge Function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})