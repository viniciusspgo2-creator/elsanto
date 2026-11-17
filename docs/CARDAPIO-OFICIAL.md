# El Santo — cardápio oficial (recebido em 14/11/2026)

Fontes visuais preservadas no repositório:

- `public/images/cardapio-oficial-1.jpg` — tacos tradicionales/crunchy, Del Comal e especialidades.
- `public/images/cardapio-oficial-2.jpg` — antojitos, guarniciones, ensaladas, postres, combos, salsas y extras.

Catálogo tipado em `lib/official-menu.ts`; importação idempotente em `prisma/seed.ts`.

- **38 produtos com preços extraídos das imagens, sem inventar valores.**
- **33 inicialmente publicáveis no seed**, 5 permanecem como rascunhos para confirmar variações/sabores.
- As categorias incluem **Bebidas**, mas **as duas imagens não contêm catálogo de bebidas com preços**. Não foi criado produto com preço inventado.
- Algumas imagens de produtos no site são reutilizadas como **ilustração**, não fotos individuais oficiais do item. Cada imagem poderá ser substituída no painel.

## Produtos pendentes de conferência antes de venda

| Produto | Questão a confirmar |
|---|---|
| Burrito clássico | Se os preços por proteína do bloco Del Comal valem para este prato |
| Burrito compuesto | Proteínas, composição e preços correspondentes |
| Quesadilla clássica | Se usa as mesmas proteínas e valores dos burritos |
| Helado da casa | Sabores sazonais disponíveis |
| Combo Casal | Escolhas permitidas para burrito, nacho, quesadilla e cantarito |

O cardápio transcrito **não** contém bebida sol, tequila e outros itens com preços. Estes não foram vendidos como produtos digitais sem dados da fonte.

**Regra do seed:** se o slug já existir, o cadastro é preservado. A importação não sobrescreve modificações humanas posteriores. Reexecutar o seed não cria duplicatas, mas não atualiza preços existentes.
