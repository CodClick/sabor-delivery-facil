----------------------------------------------------
**V.1.77.2 - cp-aut8-tracking - 05/09/2026**
----------------------------------------------------
- A página "Análise de Marketing" agora tem a primeira caixa suspensa com Visitas, Vendas, Funil e Google Analytics. Com "Visitas" selecionado, os cards Total de Visitas, Visitantes Únicos, Visitantes Novos e Visitantes Recorrentes mostram dados reais da tabela `product_events` (eventos de visita ao cardápio, deduplicados por sessão) respeitando o período escolhido, com o percentual de variação em relação ao período anterior equivalente. Os demais cards exibem "—" até conectarmos suas fontes de dados.

O menu "Origens" agora lista todas as utm_source encontradas na tabela product_events, com a opção "Todas as origens" como padrão. Ao escolher uma origem, os quatro cards de visitas (Total de Visitas, Visitantes Únicos, Novos e Recorrentes) são filtrados apenas pelos eventos daquela utm_source, incluindo o percentual de variação em relação ao período anterior.
