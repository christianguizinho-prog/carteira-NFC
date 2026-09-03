# ◈ NFC Wallet

<div align="center">

### 🔐 Sua carteira digital para gerenciamento de tags NFC

**Gerencie · Leia · Compartilhe · Proteja**




\

</div>

---

## 🧬 Sobre o projeto

**NFC Wallet** é uma aplicação web desenvolvida para facilitar o gerenciamento de **tags NFC** em uma interface moderna, tecnológica e responsiva.

O sistema permite que usuários criem uma conta, registrem tags NFC, acompanhem o histórico de leituras e decidam se cada tag será **privada ou pública**.

As tags públicas podem ser compartilhadas através de um link, permitindo criar uma experiência semelhante a um **cartão digital NFC**.

---

## ✨ Principais recursos

| Recurso             | Descrição                                |
| ------------------- | ---------------------------------------- |
| 🔐 Autenticação     | Cadastro e login através do Supabase     |
| 📡 Web NFC          | Leitura de tags NFC compatíveis          |
| 🏷️ Gerenciamento   | Cadastro e personalização das tags       |
| 🔒 Privacidade      | Tags privadas protegidas por RLS         |
| 🌐 Página pública   | Página individual para cada tag pública  |
| 🔗 Compartilhamento | Compartilhamento nativo e cópia de links |
| 📊 Histórico        | Registro das últimas leituras            |
| 🌙 Temas            | Tema escuro e claro                      |
| 📱 Responsivo       | Interface adaptada para celulares        |
| 📲 PWA              | Instalação como aplicativo               |
| 🗄️ PostgreSQL      | Banco de dados através do Supabase       |

---

# 🖥️ Interface

O NFC Wallet possui uma identidade visual inspirada em **HUDs futuristas, tecnologia NFC e interfaces digitais**.

### Dashboard

```text
┌──────────────────────────────────────────┐
│ ◉ NFC WALLET                     ☾  SAIR │
│                                          │
│          CARTEIRA DIGITAL                │
│                                          │
│          Minha NFC Wallet                │
│                                          │
│     ┌──────────────────────────────┐     │
│     │ NFC WALLET              ◈    │     │
│     │                              │     │
│     │ USUÁRIO NFC                  │     │
│     │                              │     │
│     │ ID DA TAG              ))))  │     │
│     └──────────────────────────────┘     │
│                                          │
│       [ ◉ Ler NFC ] [ + Adicionar ]      │
│                                          │
│     STATUS          DISPOSITIVO          │
│     NFC conectado   NFC disponível       │
└──────────────────────────────────────────┘
```

---

# 🏗️ Arquitetura

```text
                         ┌─────────────────┐
                         │    NFC Wallet   │
                         └────────┬────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
       ┌───────────┐       ┌────────────┐       ┌─────────────┐
       │ Frontend  │       │   Web NFC  │       │     PWA     │
       │ HTML/CSS  │       │ NDEFReader │       │ Manifest/SW │
       │ JavaScript│       └─────┬──────┘       └─────────────┘
       └─────┬─────┘             │
             │                   │
             └──────────┬────────┘
                        ▼
                ┌───────────────┐
                │    Supabase   │
                └───────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      ┌────────┐   ┌──────────┐   ┌──────────┐
      │ Auth   │   │PostgreSQL│   │   RLS    │
      └────────┘   └──────────┘   └──────────┘
```

---

# 📁 Estrutura do projeto

```text
NFC-Wallet/
│
├── 📄 index.html
├── 🎨 style.css
├── ⚡ script.js
├── 🔌 supabase.js
│
├── 🌐 tag.html
├── ⚡ tag.js
│
├── 📱 manifest.json
├── ⚙️ sw.js
├── 🖼️ icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── gerar-icones.py
│
├── 🗄️ schema.sql
└── 📖 README.md
```

---

# 🛠️ Tecnologias

### Frontend

* HTML5
* CSS3
* JavaScript ES6+
* Web APIs
* Responsive Design

### Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Row Level Security

### PWA

* Web App Manifest
* Service Worker
* Cache API

### NFC

* Web NFC API
* `NDEFReader`

---

# 🗄️ Banco de dados

O banco de dados é gerenciado pelo **Supabase**.

## `perfis`

Armazena os dados dos usuários.

```text
id
nome
criada_em
```

---

## `tags_nfc`

Armazena as tags cadastradas.

```text
id
usuario_id
nome
tag_id
descricao
publica
criada_em
atualizada_em
```

### Exemplo

```text
Nome: Minha Carteira
ID: 04:A3:82:91
Pública: true
```

---

## `leituras_nfc`

Armazena o histórico.

```text
id
usuario_id
tag_id
dispositivo
lida_em
```

---

# 🔐 Segurança

O NFC Wallet utiliza **Row Level Security (RLS)** para impedir que um usuário acesse os dados privados de outro usuário.

### 🔒 Tag privada

```text
publica = false
```

Somente o proprietário autenticado pode acessar.

### 🌐 Tag pública

```text
publica = true
```

Pode ser acessada através da página pública.

---

# 🌐 Página pública

Cada tag pública possui uma URL própria:

```text
https://SEU-DOMINIO.com/tag.html?id=ID_DA_TAG
```

Exemplo:

```text
https://nfcwallet.com/tag.html?id=550e8400-e29b-41d4-a716-446655440000
```

A página pública pode futuramente funcionar como:

* 💳 Cartão digital
* 👤 Perfil pessoal
* 💼 Cartão profissional
* 🔗 Central de links
* 📱 Identificação NFC

---

# 🔗 Compartilhamento

O sistema utiliza a API de compartilhamento do navegador quando disponível.

```javascript
navigator.share({
    title: "NFC Wallet",
    text: "Confira minha tag NFC",
    url: link
});
```

Em navegadores que não possuem essa função, o sistema pode copiar o link automaticamente.

---

# 📱 PWA

O projeto foi estruturado para funcionar como **Progressive Web App**.

Arquivos responsáveis:

```text
manifest.json
sw.js
```

Com isso, o NFC Wallet pode ser instalado em dispositivos compatíveis.

---

# 🚀 Instalação

## 1. Clone o projeto

```bash
git clone SEU_REPOSITORIO
```

Entre na pasta:

```bash
cd NFC-Wallet
```

---

## 2. Configure o Supabase

Crie um projeto no Supabase e obtenha:

```text
Project URL
Publishable Key
```

Depois configure:

```text
supabase.js
```

Exemplo:

```javascript
import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL =
    "SUA_URL";

const SUPABASE_KEY =
    "SUA_CHAVE_PUBLICAVEL";

export const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
```

> ⚠️ Nunca coloque uma chave `service_role` no frontend.

---

## 3. Configure o banco

Copie o conteúdo de `schema.sql` e execute no:

```text
Supabase
   ↓
SQL Editor
   ↓
New Query
   ↓
Run
```

O script cria as tabelas `perfis`, `tags_nfc` e `leituras_nfc`, os índices,
os triggers (perfil automático e `atualizada_em`) e todas as políticas de RLS.

---

## 4. Executar localmente

Qualquer servidor estático funciona (os módulos ES não abrem via `file://`):

```bash
python3 -m http.server 5500
```

Depois acesse:

```text
http://127.0.0.1:5500/
```

No VS Code também é possível usar a extensão **Live Server**.

> A Web NFC exige **HTTPS** (ou `localhost`) e Chrome no Android.

---

## 5. Ícones do PWA

Os ícones já estão em `icons/`. Para gerá-los novamente:

```bash
python3 icons/gerar-icones.py
```

---

# 📡 Web NFC

O sistema verifica se o navegador possui suporte:

```javascript
if ("NDEFReader" in window) {
    // NFC disponível
}
```

A leitura é realizada utilizando:

```javascript
const ndef = new NDEFReader();

await ndef.scan();
```

> O suporte ao Web NFC depende do navegador, sistema operacional e dispositivo.

---

# 🔄 Fluxo da aplicação

```text
                 ┌───────────────┐
                 │     Login     │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │   Dashboard   │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │    Ler NFC    │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ Identificar ID│
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │   Supabase    │
                 └───────┬───────┘
                         │
                 ┌───────┴────────┐
                 ▼                ▼
             🔒 Privada        🌐 Pública
                                  │
                                  ▼
                           ┌─────────────┐
                           │  tag.html   │
                           └─────────────┘
```

---

# 🧪 Status do projeto

| Área               | Status                |
| ------------------ | --------------------- |
| Interface          | 🟢 Funcionando        |
| Login              | 🟢 Implementado       |
| Cadastro           | 🟢 Implementado       |
| Supabase           | 🟢 Integrado          |
| Banco de dados     | 🟢 Implementado       |
| Tags NFC           | 🟢 Implementado       |
| Histórico          | 🟢 Implementado       |
| Tags públicas      | 🟢 Implementado       |
| Compartilhamento   | 🟢 Implementado       |
| Página pública     | 🟢 Implementado       |
| PWA                | 🟢 Implementado       |
| Analytics          | 🔴 Planejado          |
| Dashboard avançado | 🔴 Planejado          |

---

# 🗺️ Roadmap

### 🔵 Fase 1 — Base

* [x] Interface
* [x] Login
* [x] Cadastro
* [x] Supabase
* [x] Banco de dados
* [x] RLS

### 🟢 Fase 2 — NFC

* [x] Leitura NFC
* [x] Cadastro automático
* [x] Histórico
* [x] Nome personalizado

### 🟣 Fase 3 — Compartilhamento

* [x] Tags públicas
* [x] Tags privadas
* [x] Link público
* [x] Compartilhamento

### 🟡 Fase 4 — PWA

* [x] Manifest
* [x] Service Worker
* [x] Instalação
* [x] Cache offline
* [x] Ícones

### 🔴 Fase 5 — Avançado

* [ ] Analytics
* [ ] Contador de acessos
* [ ] QR Code
* [ ] Perfil público
* [ ] Personalização
* [ ] Painel administrativo
* [ ] Sistema de planos

---

# 📊 Futuras estatísticas

O projeto poderá futuramente apresentar:

```text
┌────────────────────────────┐
│       ANALYTICS NFC        │
├────────────────────────────┤
│                            │
│  👁️ Acessos       1.284    │
│  📡 Leituras        342    │
│  🌐 Tags públicas     8    │
│  🔒 Tags privadas    12    │
│                            │
└────────────────────────────┘
```

---

# 👨‍💻 Desenvolvedor

<div align="center">

## Christian Wilherme Da Silva Macedo

Desenvolvedor e criador do **NFC Wallet**.

```text
NFC WALLET
Digital NFC Management System
```

© 2026 **Christian Wilherme Da Silva Macedo**

</div>

---

# ⭐ Contribuição

Sugestões, melhorias e contribuições são bem-vindas.

Se você gostou do projeto, considere deixar uma ⭐ no repositório.

---

# 📄 Licença

Este projeto está em desenvolvimento.

O uso, modificação e distribuição devem respeitar os termos definidos pelo autor.

---

<div align="center">

### ◈ NFC WALLET

**Tecnologia NFC para uma carteira digital moderna.**

Made with 💙 by **Christian Wilherme Da Silva Macedo**

</div>
