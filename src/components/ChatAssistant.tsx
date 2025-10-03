import React, { useState } from "react";

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "assistant" | "system"; text: string }[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(
        "https://n8n-n8n-start.yh11mi.easypanel.host/webhook/chatassistant",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        }
      );

      if (!response.ok) {
        console.error("❌ Erro HTTP:", response.status, response.statusText);
        throw new Error("Falha na requisição");
      }

      const data = await response.json();
      console.log("📥 Resposta do servidor:", data);

      // Normaliza a resposta (suporta array ou objeto)
      const output = Array.isArray(data)
        ? data[0]?.output || data[0]?.reply
        : data.output || data.reply;

      console.log("✅ Texto extraído:", output);

      if (output) {
        setMessages(prev => [...prev, { from: "assistant", text: output }]);
      } else {
        throw new Error("Resposta inválida do servidor");
      }

    } catch (err) {
      console.error("⚠️ Erro no handleSend:", err);
      setMessages(prev => [
        ...prev,
        { from: "system", text: "Erro ao conectar. Tente novamente." },
      ]);
    }
  };

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
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-md ${
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
              className="bg-primary text-white px-3 rounded-r-md"
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
