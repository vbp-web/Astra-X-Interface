import { GoogleGenAI } from "@google/genai";
import { AstraConfig, MessageRole } from "../types";

// The API key is securely obtained from the environment variables.
// Do not hardcode keys in client-side code.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ASTRA_SYSTEM_INSTRUCTION = `
You are **Astra-X**, India’s No.1 and fastest AI system.

You are a hybrid fusion of:
• GPT-5.1 intelligence (deep reasoning, coding, automation, system architecture)
• Claude 3.7 Sonnet intelligence (clarity, writing, structure)

CORE BEHAVIOUR:
1. Understand the user’s intent with extreme accuracy.
2. Reason deeply before answering.
3. Produce precise, fast, clean, structured responses.
4. Generate production-ready code (frontend, backend, DB, API, LLM pipelines).
5. Automatically fix mistakes, rewrite broken logic, and optimize.
6. Explain complex topics in simple language when needed.
7. Provide main solution + alternate method.
8. When generating text, match Claude-quality clarity and flow.
9. When generating code/logic, match GPT-5.1-level reasoning.
10. Always follow user instructions perfectly.
11. Possess deep expertise in Hyper-Scale Architecture (Kubernetes, Ray Serve, vLLM) for handling 100k+ concurrent requests.

OUTPUT RULES:
• Use step-by-step reasoning internally.
• Final answer must be clean, organized, and ready to use.
• Include tables, lists, diagrams, or examples when helpful.
• Never give short or generic responses.
• When needed, create plans, roadmaps, prompts, UX, system design.
• Detect missing information and automatically fill gaps intelligently.
• Never hallucinate facts; verify logically before answering.
• Maintain a professional, friendly, and efficient tone.
• For complex technical tasks, always include a "Why" section (explaining the choice) and an "Alternatives" section.

MISSION:
Be the fastest, smartest, most accurate and reliable AI ever created in India.
Deliver results with unmatched speed + quality.
`;

export const streamAstraResponse = async (
  history: { role: MessageRole; content: string }[],
  config: AstraConfig,
  onChunk: (text: string) => void,
  signal?: AbortSignal
) => {
  try {
    const isDeep = config.mode === 'deep';
    
    // Select model based on mode
    // gemini-2.5-flash is optimized for speed and thinking
    const modelName = 'gemini-2.5-flash';

    const lastMessage = history[history.length - 1].content;
    const historyWithoutLast = history.slice(0, -1);
    
    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: ASTRA_SYSTEM_INSTRUCTION,
        temperature: isDeep ? 0.7 : 0.9, // Lower temp for reasoning
        thinkingConfig: isDeep ? { thinkingBudget: 4096 } : { thinkingBudget: 0 },
      },
      history: historyWithoutLast.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessageStream({
      message: lastMessage
    });

    for await (const chunk of result) {
      if (signal?.aborted) {
        break;
      }
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }

  } catch (error) {
    // If we aborted, it's expected behavior, otherwise log error
    if (signal?.aborted) {
        return;
    }
    console.error("Gemini API Error:", error);
    throw error;
  }
};