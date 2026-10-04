#!/usr/bin/env python3
"""Passa o site para um domínio próprio.

    python3 tools/dominio.py divinamisericordia.org.br

O que faz:
  - troca o endereço atual (o do GitHub Pages ou um domínio anterior) pelo
    novo em todas as páginas (canonical e tags de compartilhamento), no
    sitemap.xml e no robots.txt;
  - cria o arquivo CNAME, que diz ao GitHub Pages qual é o domínio;
  - roda tools/versao.py, para quem já visitou receber a versão nova.

Para voltar ao endereço do GitHub:  python3 tools/dominio.py --github
"""
import os
import re
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GITHUB = 'https://gabrielbuhatem3-maker.github.io/DM/'
ARQUIVOS = ['index.html', 'imagem.html', 'promessas.html', 'lembrete.html', '404.html', 'sitemap.xml', 'robots.txt']


def endereco_atual():
    with open(os.path.join(RAIZ, 'index.html'), encoding='utf-8') as f:
        m = re.search(r'<link rel="canonical" href="([^"]+)"', f.read())
    if not m:
        sys.exit('Não achei o endereço atual (canonical) em index.html.')
    return m.group(1)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    arg = sys.argv[1].strip()
    if arg == '--github':
        novo, dominio = GITHUB, None
    else:
        dominio = re.sub(r'^https?://', '', arg).strip('/').lower()
        if dominio.startswith('www.'):
            dominio = dominio[4:]
        if not re.fullmatch(r'[a-z0-9-]+(\.[a-z0-9-]+)+', dominio):
            sys.exit('Domínio inválido: ' + arg)
        novo = 'https://' + dominio + '/'

    antigo = endereco_atual()
    if antigo == novo:
        print('O site já está em', novo)
    else:
        for nome in ARQUIVOS:
            caminho = os.path.join(RAIZ, nome)
            with open(caminho, encoding='utf-8') as f:
                t = f.read()
            with open(caminho, 'w', encoding='utf-8') as f:
                f.write(t.replace(antigo, novo))
        print('Endereço trocado:', antigo, '→', novo)

    cname = os.path.join(RAIZ, 'CNAME')
    if dominio:
        with open(cname, 'w', encoding='utf-8') as f:
            f.write(dominio + '\n')
        print('CNAME criado com', dominio)
    elif os.path.exists(cname):
        os.remove(cname)
        print('CNAME removido')

    subprocess.run([sys.executable, os.path.join(RAIZ, 'tools', 'versao.py')], check=True)


if __name__ == '__main__':
    main()
