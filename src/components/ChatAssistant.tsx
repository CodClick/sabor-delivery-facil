import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const { currentUser } = useAuth();

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // adiciona mensagem do usuário localmente
    setMessages(prev => [...prev, { sender: "Você", text: input }]);
    const userMessage = input;
    setInput("");

    try {
      const res = await fetch("https://n8n-n8n-start.yh11mi.easypanel.host/webhook/chatassistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: currentUser?.uid || "anon",
          mensagem: userMessage,
          contexto: "cardapio",
        }),
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { sender: "Assistente", text: data.resposta || "Sem resposta no momento." },
      ]);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setMessages(prev => [
        ...prev,
        { sender: "Sistema", text: "Erro ao conectar. Tente novamente." },
      ]);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-20 left-5 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 bg-orange-500 hover:bg-orange-600"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Chatbox */}
      {isOpen && (
        <div className="fixed bottom-40 left-5 w-80 h-96 bg-background border rounded-lg shadow-xl flex flex-col z-50">
          <div className="p-2 border-b font-semibold text-sm">
            Atendente Virtual
          </div>

          {/* Área de mensagens */}
          <ScrollArea className="flex-1 p-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-2 ${
                  m.sender === "Você" ? "text-right text-blue-600" : "text-left text-gray-800"
                }`}
              >
                <span className="font-medium">{m.sender}:</span> {m.text}
              </div>
            ))}
          </ScrollArea>

          {/* Campo de entrada */}
          <div className="border-t p-2 flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="text-sm"
            />
            <Button onClick={sendMessage} size="icon" className="bg-orange-500 hover:bg-orange-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;

