# Divina Misericórdia

Site sobre a Divina Misericórdia: a vida de Santa Faustina, a Imagem de Jesus Misericordioso, as promessas, como rezar o Terço da Misericórdia (com um terço que se acende conta por conta) e um lembrete diário da Hora da Misericórdia.

Site estático, sem etapa de build: HTML, CSS e um pouco de JavaScript. Funciona sem internet depois da primeira visita e pode ser instalado na tela inicial do celular.

```
index.html            Início: a pintura, Santa Faustina, como rezar e o Terço conta por conta
imagem.html           A Imagem de Jesus Misericordioso
promessas.html        As promessas da Divina Misericórdia
lembrete.html         Lembrete da Hora da Misericórdia (calendário e aviso do navegador)
404.html              Página para endereços que não existem
sw.js                 Guarda o site no aparelho (funciona sem internet)
site.webmanifest      Nome, cores e ícones para instalar na tela inicial
assets/css/style.css  Tokens e componentes do design system
assets/js/main.js     Carregamento, tema, cabeçalho, menu, terço, lembrete
assets/fonts/         Brygada 1918 (licença OFL, ver OFL-Brygada-1918.txt)
assets/img/           Pintura, retrato, foto do terço, logos e ícones
tools/versao.py       Atualiza a versão do site depois de qualquer mudança
```

## Depois de mudar qualquer arquivo

```
python3 tools/versao.py
```

O script calcula uma versão nova a partir do conteúdo, grava a lista de arquivos guardados no aparelho em `assets/js/main.js` e `sw.js` e põe `?v=<versão>` nos endereços do estilo e do script nas páginas. Sem isso, quem já visitou o site continua vendo a versão guardada no aparelho. Rodar duas vezes seguidas não muda nada.

## Para ver localmente

```
python3 -m http.server 8000
```

e abra http://localhost:8000.

## Publicar no GitHub Pages

1. Em **Settings → Pages**, em *Build and deployment*, escolha **Deploy from a branch**, a branch `main` e a pasta `/ (root)`.
2. Em alguns minutos o site fica em https://gabrielbuhatem3-maker.github.io/DM/.

As tags de compartilhamento (`og:url`, `og:image` e `canonical`), o `sitemap.xml` e o `robots.txt` apontam para esse endereço. Se o site for para um domínio próprio, troque-o nesses arquivos.
