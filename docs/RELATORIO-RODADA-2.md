# El Santo — Relatório de continuação / rodada 2

Data: 14/11/2026

## Entregue nesta rodada

1. `lib/official-menu.ts`: transcrição estruturada de 38 produtos e preços oficiais, agrupados em 11 categorias (incluindo categoria Bebidas sem produtos, pois o cardápio em anexo não os traz).
2. `prisma/seed.ts`: importação idempotente, preserva alterações feitas no painel, 33 produtos publicáveis e 5 rascunhos que pedem confirmação.
3. Cardápios de mesa originais, com modal para ampliar página 1 e página 2.
4. `DeliveryZone` e regras fixas/por bairro/km no esquema Prisma, com cotação por servidor e revalidação no pedido.
5. Painel de entrega com criação, ativação, desativação e remoção de bairros, valor mínimo e frete grátis.
6. Cotação de frete no checkout com tratamento de serviço indisponível; o pedido não é confirmado com taxa desconhecida.
7. Visualização do último GPS do entregador via mapa OSM incorporado na página privada do pedido, durante o status de entrega.
8. Proteção de privacidade: a coordenada deixa de ser exposta depois da conclusão ou 20 minutos sem atualização.
9. Impressão individual de comanda não fiscal por navegador em 58/80 mm, incluindo botão no painel de pedidos e KDS.
10. 11 testes unitários aprovados e 69 arquivos TS/TSX sem erros sintáticos.

## Limites e pendências honestos

- Não se conseguiu instalar `node_modules` nesta sessão por indisponibilidade/timeout do npm, portanto **não foi executado o build Next.js nem o typecheck Prisma final**. É imprescindível rodar `npm install`, `npx prisma generate`, `npm run build` e testes de ponta a ponta antes de produção.
- Não há projeto hospedado, DNS configurado nem banco de dados efetivo conectado nesta entrega.
- A implementação de km requer servidores de geocodificação e roteamento HTTPS configurados, coordenadas validadas e teste real; **não há roteamento gratuito ilimitado implícito**.
- O mapa do cliente mostra **posição recente**, não navegação ao vivo nem chegada calculada. O GPS do entregador não é garantido com tela bloqueada.
- A interface de impressão ainda não foi homologada em impressora física ou driver de bobina térmica.
- Não existe envio oficial automático para WhatsApp sem provedor; apenas o link pré-preenchido manual.
- Não há integração de pagamentos online Mercado Pago/PagBank, nem emissão fiscal.
- As fotos compartilhadas de pratos são ilustrativas; substituir por fotografias específicas antes da divulgação, quando disponíveis.
- O cardápio não traz bebidas com preços e há 5 produtos condicionais para validação da loja.

## Próximas prioridades técnicas

1. Compilar Next.js/Prisma em ambiente conectado, revisar erros de types e executar E2E com PostgreSQL.
2. Configurar e testar fotos individuais, opcionais e preços de bebidas.
3. Validar cartão, Pix e status financeiro sem marcar automaticamente como pago.
4. Testar fluxo de motoboy com dados reais e licença de serviço de mapas, incluindo falhas de GPS.
5. Integrar gateway de pagamentos quando aprovado pelo restaurante e revisados os custos.
6. Adicionar notificações Web Push, gerenciamento de galeria e geração de QR de mesa local sem serviço terceiro.
