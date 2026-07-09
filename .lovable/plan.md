
# Página de vendas do JARVIS — R$ 4.997

Vender high-ticket exige mais do que um botão "Comprar". O visitante precisa **acreditar que o produto vale 10x o preço antes de ver o preço**. A página abaixo é construída em cima do mesmo visual futurista/HUD ciano do app (`/jarvis`) para reforçar que ele está comprando *aquela* tecnologia que já viu funcionando.

Nova rota: `/oferta` (pt-BR, R$, sem menu do app — landing page pura, focada 100% em conversão).

---

## Estrutura da página (ordem importa)

```text
1. HERO IMERSIVO — "gancho de 3 segundos"
2. AGITAÇÃO DA DOR — o que trader comum vive hoje
3. APRESENTAÇÃO DO JARVIS — o que é, como funciona
4. DEMO AO VIVO — mini réplica animada do /jarvis rodando sozinho
5. PROVA DE RESULTADO — prints, R$ gerados, depoimentos em vídeo
6. O QUE ESTÁ INCLUSO — stack de valor (empilhar até parecer barato)
7. QUEM É PARA / NÃO É PARA — filtro de qualificação
8. GARANTIA BLINDADA — reversão de risco
9. PREÇO E OFERTA — ancoragem + escassez real
10. FAQ — quebra de últimas objeções
11. CTA FINAL — última chamada com urgência
```

---

## 1. Hero — os 3 primeiros segundos

- Fundo preto com o mesmo grid ciano + partículas + onda de voz 3D do `/jarvis`.
- **Headline (H1):** "O primeiro co-piloto de IA que analisa o mercado por você — em 8 segundos, com precisão cirúrgica."
- **Sub-headline:** "JARVIS é o assistente que instituições pagam milhões para ter. Agora ele opera do seu lado — 24h, sem emoção, sem cansar."
- Vídeo em loop (autoplay/muted) mostrando o JARVIS rodando uma análise real (pode ser um `.mp4` gravado do próprio `/jarvis`).
- **CTA primário:** "QUERO ATIVAR MEU JARVIS →" (rola até a oferta, não abre checkout ainda).
- Barra de urgência no topo: "Acesso limitado a 50 operadores neste lote."

## 2. Agitação da dor (2–3 dobras)

Blocos curtos, um por linha, com ícones em vermelho:

- Você entra numa operação e o mercado vira contra você em 30 segundos.
- Passa horas olhando gráfico e ainda perde para quem opera 5 minutos por dia.
- Já testou 4 "cursos de trading" e continua no zero a zero.
- Sabe que os grandes usam IA — e você ainda opera no *feeling*.

Fecha com: "O problema nunca foi você. Foi a **ferramenta**."

## 3. Apresentação — "conheça o JARVIS"

- Bloco lado a lado: à esquerda um mockup do painel do app; à direita 3 bullets fortes:
  - **Análise multi-camada em 8s** — DNS, orderbook, notícias, sentimento, fluxo de baleias.
  - **Sinais com confidence ≥ 87%** — só entra quando a probabilidade justifica.
  - **Roda em qualquer corretora** — Quotex, IQ, Binance, MT5, TradingView.

## 4. Demo ao vivo (o diferencial que vende sozinho)

Um componente reduzido do `/jarvis` **rodando em loop na landing** — o visitante *vê* o produto trabalhando antes de comprar. Isso quebra a objeção "e se não funcionar?" mais rápido que qualquer texto.

## 5. Prova de resultado

- Carrossel de prints de conta (R$ em pt-BR): "+R$ 12.480 em 9 dias".
- 3 vídeos-depoimento de 30–60s (placeholder até o usuário enviar).
- Logos de corretoras compatíveis.
- Contador "R$ X.XXX.XXX gerados por operadores JARVIS este mês" (pode ser real vindo do Supabase futuramente).

## 6. Stack de valor — "veja o que você leva"

Empilhar itens com preço fictício ao lado (ancoragem), fechando muito acima de R$ 4.997:

```text
Acesso vitalício ao JARVIS (núcleo neural v4.2)   R$  9.800
Extensão para navegador (auto-hack de corretora)   R$  1.500
Módulo de análise de notícias em tempo real        R$  2.400
Diário de trades com IA (journal + reports)        R$  1.200
Comunidade privada de operadores                    R$  1.800
Atualizações e novos módulos por 12 meses           R$  3.000
Suporte prioritário 1-a-1                           R$  1.500
-----------------------------------------------------------
Valor total:                                       R$ 21.200
Seu investimento hoje:                             R$  4.997
```

## 7. Para quem é / não é

Duas colunas:
- **É para você se:** quer parar de operar no achismo, tem no mínimo R$ 500 de banca, é disciplinado.
- **NÃO é para você se:** procura "robô mágico que dobra a banca em 1 dia", não vai seguir os sinais, quer riqueza sem esforço.

Esse filtro **aumenta conversão** porque valida o comprador sério.

## 8. Garantia blindada

Selo grande: "**Garantia incondicional de 7 dias.** Ativou, testou, não gostou? Devolvemos 100% do valor sem perguntas. O risco é todo nosso."

## 9. Preço e oferta

- Ancorar em `R$ 21.200` riscado bem visível.
- **De R$ 21.200 por R$ 4.997 à vista** — ou **12x de R$ 497** no cartão.
- CTA: "ATIVAR MEU JARVIS AGORA →" (abre checkout).
- Escassez: "Restam **17 vagas** neste lote" (número real, do backend, não fake).
- Selo de pagamento seguro + bandeiras de cartão + PIX.

## 10. FAQ

Perguntas obrigatórias:
- Preciso ter experiência com trading?
- Funciona em qualquer corretora?
- E se eu não gostar?
- O acesso é vitalício mesmo?
- Como recebo o acesso após pagar?
- Posso parcelar? Tem PIX?

## 11. CTA final + rodapé

Bloco preto com onda de voz do JARVIS pulsando:
- "Você tem duas opções: continuar operando sozinho, ou operar com o JARVIS ao seu lado."
- Botão gigante ciano brilhante: "QUERO O JARVIS AGORA →"
- Rodapé com CNPJ, contato, política de privacidade, termos.

---

## Detalhes técnicos

- **Arquivo:** `src/routes/oferta.tsx` (rota `/oferta`, layout sem sidebar do app).
- **Reaproveitar:** componente de onda 3D do `JarvisVoice`, tokens de cor do tema (ciano/preto), fontes já em uso — nada de paleta nova.
- **SEO/`head()`:** título "JARVIS — Co-piloto de IA para Traders | R$ 4.997", meta description otimizada, `og:title`/`og:description` próprios, `og:type: website`. Sem `og:image` até o usuário fornecer/gerar um.
- **Moeda:** R$ com locale `pt-BR` (já é o padrão do projeto).
- **Contador de vagas:** por enquanto valor fixo no componente; depois pode virar tabela `sales_slots` no Supabase.
- **Checkout:** deixar o botão apontando para `#` até o usuário decidir gateway. Recomendação forte: **Stripe Payments built-in** da Lovable (aceita PIX e cartão parcelado no Brasil, sem precisar conta Stripe própria). Confirmar antes de habilitar.
- **Performance:** landing usa `defaultPreload: "intent"` já configurado; imagens/vídeos com `loading="lazy"` fora do hero; vídeo do hero em `preload="metadata"`.
- **Analytics:** eventos de scroll (25/50/75/100%) e clique nos CTAs prontos para Plausible/GA quando o usuário quiser conectar.
- **Acessibilidade:** contraste AA no ciano sobre preto, `prefers-reduced-motion` desliga animações pesadas.

---

## O que eu preciso de você antes de construir

1. **Nome comercial e "dono" do produto** (aparece no rodapé/termos).
2. **3–5 prints reais ou depoimentos** (pode ser mock temporário se ainda não tiver).
3. **Gateway de pagamento:** libero Stripe Payments da Lovable (recomendado) ou você já tem Hotmart/Kiwify/Kirvano/Eduzz?
4. **Ainda no lote de 50 vagas?** Se sim, quantas "restam" hoje para eu deixar coerente.
5. Quer que eu deixe **duas ofertas** (R$ 4.997 à vista com bônus + 12x R$ 497) ou só uma?
