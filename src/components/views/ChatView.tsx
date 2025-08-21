
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";
import { Search, Send } from "lucide-react";
import Image from "next/image";

const chats = [
  { id: 1, name: "Alice", avatar: "https://placehold.co/100x100.png", lastMessage: "Hey, how are you?", time: "3:45 PM", unread: 2 },
  { id: 2, name: "Bob", avatar: "https://placehold.co/100x100.png", lastMessage: "See you tomorrow!", time: "1:20 PM", unread: 0 },
  { id: 3, name: "Charlie", avatar: "https://placehold.co/100x100.png", lastMessage: "Thanks!", time: "Yesterday", unread: 0 },
  { id: 4, name: "David", avatar: "https://placehold.co/100x100.png", lastMessage: "Sounds good.", time: "Yesterday", unread: 1 },
];

const messages = [
  { id: 1, sender: "Alice", text: "Hey, how are you?", time: "3:40 PM", sent: true },
  { id: 2, sender: "Me", text: "I'm good, thanks! How about you?", time: "3:42 PM", sent: false },
  { id: 3, sender: "Alice", text: "Doing great! Just wanted to check in.", time: "3:45 PM", sent: true },
]

export function ChatView() {
  const t = useTranslations();
  const selectedChat = chats[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-2rem)]">
      {/* Chat List */}
      <div className="md:col-span-1 bg-card border rounded-lg p-4 flex flex-col">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t.search} className="pl-8" />
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-2",
                  selectedChat.id === chat.id && "bg-accent"
                )}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint="person avatar"/>
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{chat.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                <div className="text-xs text-muted-foreground self-start">{chat.time}</div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message View */}
      <div className="md:col-span-2 bg-card border rounded-lg flex flex-col h-full">
        {selectedChat ? (
          <>
            <div className="p-4 border-b flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} data-ai-hint="person avatar"/>
                <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">{selectedChat.name}</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-end gap-2",
                      message.sent ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "p-3 rounded-lg max-w-xs",
                        message.sent
                          ? "bg-secondary"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      <p>{message.text}</p>
                      <p className="text-xs text-right mt-1 opacity-70">{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="relative">
                <Input placeholder="Type a message..." className="pr-10" />
                <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4" />
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
