
'use server';
/**
 * @fileOverview A chatbot AI flow for Strawberry Wallet.
 *
 * - askChatbot - A function that handles chatbot conversations.
 * - ChatbotMessage - The type for a single message in the conversation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { translations, supportedLanguages, type Language } from '@/lib/i18n';

const ChatbotMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatbotMessage = z.infer<typeof ChatbotMessageSchema>;

const ChatbotHistorySchema = z.array(ChatbotMessageSchema);
export type ChatbotHistory = z.infer<typeof ChatbotHistorySchema>;

const ChatbotInputSchema = z.object({
  history: ChatbotHistorySchema,
  languageCode: z.string().optional().describe('The ISO 639-1 language code of the user (e.g., "en", "es").'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

export async function askChatbot(input: ChatbotInput): Promise<ChatbotMessage> {
  const response = await chatbotFlow(input);
  return { role: 'model', content: response };
}

const chatbotPrompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: { schema: ChatbotInputSchema },
  output: { format: 'text' },
  prompt: `You are Straw chat, a friendly and helpful AI assistant for the "Strawberry Wallet" crypto wallet. Your personality is professional, clear, and reassuring.

Your purpose is to answer user questions about the Strawberry Wallet application, how to use it, and general best practices for wallet security in the context of this app.

**IMPORTANT: You MUST respond in the language that corresponds to the language code: {{languageCode}}. If the language code is not provided, default to English.**

**Strict Rules:**
1.  **Scope:** ONLY answer questions directly related to the Strawberry Wallet wallet, its features (sending transactions, ENS, gas fees, connecting, importing), and basic security advice (e.g., "never share your seed phrase").
2.  **No Hacking/Illegal Advice:** If asked about hacking, vulnerabilities, finding exploits, or anything unethical or illegal, you MUST refuse. Respond politely but firmly in the user's language. For example, in English: "I cannot answer questions about hacking or exploiting systems. My purpose is to help you use Strawberry Wallet safely." DO NOT lecture the user.
3.  **Stay on Topic:** If the user asks something outside of your scope (e.g., "what's the weather?", "who won the game?", "write a poem"), politely decline in the user's language. Example in English: "I can only answer questions about the Strawberry Wallet wallet."
4.  **No Financial Advice:** Do not give financial advice, price predictions, or recommendations on which cryptocurrencies to buy.

**Conversation History:**
{{#each history}}
{{role}}: {{content}}
{{/each}}

model:`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, languageCode }) => {
    const lang: Language = supportedLanguages.includes(languageCode as Language) ? (languageCode as Language) : 'en';

    if (history.length === 0) {
      const greetings: Record<Language, string> = {
        en: "Hello! I'm Straw chat, your assistant for Strawberry Wallet. How can I help you today?",
        es: "¡Hola! Soy Straw chat, tu asistente para Strawberry Wallet. ¿Cómo puedo ayudarte hoy?",
        zh: "你好！我是Straw chat，Strawberry Wallet的助手。今天我能为你做些什么？",
        hi: "नमस्ते! मैं स्ट्रॉ चैट हूँ, स्ट्रॉबेरी वॉलेट के लिए आपका सहायक। मैं आज आपकी कैसे मदद कर सकती हूँ?",
        fr: "Bonjour ! Je suis Straw chat, votre assistante pour Strawberry Wallet. Comment puis-je vous aider aujourd'hui ?",
        ar: "مرحباً! أنا سترو شات، مساعِدتك في Strawberry Wallet. كيف يمكنني مساعدتك اليوم؟",
        bn: "হ্যালো! আমি স্ট্র চ্যাট, স্ট্রবেরি ওয়ালেটের জন্য আপনার সহকারী। আমি আজ আপনাকে কিভাবে সাহায্য করতে পারি?",
        ru: "Здравствуйте! Я Straw chat, ваш помощник в Strawberry Wallet. Чем я могу вам сегодня помочь?",
        pt: "Olá! Eu sou Straw chat, sua assistente para o Strawberry Wallet. Como posso ajudar hoje?",
        id: "Halo! Saya Straw chat, asisten Anda untuk Strawberry Wallet. Bagaimana saya bisa membantu Anda hari ini?",
      };
      return greetings[lang];
    }
    
    // For subsequent messages, call the model.
    const { output } = await chatbotPrompt({ history, languageCode: lang });
    
    if (output === null || output === undefined) {
      // In case the model returns a null/undefined response, provide a fallback.
      return "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
    }

    return output;
  }
);
