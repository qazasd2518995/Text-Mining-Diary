export type QuestionType = 'likert' | 'text' | 'textarea' | 'checkbox' | 'radio' | 'url' | 'dropdown'

export interface LikertLabels {
  low: string
  high: string
}

export interface Question {
  id: string
  dbField: string
  type: QuestionType
  labelEn: string
  labelZh: string
  isGroupItem?: boolean
  options?: { value: string; labelEn: string; labelZh: string }[]
  required?: boolean
  likertLabels?: LikertLabels
  hasOtherField?: boolean       // for checkbox: show an "Other" free-text input
  otherDbField?: string         // db field for the "Other" text
}

export interface Section {
  id: string
  titleEn: string
  titleZh: string
  subtitleEn?: string
  subtitleZh?: string
  instructionEn?: string
  instructionZh?: string
  questions: Question[]
}

const GENAI_TOOLS = [
  { value: 'ChatGPT', labelEn: 'ChatGPT', labelZh: 'ChatGPT' },
  { value: 'Claude', labelEn: 'Claude', labelZh: 'Claude' },
  { value: 'Gemini', labelEn: 'Gemini', labelZh: 'Gemini' },
  { value: 'Copilot', labelEn: 'Copilot', labelZh: 'Copilot' },
  { value: 'Other', labelEn: 'Other', labelZh: '其他' },
]

const PROMPT_TYPES = [
  { value: 'initial_query', labelEn: 'Initial query — First prompt on a new topic or task', labelZh: '初始提問' },
  { value: 'clarification', labelEn: 'Clarification request — Asking AI to explain an unclear response', labelZh: '請求解釋' },
  { value: 'debug', labelEn: 'Debug / error correction — Submitting errors for fixing', labelZh: 'Debug/修錯' },
  { value: 'refinement', labelEn: 'Prompt refinement — Revising your prompt for better results', labelZh: '修改 prompt' },
  { value: 'elaboration', labelEn: 'Elaboration request — Asking for more detail or examples', labelZh: '要求更多細節' },
  { value: 'verification', labelEn: 'Confirmation / verification — Checking if AI output is correct', labelZh: '驗證答案' },
  { value: 'direct_answer', labelEn: 'Direct answer request — Asking AI to give an answer directly', labelZh: '直接索取答案' },
  { value: 'metacognitive', labelEn: 'Metacognitive prompting — Asking AI to explain its reasoning', labelZh: '後設認知提問' },
]

const PROMPT_SOURCES = [
  { value: 'self', labelEn: 'I developed them myself through trial and error', labelZh: '我自己摸索出來的' },
  { value: 'experienced_peer', labelEn: 'I learned them from a more experienced teammate', labelZh: '從較有經驗的組員學來的' },
  { value: 'novice_peer', labelEn: 'I learned them from a teammate who was also new', labelZh: '從同樣是新手的組員學來的' },
  { value: 'external', labelEn: 'I found them online or in course materials', labelZh: '從網路或課程教材學來的' },
]

const AI_PURPOSES = [
  { value: 'understanding', labelEn: 'Understanding concepts', labelZh: '理解概念' },
  { value: 'debugging', labelEn: 'Debugging code', labelZh: 'Debug' },
  { value: 'generating', labelEn: 'Generating code', labelZh: '產生程式碼' },
  { value: 'optimising', labelEn: 'Optimising output / results', labelZh: '優化結果' },
  { value: 'checking', labelEn: 'Checking / verifying my own work', labelZh: '檢查自己的工作' },
  { value: 'learning', labelEn: 'Learning new techniques', labelZh: '學習新技術' },
]

// Likert label presets per section
const LIKERT_DIFFICULTY: LikertLabels = { low: '1 = Very easy 非常簡單', high: '5 = Very difficult 非常困難' }
const LIKERT_AGREE: LikertLabels = { low: '1 = Strongly disagree 非常不同意', high: '5 = Strongly agree 非常同意' }
const LIKERT_QUALITY: LikertLabels = { low: '1 = Very poor 非常差', high: '5 = Excellent 非常好' }
const LIKERT_EMOTION: LikertLabels = { low: '1 = Not at all 完全沒有', high: '5 = Very strongly 非常強烈' }

export const sections: Section[] = [
  {
    id: 'A',
    titleEn: 'Identification & Group Profile',
    titleZh: '基本資訊與分組檔案',
    instructionEn: 'Please provide identification and group information.',
    instructionZh: '請填寫識別與分組資訊。',
    questions: [
      { id: 'Q3', dbField: 'genai_tools', type: 'checkbox', labelEn: 'Which GenAI tool(s) did you primarily use this week?', labelZh: '你這週主要使用哪些 GenAI 工具？', options: GENAI_TOOLS, required: true, hasOtherField: true, otherDbField: 'genai_tools_other' },
      { id: 'Q4', dbField: 'conversation_log_url', type: 'url', labelEn: 'Link to this week\'s GenAI conversation log', labelZh: '你這週與 GenAI 的對話連結', required: true },
    ],
  },
  {
    id: 'B',
    titleEn: 'Learning & Collaboration Context',
    titleZh: '週學習與合作情境',
    instructionEn: 'Briefly describe what you studied and accomplished this week.',
    instructionZh: '請簡要描述本週學習內容與完成事項。',
    questions: [
      { id: 'Q8', dbField: 'q8_topics', type: 'text', labelEn: 'What were the main topics or techniques covered this week?', labelZh: '本週主要學習內容是什麼？', required: true },
      { id: 'Q9', dbField: 'q9_tasks', type: 'text', labelEn: 'Which specific tasks did you complete?', labelZh: '你完成了哪些任務？', required: true },
      { id: 'Q10', dbField: 'q10_difficulty', type: 'likert', labelEn: 'Perceived difficulty of this week\'s tasks', labelZh: '本週任務的難度', likertLabels: LIKERT_DIFFICULTY, required: true },
      // B-2 Group Collaboration
      { id: 'Q11a', dbField: 'q11a_scaffolding', type: 'likert', labelEn: 'A teammate with more experience helped me understand a concept or technique this week.', labelZh: '本週有較有經驗的組員幫助我理解某個概念或技術', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q11b', dbField: 'q11b_prompt_share', type: 'likert', labelEn: 'I shared a useful AI prompt or strategy with my teammates.', labelZh: '我向組員分享了有用的 AI prompt 或策略', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q11c', dbField: 'q11c_prompt_adopt', type: 'likert', labelEn: 'A teammate shared an AI prompt or approach that I then adopted or adapted.', labelZh: '組員分享了我後來採用或調整的 AI prompt 或方法', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q11d', dbField: 'q11d_collective_eval', type: 'likert', labelEn: 'Our group discussed or compared different AI outputs before deciding on a solution.', labelZh: '我們小組在決定方案前會討論或比較不同 AI 輸出', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q11e', dbField: 'q11e_role_differentiation', type: 'likert', labelEn: 'In my group, there is a clear \'go-to person\' who leads the AI or coding work.', labelZh: '在我的小組中，有一個明確的人主導 AI 或程式工作', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q12a', dbField: 'q12a_value_diversity', type: 'likert', labelEn: 'Having teammates with different experience levels helped our group learn more effectively.', labelZh: '組員經驗不同有助於更有效學習', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q12b', dbField: 'q12b_upward_comparison', type: 'likert', labelEn: 'I sometimes felt left behind because other teammates knew more than me.', labelZh: '我有時覺得被落下，因為其他組員知道的比我多', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q12c', dbField: 'q12c_downward_comparison', type: 'likert', labelEn: 'I sometimes felt held back because other teammates knew less than me.', labelZh: '我有時覺得被拖慢，因為其他組員知道的比我少', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q12d', dbField: 'q12d_equity', type: 'likert', labelEn: 'Everyone in my group contributed roughly equally this week.', labelZh: '本週每個人的貢獻大致相等', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
    ],
  },
  {
    id: 'C',
    titleEn: 'AI Interaction & Dependency',
    titleZh: 'AI 互動行為與依賴',
    instructionEn: 'Reflect on how you used GenAI this week.',
    instructionZh: '請回顧你本週如何使用 GenAI。',
    questions: [
      { id: 'Q13', dbField: 'q13_prompt_types', type: 'checkbox', labelEn: 'Which prompt types did you use this week? (Select all that apply)', labelZh: '你本週的 prompt 類型有哪些？（可複選）', options: PROMPT_TYPES, required: true, hasOtherField: true, otherDbField: 'q13_prompt_types_other' },
      { id: 'Q14', dbField: 'q14_prompt_sources', type: 'checkbox', labelEn: 'For the prompt strategies you used this week, where did they primarily come from?', labelZh: '你本週使用的 prompt 策略主要來源為何？', options: PROMPT_SOURCES, isGroupItem: true, required: true, hasOtherField: true, otherDbField: 'q14_prompt_sources_other' },
      { id: 'Q15', dbField: 'q15_purposes', type: 'checkbox', labelEn: 'What were your main purposes for using GenAI this week?', labelZh: '你使用 GenAI 的主要目的？', options: AI_PURPOSES, required: true, hasOtherField: true, otherDbField: 'q15_purposes_other' },
      // C-3 Quality
      { id: 'Q16a', dbField: 'q16_accuracy', type: 'likert', labelEn: 'Accuracy — responses were factually correct', labelZh: '正確性', likertLabels: LIKERT_QUALITY, required: true },
      { id: 'Q16b', dbField: 'q16_clarity', type: 'likert', labelEn: 'Clarity — responses were easy to understand', labelZh: '清楚程度', likertLabels: LIKERT_QUALITY, required: true },
      { id: 'Q16c', dbField: 'q16_actionability', type: 'likert', labelEn: 'Actionability — responses could be directly applied', labelZh: '可操作性', likertLabels: LIKERT_QUALITY, required: true },
      { id: 'Q16d', dbField: 'q16_trustworthiness', type: 'likert', labelEn: 'Trustworthiness — I felt I could rely on them', labelZh: '可信度', likertLabels: LIKERT_QUALITY, required: true },
      { id: 'Q16e', dbField: 'q16_relevance', type: 'likert', labelEn: 'Relevance — responses addressed what I asked', labelZh: '相關性', likertLabels: LIKERT_QUALITY, required: true },
      { id: 'Q17', dbField: 'q17_quality_open', type: 'textarea', labelEn: 'What was most helpful about the AI responses, and what was missing or unhelpful?', labelZh: '他給了什麼幫助？缺少什麼？', required: true },
      // C-4 Dependency
      { id: 'Q18a', dbField: 'q18a_heavy_reliance', type: 'likert', labelEn: 'I relied heavily on AI to complete this week\'s tasks.', labelZh: '我依賴 AI 的程度很高', likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q18b', dbField: 'q18b_self_first', type: 'likert', labelEn: 'I attempted to solve problems on my own before turning to AI.', labelZh: '我先嘗試自己解決再用 AI', likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q18c', dbField: 'q18c_critical_eval', type: 'likert', labelEn: 'I critically evaluated AI outputs rather than accepting them directly.', labelZh: '我會批判性評估 AI 輸出', likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q18d', dbField: 'q18d_cannot_without_ai', type: 'likert', labelEn: 'Without AI, I would not have been able to complete the tasks.', labelZh: '沒有 AI 我無法完成任務', likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q18e', dbField: 'q18e_ai_starting_point', type: 'likert', labelEn: 'I used AI as a starting point, then modified the results myself.', labelZh: '我將 AI 當起點再自己修改', likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q19a', dbField: 'q19a_peer_reduces_ai', type: 'likert', labelEn: 'Because I could ask teammates for help, I relied on AI less.', labelZh: '因為可以問組員，我對 AI 的依賴降低', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
      { id: 'Q19b', dbField: 'q19b_mutual_check', type: 'likert', labelEn: 'My teammates and I checked each other\'s AI outputs before using them.', labelZh: '我和組員會互相檢查 AI 輸出後才使用', isGroupItem: true, likertLabels: LIKERT_AGREE, required: true },
    ],
  },
  {
    id: 'D',
    titleEn: 'Academic Emotions',
    titleZh: '學習情緒 (CVT)',
    instructionEn: 'Rate how strongly you experienced each emotion this week. 1 = Not at all, 5 = Very strongly.',
    instructionZh: '請評估本週學習情緒感受程度。1 = 完全沒有，5 = 非常強烈。',
    questions: [
      // D-1 Positive Activating
      { id: 'Q20a', dbField: 'q20a_confidence', type: 'likert', labelEn: 'I felt confident about completing the tasks', labelZh: '我對完成任務有信心', likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q20b', dbField: 'q20b_curiosity', type: 'likert', labelEn: 'I felt curious and wanted to explore further', labelZh: '我感到好奇', likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q20c', dbField: 'q20c_enjoyment', type: 'likert', labelEn: 'I felt a sense of enjoyment while working', labelZh: '我感到享受', likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q20d', dbField: 'q20d_pride', type: 'likert', labelEn: 'I felt proud of what I achieved', labelZh: '我感到驕傲', likertLabels: LIKERT_EMOTION, required: true },
      // D-2 Positive Deactivating
      { id: 'Q21a', dbField: 'q21a_satisfaction', type: 'likert', labelEn: 'I felt satisfied with my learning progress', labelZh: '我感到滿足', likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q21b', dbField: 'q21b_relief', type: 'likert', labelEn: 'I felt a sense of relief after completing tasks', labelZh: '我感到放鬆', likertLabels: LIKERT_EMOTION, required: true },
      // D-3 Negative Activating
      { id: 'Q22a', dbField: 'q22a_frustration', type: 'likert', labelEn: 'I felt frustrated during this week\'s tasks', labelZh: '我感到挫折', likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q22b', dbField: 'q22b_anxiety', type: 'likert', labelEn: 'I felt anxious about my ability to succeed', labelZh: '我感到焦慮', likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q22c', dbField: 'q22c_anger', type: 'likert', labelEn: 'I felt angry when things did not work as expected', labelZh: '我感到憤怒', likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q22d', dbField: 'q22d_shame', type: 'likert', labelEn: 'I felt ashamed when I could not understand the material', labelZh: '我感到慚愧', likertLabels: LIKERT_EMOTION, required: true },
      // D-4 Negative Deactivating
      { id: 'Q23a', dbField: 'q23a_boredom', type: 'likert', labelEn: 'I felt bored during this week\'s learning', labelZh: '我感到無趣', likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q23b', dbField: 'q23b_hopelessness', type: 'likert', labelEn: 'I felt hopeless about making progress', labelZh: '我感到絕望', likertLabels: LIKERT_EMOTION, required: true },
      // D-5 Group Social-Comparison
      { id: 'Q24a', dbField: 'q24a_encouragement', type: 'likert', labelEn: 'I felt encouraged by working with teammates who knew more than me.', labelZh: '與比我有經驗的組員合作讓我受鼓勵', isGroupItem: true, likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q24b', dbField: 'q24b_inadequacy', type: 'likert', labelEn: 'I felt inadequate compared to more experienced teammates.', labelZh: '與更有經驗的組員相比我覺得不足', isGroupItem: true, likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q24c', dbField: 'q24c_belonging', type: 'likert', labelEn: 'I felt a sense of belonging in my group.', labelZh: '我在小組中感到有歸屬感', isGroupItem: true, likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q24d', dbField: 'q24d_observational_motivation', type: 'likert', labelEn: 'I felt motivated by seeing how my teammates used AI.', labelZh: '看到組員用 AI 讓我有動力', isGroupItem: true, likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q24e', dbField: 'q24e_pace_pressure', type: 'likert', labelEn: 'I felt pressure to keep up with my teammates\' pace.', labelZh: '我感到壓力要跟上組員的進度', isGroupItem: true, likertLabels: LIKERT_EMOTION, required: true },
      { id: 'Q25', dbField: 'q25_other_emotions', type: 'textarea', labelEn: 'Were there any other emotions not listed above? Please describe.', labelZh: '是否有其他情緒？請描述。', required: true },
    ],
  },
  {
    id: 'E',
    titleEn: 'Metacognitive & Group Reflection',
    titleZh: '後設認知與小組反思',
    instructionEn: 'Answer in 2–4 sentences. These help us understand your reasoning, learning, and collaboration.',
    instructionZh: '請以 2–4 句回答。',
    questions: [
      { id: 'Q26', dbField: 'q26_memorable_interaction', type: 'textarea', labelEn: 'Describe your most memorable AI interaction this week. What happened and why was it significant?', labelZh: '你印象最深的 AI 互動？為什麼？', required: true },
      { id: 'Q27', dbField: 'q27_prompt_revision', type: 'textarea', labelEn: 'Did you revise any prompts? Describe what you changed, why, and whether it worked better.', labelZh: '你有修改 prompt 嗎？請描述過程。', required: true },
      { id: 'Q29', dbField: 'q29_emotional_trajectory', type: 'textarea', labelEn: 'How did your emotions change during the process of refining your prompts?', labelZh: '修改 prompt 過程中的情緒如何轉變？', required: true },
      // E-2 Group Collaboration Reflection
      { id: 'Q31', dbField: 'q31_received_help', type: 'textarea', labelEn: 'Did a teammate help you with AI prompting or a text-mining technique this week? If yes, describe what happened and whether that person was more experienced or at a similar level to you.', labelZh: '本週是否有組員幫助你？請描述經過，說明該組員是否比你更有經驗。', isGroupItem: true, required: true },
      { id: 'Q32', dbField: 'q32_gave_help', type: 'textarea', labelEn: 'Did you help a teammate this week? If yes, describe what you helped with and how.', labelZh: '本週你是否幫助了組員？請描述。', isGroupItem: true, required: true },
      { id: 'Q33', dbField: 'q33_composition_theorisation', type: 'textarea', labelEn: 'How do you feel your group\'s mix of experience levels (or lack of mix) affected your learning and AI use this week? Would you prefer a different group composition? Why or why not?', labelZh: '你覺得小組經驗組合如何影響你本週的學習與 AI 使用？你會偏好不同的組合嗎？', isGroupItem: true, required: true },
    ],
  },
  {
    id: 'F',
    titleEn: 'Response Validity Check',
    titleZh: '作答有效性檢核',
    instructionEn: 'These final items help ensure data quality.',
    instructionZh: '請誠實作答。',
    questions: [
      { id: 'Q34a', dbField: 'q34a_honesty', type: 'likert', labelEn: 'I answered this diary honestly and thoughtfully.', labelZh: '我誠實且認真地回答', required: true },
      { id: 'Q34b', dbField: 'q34b_comprehension', type: 'likert', labelEn: 'I understood all of the questions in this diary.', labelZh: '我理解所有問題', required: true },
      { id: 'Q35', dbField: 'q35_attention_check', type: 'likert', labelEn: 'Attention check: Please select "4" for this item.', labelZh: '注意力檢查：請選擇「4」。', required: true },
    ],
  },
]

// Group profile questions (Week 1 only, saved to students table)
export const groupProfileQuestions: Question[] = [
  {
    id: 'Q5', dbField: 'prior_experience', type: 'radio',
    labelEn: 'How would you describe your own prior experience with text mining or text analytics BEFORE this course?',
    labelZh: '在修這門課之前，你對文本探勘/文本分析的經驗程度如何？',
    isGroupItem: true, required: true,
    options: [
      { value: '0', labelEn: 'No experience at all', labelZh: '完全沒有經驗' },
      { value: '1', labelEn: 'Limited experience — basic tasks', labelZh: '有限經驗' },
      { value: '2', labelEn: 'Moderate experience — completed coursework or a project', labelZh: '中等經驗' },
      { value: '3', labelEn: 'Substantial experience — applied in research or industry', labelZh: '豐富經驗' },
    ],
  },
  {
    id: 'Q6', dbField: 'group_id', type: 'dropdown',
    labelEn: 'Your group number:',
    labelZh: '你的分組編號：',
    isGroupItem: true, required: true,
    options: [1,2,3,4,5,6].map(n => ({ value: String(n), labelEn: `Group ${n}`, labelZh: `第 ${n} 組` })),
  },
  {
    id: 'Q7', dbField: 'perceived_composition', type: 'radio',
    labelEn: 'To the best of your knowledge, how would you describe the experience composition of your group?',
    labelZh: '據你所知，你的分組組成經驗如何？',
    isGroupItem: true, required: true,
    options: [
      { value: 'homogeneous', labelEn: 'All members are new to text mining', labelZh: '所有人都是新手' },
      { value: 'heterogeneous', labelEn: 'Some members had prior experience while others were new', labelZh: '部分有經驗，部分新手' },
      { value: 'unsure', labelEn: 'I\'m not sure', labelZh: '我不確定' },
    ],
  },
]
