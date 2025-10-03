import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, Send } from "lucide-react";

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const { currentUser } = useAuth();

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // adiciona mensagem do usuário
    setMessages(prev => [...prev, { sender: "Você", text: input }]);
    const userMessage = input;
    setInput("");

    try {
      const res = await fetch("https://api.seudominio.com/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: currentUser?.uid || "anon",
          mensagem: userMessage,
          contexto: "cardapio"
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { sender: "Assistente", text: data.resposta }]);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setMessages(prev => [...prev, { sender: "Sistema", text: "Erro ao conectar. Tente novamente." }]);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={toggleChat}
        className="fixed bottom-20 left-5 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center z-50"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chatbox */}
      {isOpen && (
        <div className="fixed bottom-40 left-5 w-80 h-96 bg-white border rounded-lg shadow-lg flex flex-col z-50">
          <div className="flex-1 p-3 overflow-y-auto text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 ${m.sender === "Você" ? "text-right" : "text-left"}`}>
                <span className="font-semibold">{m.sender}:</span> {m.text}
              </div>
            ))}
          </div>
          <div className="border-t p-2 flex">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-orange-500 text-white px-3 py-1 rounded"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
