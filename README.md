# Divina Misericórdia

Site sobre a Divina Misericórdia: a vida de Santa Faustina, como rezar o Terço da Misericórdia e o porquê do site.

Site estático, sem etapa de build: HTML, CSS e um pouco de JavaScript.

```
index.html            Página inicial
imagem.html           A Imagem de Jesus Misericordioso
promessas.html        As promessas da Divina Misericórdia
assets/css/style.css  Tokens e componentes do design system
assets/js/main.js     Modo claro/escuro, menu do celular e o Terço conta por conta
assets/fonts/         EB Garamond (licença OFL, ver OFL-EB-Garamond.txt)
assets/img/           Retrato de Santa Faustina e marca
```

Para ver localmente:

```
python3 -m http.server 8000
```

e abra http://localhost:8000.

## Publicar no GitHub Pages

1. Em **Settings → Pages**, em *Build and deployment*, escolha **Deploy from a branch**, a branch `main` e a pasta `/ (root)`.
2. Em alguns minutos o site fica em https://gabrielbuhatem3-maker.github.io/DM/.

As tags de compartilhamento (`og:url`, `og:image` e `canonical`) apontam para esse endereço. Se o site for para um domínio próprio, troque-o nas três páginas.
