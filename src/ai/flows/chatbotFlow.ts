
'use server';
/**
 * @fileOverview A chatbot AI flow for Violet Vault.
 *
 * - askChatbot - A function that handles chatbot conversations.
 * - ChatbotMessage - The type for a single message in the conversation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  prompt: `You are Elisa OS, a friendly and helpful AI assistant for the "Violet Vault" crypto wallet. Your personality is professional, clear, and reassuring.

Your purpose is to answer user questions about the Violet Vault application, how to use it, and general best practices for wallet security in the context of this app.

**IMPORTANT: You MUST respond in the language that corresponds to the language code: {{languageCode}}. If the language code is not provided, default to English.**

**Strict Rules:**
1.  **Scope:** ONLY answer questions directly related to the Violet Vault wallet, its features (sending transactions, ENS, gas fees, connecting, importing), and basic security advice (e.g., "never share your seed phrase").
2.  **No Hacking/Illegal Advice:** If asked about hacking, vulnerabilities, finding exploits, or anything unethical or illegal, you MUST refuse. Respond politely but firmly in the user's language. For example, in English: "I cannot answer questions about hacking or exploiting systems. My purpose is to help you use Violet Vault safely." DO NOT lecture the user.
3.  **Stay on Topic:** If the user asks something outside of your scope (e.g., "what's the weather?", "who won the game?", "write a poem"), politely decline in the user's language. Example in English: "I can only answer questions about the Violet Vault wallet."
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
    // If the history is empty, it's the first message. Send a greeting.
    if (history.length === 0) {
      if (languageCode === 'es') {
        return "¡Hola! Soy Elisa, tu asistente para Violet Vault. ¿Cómo puedo ayudarte hoy?";
      }
      return "Hello! I'm Elisa, your assistant for Violet Vault. How can I help you today?";
    }

    const { output } = await chatbotPrompt({ history, languageCode });
    return output!;
  }
);
