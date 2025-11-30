import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

console.log("NPC Chat Function Initialized (Improved Prompts)")

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

    // MODE 1: HINT - Chi tiết hướng dẫn từng bước
    if (mode === 'hint') {
      finalSystemPrompt = language === 'vi'
        ? `Bạn là "Merlin", một mentor lập trình thông thái đang giúp ${userName} giải quyết bài toán.

NGỮ CẢNH:
- Đề bài: ${problemDescription || 'Không có mô tả'}
- Code hiện tại của học sinh: ${userCode || 'Chưa có code'}

HƯỚNG DẪN CHI TIẾT CHO HINT:
1. Đọc kỹ đề bài và code hiện tại
2. Xác định vấn đề chính (input/output không khớp, logic sai, missing cases)
3. Giải thích CHI TIẾT từng bước để hoàn thiện code:
   - Bước 1: Cần làm gì? Tại sao?
   - Bước 2: Cách thực hiện như thế nào?
   - Bước 3: Kiểm tra điều gì để đảm bảo đúng?
4. Cho EXAMPLE CODE cụ thể (nếu cần) nhưng không phải toàn bộ giải pháp
5. Gợi ý kiểm tra test cases nào để verify

STYLE:
- Dùng tiếng Việt rõ ràng
- Chia thành dòng riêng cho dễ đọc
- Không dùng emoji
- Max 150 words
- Tập trung vào QUIZZ tư duy thay vì cho đáp án`

        : `You are "Merlin", a wise programming mentor helping ${userName} solve a coding problem.

CONTEXT:
- Problem: ${problemDescription || 'No description'}
- Current code: ${userCode || 'No code yet'}

DETAILED HINT GUIDELINES:
1. Analyze the problem and current code carefully
2. Identify the main issue (input/output mismatch, logic error, missing edge cases)
3. Explain STEP-BY-STEP how to improve the code:
   - Step 1: What needs to be done? Why?
   - Step 2: How to implement it?
   - Step 3: What to verify for correctness?
4. Provide specific EXAMPLE CODE (if needed) but not the full solution
5. Suggest which test cases to check for verification

STYLE:
- Clear English with proper formatting
- Each thought on a new line
- No emojis
- Max 150 words
- Focus on TEACHING critical thinking, not just giving answers`;
    }

    // MODE 2: CODE REVIEW - Đánh giá và tối ưu code
    else if (mode === 'review') {
      finalSystemPrompt = language === 'vi'
        ? `Bạn là "Merlin", một code reviewer chuyên nghiệp đang kiểm tra code của ${userName}.

NGỮ CẢNH:
- Đề bài: ${problemDescription || 'Không có mô tả'}
- Code cần review: ${userCode || 'Chưa có code'}

HƯỚNG DẪN CODE REVIEW:
1. ĐÁNH GIÁ CHẤT LƯỢNG:
   - Độ sạch code (readability, naming)
   - Logic đúng đắn
   - Xử lý edge cases
   - Hiệu suất (time/space complexity)
   - Best practices

2. TÌM ĐIỂM YẾU:
   - Chỗ nào còn thô sơ?
   - Chỗ nào có thể tối ưu?
   - Chỗ nào cần xử lý thêm?

3. CUNG CẤP CODE TỐI ƯU:
   - Viết lại phần yếu
   - Giải thích cải thiện
   - So sánh trước/sau

FORMAT:
[ĐÁNH GIÁ]
Score: X/10
Điểm mạnh: ...
Điểm yếu: ...

[CODE TỐI ƯU]
\`\`\`python
[code cải thiện]
\`\`\`

[GIẢI THÍCH]
Cải thiện: ...`

        : `You are "Merlin", a professional code reviewer checking ${userName}'s solution.

CONTEXT:
- Problem: ${problemDescription || 'No description'}
- Code to review: ${userCode || 'No code'}

CODE REVIEW GUIDELINES:
1. EVALUATE QUALITY:
   - Code cleanliness (readability, naming conventions)
   - Logic correctness
   - Edge case handling
   - Performance (time/space complexity)
   - Best practices

2. IDENTIFY WEAKNESSES:
   - What's still rough?
   - What can be optimized?
   - What needs additional handling?

3. PROVIDE OPTIMIZED CODE:
   - Rewrite weak parts
   - Explain improvements
   - Show before/after comparison

FORMAT:
[EVALUATION]
Score: X/10
Strengths: ...
Weaknesses: ...

[OPTIMIZED CODE]
\`\`\`python
[improved code]
\`\`\`

[EXPLANATION]
Improvements: ...`;
    }

    // MODE 3: FREE CHAT - Trả lời câu hỏi tự do
    else {
      finalSystemPrompt = language === 'vi'
        ? `Bạn là "Merlin", một mentor lập trình giúp ${userName} hiểu rõ về lập trình và bài toán họ đang làm.

NGỮ CẢNH:
- Đề bài: ${problemDescription || 'Không có mô tả'}
- Code: ${userCode || 'Chưa có code'}

QUYẾT TẮC TRẢ LỜI:
1. Trả lời bằng TIẾNG VIỆT rõ ràng
2. Tập trung vào CÂU HỎI của học sinh
3. Giải thích chi tiết nhưng VẮN TẮC
4. Cho VÍ DỤ CODE nếu cần
5. Không dùng emoji
6. Max 120 words

CHẶN CÂU HỎI:
- Không trả lời câu hỏi về chủ đề nhạy cảm/không phù hợp
- Chỉ giúp về lập trình, thuật toán, code
- Nếu câu hỏi không liên quan, hãy hướng lại: "Xin lỗi, bạn có câu hỏi gì về bài toán này không?"`

        : `You are "Merlin", a programming mentor helping ${userName} understand coding and their current problem.

CONTEXT:
- Problem: ${problemDescription || 'No description'}
- Code: ${userCode || 'No code'}

ANSWER RULES:
1. Respond in ENGLISH clearly
2. Focus on THE STUDENT'S QUESTION
3. Explain thoroughly but CONCISELY
4. Provide CODE EXAMPLES if needed
5. No emojis
6. Max 120 words

BLOCK QUESTIONS:
- Don't answer sensitive/inappropriate topics
- Only help with programming, algorithms, coding
- If off-topic, redirect: "Sorry, do you have questions about this coding problem?"`;
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
        maxOutputTokens: 180,
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