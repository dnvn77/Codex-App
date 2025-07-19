
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare, Loader2, User } from 'lucide-react';
import { askChatbot, type ChatbotMessage } from '@/ai/flows/chatbotFlow';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTelegram } from '@/hooks/useTelegram';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useTelegram();
  const languageCode = user?.language_code;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsLoading(true);
      // Initial greeting from the chatbot
      askChatbot({ history: [], languageCode }).then(response => {
        setMessages([response]);
      }).catch(handleError).finally(() => setIsLoading(false));
    }
  }, [isOpen, languageCode]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleError = (error: Error) => {
    console.error("Chatbot error:", error);
    toast({
      title: "Chatbot Error",
      description: "Sorry, I couldn't get a response. Please try again.",
      variant: "destructive",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatbotMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askChatbot({ history: newMessages, languageCode });
      setMessages(prev => [...prev, response]);
    } catch (error) {
      handleError(error as Error);
      setMessages(messages); // Revert to previous messages on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(true)} size="icon" className="rounded-full h-14 w-14 shadow-lg">
          <MessageSquare />
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Elisa - Your Wallet Assistant</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 pr-4 -mr-6" viewportRef={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'model' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/32x32.png" data-ai-hint="female robot" />
                      <AvatarFallback>E</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-xs rounded-lg px-4 py-2',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><User size={16}/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                   <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/32x32.png" data-ai-hint="female robot" />
                      <AvatarFallback>E</AvatarFallback>
                    </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-3 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter>
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your wallet..."
                disabled={isLoading}
                autoComplete="off"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
