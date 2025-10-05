import React, { useState, useEffect, useRef } from "react";
import { useSessionId } from "@/hooks/useSessionId";
import { useAuth } from "@/hooks/useAuth"; // 👈 Importa dados do usuário

const ChatAssistant = () => {
  const sessionId = useSessionId();
  const { currentUser } = useAuth(); // 👈 pega usuário autenticado (Firebase)
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { from: "user" | "assistant" | "system"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Scroll automático
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // 🔹 Enviar mensagem
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsTyping(true);

    // 🔸 Monta o payload com dados do usuário autenticado
    const payload = {
      message: input,
      sessionId,
      user: currentUser
        ? {
            uid: currentUser.uid,
            name: currentUser.displayName || "Usuário",
            email: currentUser.email || "sem-email",
          }
        : {
            uid: "anon-" + sessionId.slice(0, 8),
            name: "Visitante",
            email: null,
          },
    };

    try {
      const response = await fetch(
        "https://n8n-n8n-start.yh11mi.easypanel.host/webhook/chatassistant",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      const output = Array.isArray(data)
        ? data[0]?.output || data[0]?.reply
        : data.output || data.reply;

      if (output) {
        setMessages((prev) => [...prev, { from: "assistant", text: output }]);
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (err) {
      console.error("⚠️ Erro:", err);
      setMessages((prev) => [
        ...prev,
        { from: "system", text: "Erro ao conectar. Tente novamente." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // 🔹 Mensagem inicial automática
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          from: "assistant",
          text: "Olá 👋! Sou o atendente virtual do restaurante. Como posso ajudar você hoje?",
        },
      ]);
    }
  }, [isOpen]);

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition"
      >
        💬
      </button>

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 w-80 h-96 bg-white border rounded-lg shadow-lg flex flex-col z-50">
          {/* Cabeçalho */}
          <div className="p-3 bg-primary text-white flex justify-between items-center rounded-t-lg">
            <span>Atendente Virtual</span>
            <button onClick={() => setIsOpen(false)} className="text-white">
              ✖
            </button>
          </div>

          {/* Mensagens */}
          <div
            ref={messagesEndRef}
            className="flex-1 p-3 overflow-y-auto space-y-2 text-sm scroll-smooth"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-md max-w-[80%] ${
                  msg.from === "user"
                    ? "bg-primary text-white self-end ml-auto"
                    : msg.from === "assistant"
                    ? "bg-gray-100 text-gray-900 self-start"
                    : "bg-red-100 text-red-700 text-center w-full"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {/* Indicador de digitação */}
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500 text-xs mt-2">
                <div className="flex space-x-1">
                  <span className="animate-bounce delay-[0ms]">●</span>
                  <span className="animate-bounce delay-[150ms]">●</span>
                  <span className="animate-bounce delay-[300ms]">●</span>
                </div>
                <span>Digitando...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-2 border-t flex">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border rounded-l-md px-2 py-1 text-sm focus:outline-none"
              placeholder="Digite sua mensagem..."
            />
            <button
              onClick={handleSend}
              disabled={isTyping}
              className={`px-3 rounded-r-md text-white ${
                isTyping
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
