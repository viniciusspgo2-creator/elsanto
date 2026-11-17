# El Santo — Matriz de implementação

Revisão: 14/11/2026. Origem: relatório de pendências anexado, fotos/logotipos do usuário e requisitos expressos no chat. **O ZIP de pendências continha apenas um relatório, não o código original do Chat Z.AI.** Esta entrega é uma reconstrução nova.

| Área | Situação desta entrega | Pendências antes de produção |
|---|---|---|
| Site público (Inicial, Cardápio, Sobre, Contato) | Código escrito + assets reais, responsivo via CSS | Teste visual no navegador real e ajustes finos |
| Hero + efeitos | Novo hero sem overlay amarelo de scroll, animação discreta | Teste mobile e preferência de movimentos |
| Cards e galeria | Cards e reveal com imagens reais | Gestão persistente da galeria por upload |
| Cardápio | 38 produtos com valores oficiais, seed preserva edições, 5 rascunhos pendentes | Confirmar sabores/combinações, bebidas e fotos por produto |
| Carrinho e checkout | Sem conta, servidor revalida, pedido idempotente | Testar E2E com banco real e pagamento presencial |
| Pedidos e acompanhamento | Persistência, timeline, link privado | Recuperação segura do link, mapa autoral com rota e testes reais de GPS |
| WhatsApp | Clique para enviar pedido manualmente | Mensagem automática só após integração oficial compatível |
| Admin | Light/Dark, sidebar, métricas reais, pedidos, configurações | Testes E2E, auditoria de acesso, melhorias de UI |
| PDV | Lançamento balcão/mesa para produtos simples | Complementos no PDV, desconto e múltiplos pagamentos |
| Cozinha / KDS | Comandas, status e consulta periódica | Comanda por navegador adicionada; faltam teste em impressora, aviso sonoro e multiestação |
| Mesas e QR | Cadastro, link por mesa e QR remoto | Gerador local e teste de mesas simultâneas |
| Financeiro | Receitas pagas e despesas básicas | Caixa, fluxo, fechamento, reembolsos/taxas e conciliação |
| Entregador | Área própria, Maps/Waze, status, GPS do navegador, fila local | Testar GPS Android/iOS e recuperação offline |
| Delivery rates | Taxa fixa configurável | Taxas por bairro e km no código; infraestrutura de geocodificação/roteamento e testes reais |
| Chatbot | Modo mecânico e APIs opcionais de IA | Guardrails adicionais, limites, custo e gestão de modelos |
| Marketing | Popup por URL e SEO/OG/PWA | Upload via R2/S3, CMS e blog |
| PWA | Manifest e SW | Push/teste de instalação dispositivos reais |
| Infra | Prisma schema, seed, Docker Postgres, .env | Versionar migrações, configurar DB e backup, deploy testado |

## Critérios para go-live

- [ ] `npm ci`/`npm install`, `npx prisma generate`, `npm run build`, `npm test` passaram com versões instaladas.
- [ ] Migrations revisadas e aplicadas com backup de Postgres.
- [ ] Admin criado com senha segura e autenticação testada.
- [ ] Todos os itens do cardápio têm preços/verificações reais.
- [ ] Jornada de pedido, pagamento, cancelamento e reconciliação testada.
- [ ] Pedido da mesa, PDV e entrega testados em dispositivo real.
- [ ] Modos off-line e GPS medidos em dispositivos Android/iOS reais.
- [ ] WhatsApp manual e acompanhamento demonstrados ao lojista.
- [ ] Permissões/RBAC, dados pessoais, LGPD, cookies e notificações revisados.
- [ ] Deploy e domínio homologados sem erros.
