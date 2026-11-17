# EL SANTO V5 — ACABAMENTO VISUAL PREMIUM

Data: 14/11/2026

## Objetivo

Refinar a experiência visual e a navegação sobre a V4, sem redesenhar completamente a marca, sem quebrar os fluxos operacionais e **sem deploy**. Esta rodada não altera o schema Prisma nem integra pagamentos ou automações externas.

## Mudanças concretas

### 1. Design system premium (`app/premium.css`)
- Camada de refinamento independente dos estilos anteriores (`app/globals.css`), carregada depois no `app/layout.tsx`.
- Ajustes de espaçamento, hierarquia tipográfica, áreas clicáveis, bordas, sombras, estados hover/focus e responsividade.
- Hero em tons grafite, vinho e cobre com imagem do restaurante; sem camada amarela dependente de scroll.
- Animações sutis e compatíveis com `prefers-reduced-motion`.
- Formulários, cards, estados de status, tabelas e botões com acabamento mais consistente.

### 2. Navegação pública (`components/ClientShell.tsx`)
- Ação **Acompanhar pedido** mais visível no desktop e acesso rápido no cabeçalho móvel.
- Menu mobile com ações dedicadas, camada de fundo e fechamento por Escape e clique externo.
- Bloqueio de rolagem do documento enquanto o menu mobile está aberto; restauração ao fechar.
- Popup promocional fecha por Escape e bloqueia rolagem ao ser exibido.
- Mantém o botão de ajuda flutuante único, sem adicionar um conjunto de botões sobrepostos.

### 3. Cards interativos (`components/RevealCards.tsx`)
- Cards editoriais com expansão por ponteiro ou foco de teclado.
- Em dispositivos de toque, um toque seleciona/expande, e o próximo toque abre a seção.
- CTA contextual e melhor leitura das fotos reais.
- Movimento reduzido respeitado por CSS.

### 4. Cardápio e modal (`components/MenuGrid.tsx`)
- A foto do prato é agora um botão acessível que abre detalhes e personalização.
- Categorias com `aria-pressed`; quantidade de itens encontrados exibida com `aria-live`.
- Modal fecha por Escape, bloqueia a rolagem do fundo e conserva o foco no conteúdo modal até fechar.
- As fotos e preços oficiais existentes permanecem intactos.

### 5. Painel administrativo (`components/AdminFrame.tsx`, `components/AdminPanel.tsx`)
- Menu lateral reagrupado em **Visão geral**, **Operação da casa** e **Gestão e conteúdo**.
- Permissões de visualização por perfil preservadas; nenhuma rota administrativa foi removida.
- Seletor de tema Claro/Escuro com indicação acessível e persistência no `localStorage`.
- Nova introdução editorial no dashboard, atalhos para pedidos e PDV, métricas refinadas e melhor comportamento responsivo.
- Cartão de operação muda a cor da lateral quando a loja está com pedidos online pausados.

### 6. Área do motoboy
- Refinamento de cores, bordas, botões e legibilidade dos cards, especialmente no celular.
- Fluxos de status, GPS e navegação Waze/Google Maps preservados.

## Arquivos modificados ou criados

- `app/layout.tsx`
- `app/premium.css` (novo)
- `components/ClientShell.tsx`
- `components/ScrollExperience.tsx` (novo)
- `components/RevealCards.tsx`
- `components/MenuGrid.tsx`
- `components/AdminFrame.tsx`
- `components/AdminPanel.tsx`
- `tests/visual-finish.test.mjs` (novo)
- `README.md`

## Validação executada

- `npm test`: **26 testes aprovados** (incluindo 5 verificações estruturais novas de visual/UX).
- `npm run audit`: todos os caminhos dos assets locais auditados existem, e a política de cache privado da PWA foi preservada.
- Transpilação sintática dos arquivos TypeScript/TSX usando o TypeScript instalado globalmente: **92 arquivos analisados, 0 erros de sintaxe**.
- `tinycss2`: `globals.css` e `premium.css` analisados sem erros sintáticos de topo.
- Dependências: o npm registry permanece inacessível (`EAI_AGAIN`), o que impede o **build real do Next.js** nesta sessão.

## Limitações — não confundir com homologação

Esta é uma rodada de **acabamento visual implementado no código**. Não foi possível carregar a aplicação em navegador, obter screenshots reais das telas após alterações, executar `next build` com dependências instaladas, validar responsividade em dispositivos físicos ou testar endpoints com PostgreSQL.

O sistema **não foi publicado**, e esta rodada **não configura credenciais externas nem finaliza gateways de pagamentos, WhatsApp automático ou Traccar**. Essas integrações continuam exatamente com o status da V4.
