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
  let basePrice = (item.priceFrom ? 0 : (item.price || 0)) * item.quantity;
  let variationsTotal = 0;

  if (item.selectedVariations && Array.isArray(item.selectedVariations)) {
    item.selectedVariations.forEach((group: any) => {
      if (group.variations && Array.isArray(group.variations)) {
        group.variations.forEach((variation: any) => {
          const additionalPrice = variation.additionalPrice || 0;
          const quantity = variation.quantity || 1;
          if (additionalPrice > 0) {
            variationsTotal += additionalPrice * quantity * item.quantity;
          }
        });
      }
    });
  }

  return basePrice + variationsTotal;
};

// Função principal para imprimir o pedido
export const printOrder = (order: Order) => {
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Pedido #${order.id}</title>
      <style>
        @page {
          size: auto;
          margin: 0;
        }

        html, body {
          width: 80mm;
          height: auto;
          margin: 0;
          padding: 0;
          overflow: visible;
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #000;
        }

        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          margin-bottom: 6px;
          padding-bottom: 4px;
        }

        .header h1 {
          font-size: 14px;
          margin: 0;
          text-transform: uppercase;
        }

        .header h2 {
          font-size: 12px;
          margin: 2px 0 0 0;
        }

        .order-info {
          margin-bottom: 6px;
        }

        .order-info div {
          margin-bottom: 2px;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
        }

        .items-table th, .items-table td {
          border-bottom: 1px dotted #000;
          padding: 3px 0;
          text-align: left;
        }

        .items-table th {
          font-weight: bold;
          font-size: 11px;
        }

        .variation {
          font-size: 9px;
          color: #555;
          margin-left: 8px;
          display: block;
        }

        .total {
          font-weight: bold;
          font-size: 13px;
          text-align: right;
          margin-top: 5px;
          border-top: 1px solid #000;
          padding-top: 5px;
        }

        .footer {
          margin-top: 10px;
          text-align: center;
          font-size: 9px;
          border-top: 1px dashed #ccc;
          padding-top: 4px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Comanda de Pedido</h1>
        <h2>Pedido #${order.id}</h2>
      </div>

      <div class="order-info">
        <div><strong>Data:</strong> ${formatDate(order.createdAt as string)}</div>
        <div><strong>Cliente:</strong> ${order.customerName}</div>
        <div><strong>Telefone:</strong> ${order.customerPhone}</div>
        <div><strong>Endereço:</strong> ${order.address}</div>
        <div><strong>Pagamento:</strong> ${translatePaymentMethod(order.paymentMethod)}</div>
        ${order.observations ? `<div><strong>Obs.:</strong> ${order.observations}</div>` : ''}
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qtd</th>
            <th>Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => {
            const subtotal = calculateItemSubtotal(item);
            return `
              <tr>
                <td>
                  <strong>${item.name}</strong>
                  ${item.priceFrom ? '<span style="font-size:9px;color:#666;">(a partir de)</span>' : ''}
                  ${item.selectedVariations && Array.isArray(item.selectedVariations)
                    ? item.selectedVariations.map(group =>
                        group.variations && Array.isArray(group.variations)
                          ? group.variations.map(variation =>
                              `<div class="variation">+ ${variation.name} ${variation.quantity > 1 ? `(${variation.quantity}x)` : ''} ${variation.additionalPrice > 0 ? `+ R$ ${variation.additionalPrice.toFixed(2)}` : ''}</div>`
                            ).join('')
                          : ''
                      ).join('')
                    : ''
                  }
                </td>
                <td>${item.quantity}</td>
                <td>R$ ${(item.price || 0).toFixed(2)}</td>
                <td>R$ ${subtotal.toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="total">
        TOTAL: R$ ${order.total.toFixed(2)}
      </div>

      <div class="footer">
        Impressão automática - ${new Date().toLocaleString('pt-BR')}
      </div>
    </body>
    </html>
  `;

  // Cria nova janela de impressão
  const printWindow = window.open('', '_blank', 'width=400,height=600');

  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      // Garante que só imprime o conteúdo necessário
      printWindow.document.body.style.height = "auto";
      printWindow.document.body.style.overflow = "visible";

      printWindow.print();
      printWindow.close();
    };
  } else {
    // Fallback via iframe
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
