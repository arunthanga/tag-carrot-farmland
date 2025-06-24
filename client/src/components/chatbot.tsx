import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotResponse {
  response: string;
  suggestions: string[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const { language, t } = useLanguage();

  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatbotResponse> => {
      const response = await apiRequest("POST", "/api/chatbot", { message, language });
      return response.json();
    },
    onSuccess: (data) => {
      const botMessage: ChatMessage = {
        id: Date.now().toString() + "_bot",
        message: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    },
  });

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + "_user",
      message: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const openChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        message: t('chatbot.greeting'),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <Button
        onClick={openChat}
        className="w-16 h-16 bg-coral rounded-full shadow-lg text-white hover:bg-coral/80 animate-pulse-gentle"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat Interface */}
      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-80 shadow-2xl max-h-96 flex flex-col">
          <CardHeader className="bg-coral text-white rounded-t-xl p-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Farmland Assistant</CardTitle>
              <p className="text-xs opacity-90">{t('chatbot.greeting')}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 max-h-64">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.isUser
                        ? 'bg-coral text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm">
                    Typing...
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chatbot.placeholder')}
                className="flex-1 text-sm"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || chatMutation.isPending}
                className="btn-coral p-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
