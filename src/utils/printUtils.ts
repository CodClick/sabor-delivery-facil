import { Order } from "@/types/order";

// Função para formatar data em português
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Função para traduzir método de pagamento
const translatePaymentMethod = (method: Order["paymentMethod"]) => {
  const methodMap: Record<Order["paymentMethod"], string> = {
    card: "Cartão",
    cash: "Dinheiro", 
    pix: "PIX",
    payroll_discount: "Desconto em Folha"
  };
  return methodMap[method] || method;
};

// Função para calcular subtotal do item incluindo variações
const calculateItemSubtotal = (item: any) => {
  // Se o item tem "a partir de", o preço base é 0
  let basePrice = (item.priceFrom ? 0 : (item.price || 0)) * item.quantity;
  let variationsTotal = 0;
  
  if (item.selectedVariations && Array.isArray(item.selectedVariations)) {
    item.selectedVariations.forEach((group: any) => {
      if (group.variations && Array.isArray(group.variations)) {
        group.variations.forEach((variation: any) => {
          const additionalPrice = variation.additionalPrice || 0;
          const quantity = variation.quantity || 1;
          
          if (additionalPrice > 0) {
            const variationCost = additionalPrice * quantity * item.quantity;
            variationsTotal += variationCost;
          }
        });
      }
    });
  }
  
  return basePrice + variationsTotal;
};

// Função principal para imprimir o pedido
export const printOrder = (order: Order) => {
  // Criar o conteúdo HTML para impressão
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Pedido #${order.id}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          font-size: 12px; 
          margin: 10px;
          color: #000;
        }
        .header { 
          text-align: center; 
          margin-bottom: 20px; 
          border-bottom: 2px solid #000; 
          padding-bottom: 10px;
        }
        .order-info { 
          margin-bottom: 15px; 
        }
        .order-info div { 
          margin-bottom: 5px; 
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 15px;
        }
        .items-table th, .items-table td { 
          border: 1px solid #000; 
          padding: 5px; 
          text-align: left;
        }
        .items-table th { 
          background-color: #f0f0f0; 
          font-weight: bold;
        }
        .variation { 
          font-size: 10px; 
          color: #666; 
          margin-left: 10px;
        }
        .total { 
          font-weight: bold; 
          font-size: 14px; 
          text-align: right; 
          margin-top: 10px;
          border-top: 2px solid #000;
          padding-top: 10px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 10px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>COMANDA DE PEDIDO</h1>
        <h2>Pedido #${order.id}</h2>
      </div>
      
      <div class="order-info">
        <div><strong>Data:</strong> ${formatDate(order.createdAt as string)}</div>
        <div><strong>Cliente:</strong> ${order.customerName}</div>
        <div><strong>Telefone:</strong> ${order.customerPhone}</div>
        <div><strong>Endereço:</strong> ${order.address}</div>
        <div><strong>Pagamento:</strong> ${translatePaymentMethod(order.paymentMethod)}</div>
        ${order.observations ? `<div><strong>Observações:</strong> ${order.observations}</div>` : ''}
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qtd</th>
            <th>Preço Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => {
            const subtotal = calculateItemSubtotal(item);
            let itemRow = `
              <tr>
                <td>
                  <strong>${item.name}</strong>
                  ${item.priceFrom ? '<span style="font-size:10px;color:#666;">(a partir de)</span>' : ''}
                  ${item.selectedVariations && Array.isArray(item.selectedVariations) ? 
                    item.selectedVariations.map(group => 
                      group.variations && Array.isArray(group.variations) ? 
                        group.variations.map(variation => 
                          `<div class="variation">+ ${variation.name} ${variation.quantity > 1 ? `(${variation.quantity}x)` : ''} ${variation.additionalPrice > 0 ? `+ R$ ${variation.additionalPrice.toFixed(2)}` : ''}</div>`
                        ).join('') : ''
                    ).join('') : ''
                  }
                </td>
                <td>${item.quantity}</td>
                <td>R$ ${(item.price || 0).toFixed(2)}</td>
                <td>R$ ${subtotal.toFixed(2)}</td>
              </tr>
            `;
            return itemRow;
          }).join('')}
        </tbody>
      </table>
      
      <div class="total">
        <strong>TOTAL: R$ ${order.total.toFixed(2)}</strong>
      </div>
      
      <div class="footer">
        Impressão automática - ${new Date().toLocaleString('pt-BR')}
      </div>
    </body>
    </html>
  `;

  // Criar uma nova janela para impressão
  const printWindow = window.open('', '_blank', 'width=600,height=600');
  
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Aguardar o carregamento e imprimir
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  } else {
    // Fallback se não conseguir abrir nova janela
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    
    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.write(printContent);
      frameDoc.close();
      
      setTimeout(() => {
        printFrame.contentWindow?.print();
        document.body.removeChild(printFrame);
      }, 100);
    }
  }
};