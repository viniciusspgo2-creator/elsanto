# El Santo — taxas de delivery e acompanhamento

## Gestão de taxas (implementada no código)

- `FIXED`: taxa única configurada no painel.
- `NEIGHBORHOOD`: bairro normalizado e cadastrado no painel; se não há regra ativa, o pedido é recusado com uma mensagem clara, evitando cobrança indevida.
- `DISTANCE`: integração com serviços próprios ou contratados compatíveis com Nominatim (geocodificação) e OSRM (roteamento). **Não ativa sem configuração**.
- Frete grátis a partir de valor de pedido configurado.
- Valor mínimo geral e valor mínimo por bairro.
- A cotação vista no checkout é informativa; a taxa definitiva é recalculada com o valor real dos itens **no servidor** ao registrar o pedido.
- A taxa fica congelada no pedido para preservação histórica.

### Configuração do modo por quilômetro

1. Preencher `GEOCODER_BASE_URL` e `ROUTER_BASE_URL` com endpoints HTTPS **aprovados para uso comercial**. Os serviços públicos do OpenStreetMap/Nominatim não foram incluídos como backend gratuito ilimitado.
2. Configurar a latitude e longitude exatas do restaurante no painel, após confirmação em mapa.
3. Configurar taxa inicial, preço por quilômetro e distância máxima, se desejada.
4. Testar endereços com número e bairro real em São José do Rio Preto antes de ativar.
5. O endereço precisa ser geocodificado com confiabilidade de imóvel/edificação; se só for encontrado o centro do bairro, **não há cotação**.

**Aviso:** a implementação usa respostas Nominatim-compatíveis e OSRM-compatíveis, que precisam de testes de contrato e disponibilidade com a infraestrutura real. Pode haver custo de hospedagem, geocodificação e roteamento.

## Acompanhamento do entregador

O cliente vê a última localização do motoboy em um mapa incorporado do OpenStreetMap **somente enquanto o pedido está em entrega** e uma posição válida recente estiver disponível. A posição é atualizada pelos mecanismos de GPS existentes; a página do pedido faz polling a cada 30 segundos.

- Se GPS não foi compartilhado, exibe mensagem de indisponibilidade sem inventar localização.
- Se a posição tiver mais de 20 minutos, o mapa deixa de ser exibido.
- Após a conclusão, o endpoint deixa de expor as coordenadas ao cliente.
- O mapa incorporado utiliza um serviço de terceiros e pode estar sujeito a limites e política de privacidade. Em escala de produção, preferir tiles autorizados e MapLibre com domínio próprio.
- GPS no navegador não funciona de forma garantida quando a tela é bloqueada; a alternativa Traccar precisa de configuração/testes próprios.

## Não incluído

- Nenhum envio automático para WhatsApp sem API oficial.
- Nenhum pagamento Mercado Pago/PagBank.
- Nenhum cálculo de distância sem geocodificação real.
- Nenhum rastreamento garantido com o celular bloqueado.

## Impressora térmica (rodada 2)

A tela `/admin/imprimir/[id]` gera comanda operacional por pedido, com opções de bobina 58 e 80 mm (largura CSS e ajuste do navegador). Os links estão disponíveis no painel de pedidos e na cozinha.

**Ainda requer testes com impressora e driver físico:** a impressão usa o diálogo de impressão do navegador, sem conexão direta ESC/POS, sem impressão silenciosa, sem NFC-e ou documento fiscal. A largura da bobina também deve ser configurada nas preferências do driver/browser.
