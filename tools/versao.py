#!/usr/bin/env python3
"""Atualiza a versão do site depois de qualquer mudança.

    python3 tools/versao.py

O que faz:
  - calcula uma versão (dm-xxxxxxxxxx) a partir do conteúdo dos arquivos;
  - grava essa versão e a lista de arquivos guardados no aparelho, com o
    tamanho de cada um, em assets/js/main.js e sw.js;
  - põe ?v=<versão> nos endereços do estilo e do script em todas as páginas,
    para que ninguém veja página nova com estilo antigo.

Rodar duas vezes seguidas não muda nada (a versão só muda se o conteúdo mudar).
"""
import hashlib
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGINAS = ['index.html', 'imagem.html', 'promessas.html', 'lembrete.html', '404.html']

# Na ordem em que o site vai precisar deles na primeira visita
ARQUIVOS = [
    'assets/css/style.css',
    'assets/js/main.js',
    'assets/fonts/brygada-1918-latin.woff2',
    'assets/fonts/brygada-1918-italic-latin.woff2',
    'assets/fonts/brygada-1918-polones.woff2',
    'assets/fonts/brygada-1918-italic-polones.woff2',
    'assets/img/jesus-misericordioso.webp',
    'index.html',
    'imagem.html',
    'promessas.html',
    'lembrete.html',
    'assets/img/santa-faustina.webp',
    'assets/img/terco-devocionario.avif',
    'assets/img/marca.svg',
    'assets/img/icone-192.png',
    'site.webmanifest',
]
VERSIONADOS = {'assets/css/style.css', 'assets/js/main.js'}  # levam ?v= no endereço
COM_LISTA = ['assets/js/main.js', 'sw.js']

RE_VERSAO = re.compile(r"/\*VERSAO\*/'[^']*'/\*FIM\*/")
RE_LISTA = re.compile(r'/\*LISTA\*/.*?/\*FIM\*/', re.S)
RE_V = re.compile(r'(assets/(?:css/style\.css|js/main\.js))\?v=[\w-]*')


def ler(nome):
    with open(os.path.join(RAIZ, nome), 'rb') as f:
        return f.read()


def gravar(nome, dados):
    caminho = os.path.join(RAIZ, nome)
    with open(caminho, 'rb') as f:
        if f.read() == dados:
            return False
    with open(caminho, 'wb') as f:
        f.write(dados)
    return True


def neutro(nome):
    """Conteúdo sem as partes que este script escreve (para a versão não depender dela mesma)."""
    if not nome.endswith(('.html', '.js', '.css', '.svg', '.webmanifest')):
        return ler(nome)
    t = ler(nome).decode('utf-8')
    t = RE_VERSAO.sub("/*VERSAO*/''/*FIM*/", t)
    t = RE_LISTA.sub('/*LISTA*/[]/*FIM*/', t)
    t = RE_V.sub(r'\1?v=', t)
    return t.encode('utf-8')


def main():
    faltam = [a for a in ARQUIVOS + COM_LISTA if not os.path.exists(os.path.join(RAIZ, a))]
    if faltam:
        sys.exit('Arquivos não encontrados: ' + ', '.join(faltam))

    h = hashlib.sha1()
    for nome in sorted(set(ARQUIVOS + COM_LISTA)):
        h.update(nome.encode('utf-8') + b'\0' + neutro(nome) + b'\0')
    versao = 'dm-' + h.hexdigest()[:10]

    def endereco(nome):
        return nome + '?v=' + versao if nome in VERSIONADOS else nome

    mudou = set()
    # As páginas primeiro: o tamanho delas entra na lista
    for nome in PAGINAS:
        t = ler(nome).decode('utf-8')
        if gravar(nome, RE_V.sub(r'\1?v=' + versao, t).encode('utf-8')):
            mudou.add(nome)

    # A lista leva o tamanho de cada arquivo, inclusive do main.js, que contém a
    # própria lista: repete até os números pararem de mudar.
    for _ in range(6):
        lista = json.dumps([[endereco(a), len(ler(a))] for a in ARQUIVOS], separators=(',', ':'))
        alterou = False
        for nome in COM_LISTA:
            t = ler(nome).decode('utf-8')
            t = RE_VERSAO.sub("/*VERSAO*/'" + versao + "'/*FIM*/", t)
            t = RE_LISTA.sub(lambda m: '/*LISTA*/' + lista + '/*FIM*/', t)
            if gravar(nome, t.encode('utf-8')):
                alterou = True
                mudou.add(nome)
        if not alterou:
            break

    print('versão', versao)
    print('atualizados:', ', '.join(sorted(mudou)) if mudou else 'nenhum (já estava em dia)')


if __name__ == '__main__':
    main()
