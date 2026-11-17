# Referências técnicas open-source — El Santo

A pesquisa considera exemplos arquiteturais; **nenhum desses repositórios foi copiado integralmente**. Licenças devem ser verificadas novamente no commit específico usado antes de incorporar código de terceiros.

- [ElitaleRestro](https://github.com/elitale/restro): Next.js, Prisma, POS, KDS, QR, variações e fluxo de restaurante. Referência para separação de serviços e telas de cozinha; conferir requisitos AGPL-3.0 no uso de código.
- [Bocao Community](https://github.com/nicotordev/bocao.app): dashboard, fluxo de pedidos, cozinha, reservas e integração opcional WhatsApp/IA. Edição Community AGPL-3.0; não incorporar código sem avaliar obrigações de licença.
- [FloCafe](https://github.com/FreeOpenSourcePOS/FloCafe): POS offline-first e impressão térmica; arquitetura de sincronização e hardware; ver licença MIT e limitações de ambiente.
- [NodeDR Restaurant POS](https://github.com/Raktim94/nodedr-restaurant-pos): mesas, cozinha, QR e relatórios; verificar licença AGPL e funcionalidade real antes de reutilizar.
- [Adminium Point of Sale](https://github.com/Adminiumjs/point-of-sale): demo de UI para PDV e fluxos de caixa; é **uma demonstração sem backend** e não substitui sistema de produção.
- [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js): biblioteca visual de mapas; nenhum mapa de rastreamento real está embutido nesta entrega.
- [Traccar](https://github.com/traccar/traccar) e [Traccar Client](https://github.com/traccar/traccar-client): rastreamento com servidor próprio/app, como alternativa futura ao GPS pelo navegador. Testar custos de hospedagem, segurança e permissões de segundo plano.
- [Next.js PWA](https://nextjs.org/docs/app/guides/progressive-web-apps): referência para manifest, service worker e Web Push.
- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) e [Waze Deep Links](https://developers.google.com/waze/deeplinks): navegação externa **sem API key**, usados na área do entregador.

## Decisões adotadas

1. Backend central com PostgreSQL/Prisma; ordem registrada antes de abrir WhatsApp.
2. Frontend próprio, sem clonar tema genérico de delivery.
3. Veracidade: preços não publicados sem cardápio oficial; métricas sem números artificiais.
4. API de IA ativada só por configuração e segredo no servidor; fallback mecânico.
5. Navegação no Waze/Google Maps usando links oficiais; não é mapa de rastreamento contínuo.
6. GPS do navegador a cada minuto apenas com tela ativa e consentimento; não prometer rastreamento em segundo plano.
