## ClickPrato  

**Versão 1.1.13**  

**URL**: https://sabor-delivery-facil.lovable.app/

##Criado por ClickPrato##  

**Alteração:**  

Ajustei para imprimir via iframe oculto sem abrir nova janela 

*IMPORTANTE*
Criar atalho no desktop com a janela do admin-orders aberta. Alterar "PROPRIEDADES" do atalho, inserir o link abaixo, alterando o link do admin-orders para o do domínio em uso:
"C:\Program Files\Google\Chrome\Application\chrome_proxy.exe" --profile-directory="Profile 10" --ignore-profile-directory-if-not-exists https://crave-cardapio-display.lovable.app/admin-orders --kiosk --kiosk-printing --user-data-dir="C:\ChromePerfilPedidos"

Testado e funcionando perfeitamente com impressão automática ao chegar o pedido.
Ao clicar em "Aceito", Imprime a comanda novamente automaticamente.
* Arquivos Alterados:  
src/utils/printUtils.ts  

