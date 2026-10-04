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
tools/dominio.py      Passa o site para um domínio próprio
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

## Domínio próprio (ex.: .org.br)

1. Registre o domínio (o `.org.br` é registrado no registro.br e pede o CNPJ de uma entidade sem fins lucrativos).
2. No DNS do domínio, crie quatro registros **A** para o domínio sem www, apontando para `185.199.108.153`, `185.199.109.153`, `185.199.110.153` e `185.199.111.153`, e um **CNAME** de `www` para `gabrielbuhatem3-maker.github.io`.
3. Rode `python3 tools/dominio.py seudominio.org.br`, faça commit e envie para a `main`. O script troca o endereço em todas as páginas, no sitemap e no robots e cria o arquivo `CNAME`.
4. Em **Settings → Pages**, confira o domínio em *Custom domain* e marque **Enforce HTTPS** quando liberar.

Para voltar ao endereço do GitHub: `python3 tools/dominio.py --github`.
