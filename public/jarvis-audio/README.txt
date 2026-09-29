====================================================================
DIRETÓRIO PARA OS ARQUIVOS .MP3 DE ÁUDIO DO JARVIS AI
====================================================================

Coloque os arquivos de áudio .mp3 nesta pasta para tocar em cada etapa:

1. 1-cole-a-url.mp3
   -> Toca na 1ª etapa: quando o usuário deve colar o link/URL da corretora.

2. 2-adicione-o-id.mp3
   -> Toca na 2ª etapa: quando o usuário deve inserir o ID da conta.

3. 3-envie-o-print.mp3
   -> Toca na 3ª etapa: quando o usuário deve enviar a captura de tela do gráfico.

4. 4-selecione-o-ativo.mp3
   -> Toca na 4ª etapa: quando o usuário deve selecionar o ativo financeiro.

5. 5-escolha-o-tempo.mp3
   -> Toca na 5ª etapa: quando o usuário deve escolher o tempo gráfico (M1, M5, etc.).

6. 6-arraste-para-o-lado.mp3
   -> Toca na 6ª etapa: quando o usuário deve arrastar o slider para ativar o hack.

7. 7-sinal-compra.mp3
   -> Toca no resultado pós-hack quando o sinal for COMPRA.

8. 8-sinal-venda.mp3
   -> Toca no resultado pós-hack quando o sinal for VENDA.

--------------------------------------------------------------------
DICAS:
- O sistema também aceita os nomes sem prefixo de número:
  cole-a-url.mp3, adicione-o-id.mp3, envie-o-print.mp3,
  selecione-o-ativo.mp3, escolha-o-tempo.mp3, arraste-para-o-lado.mp3,
  sinal-compra.mp3 (ou compra.mp3), sinal-venda.mp3 (ou venda.mp3 / put.mp3).
- Para alterar os caminhos ou nomes no código fonte, edite o objeto 
  JARVIS_AUDIO_FILES no arquivo:
  src/components/jarvis-voice.tsx
- Caso algum arquivo .mp3 não seja encontrado, o JARVIS automaticamente
  utilizará a voz sintetizada em português (SpeechSynthesis) como fallback.
====================================================================
