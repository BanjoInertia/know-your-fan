# Challenge #2: Know Your Fan - Marcelo Henrique Ramos

## 🚀 Sobre o Desafio

Este projeto foi desenvolvido como solução para o **Challenge #2: Know Your Fan [HARD]**. O objetivo principal é criar uma aplicação ou solução capaz de coletar o máximo de informações sobre um fã de e-sports, para possibilitar que a FURIA ofereça experiências e serviços mais personalizados e exclusivos.

## ✨ Funcionalidades Implementadas

Esta solução permite as seguintes ações:

1.  **👤 Coleta de Dados:**
    *   Coleta de informações básicas: Nome, Endereço, CPF.
    *   Registro de interesses, atividades, eventos frequentados e compras relacionadas a e-sports no último ano.

2.  **📄 Upload e Validação de Documentos com IA:**
    *   Permite o upload de documentos de identificação (Ex: RG, CNH).
    *   Utiliza a API Gemini para realizar OCR no documento, extrair Nome, CPF e Data de Nascimento, e compará-los com os dados fornecidos pelo usuário.

3.  **🔗 Vinculação de Redes Sociais:**
    *   Permite autenticar e vincular o perfil da Twitch do usuário.
    *   Obtém a foto de perfil e verifica se o usuário segue o canal da FURIA na Twitch.

4.  **🎮 Conteúdo Personalizado (Notícias e Partidas):**
    *   Exibe as últimas notícias sobre a FURIA filtradas pelo jogo favorito selecionado pelo usuário via Scraping.
    *   Apresenta uma lista com o histórico recente das partidas da FURIA no VALORANT via Scraping.

## 🛠️ Tecnologias Utilizadas

*   **Linguagem:** JavaScript
*   **Frontend:**
    *   Framework: React (v18.x)
    *   Roteamento: React Router
    *   Animações: Framer Motion
    *   Estilização: Styled Components
*   **Backend:**
    *   Ambiente: Node.js (v16+)
    *   Framework: Node.js *(Nota: Se você estiver usando um framework específico como Express.js ou NestJS sobre o Node.js, mencione-o aqui)*
*   **Armazenamento de Dados:**
    *   Armazenamento Local do Navegador (LocalStorage)
*   **Inteligência Artificial:**
    *   Validação de Identidade: Google Gemini API
*   **APIs Externas e Serviços:**
    *   Autenticação Social: Twitch Developers API (OAuth)
    *   Coleta de Dados Externos: Web Scraping (especificamente de: `thespike.gg`, `vlr.gg`, `draft5.gg`, `gamersclub.gg`)

## ⚙️ Configuração e Execução

Siga os passos abaixo para configurar e executar o projeto localmente:

**1. Pré-requisitos:**
*   Node.js (v16 ou superior recomendado)
*   npm
*   Git

**2. Clonar o Repositório:**
```bash
git clone -b versao-limpa-finalizado https://github.com/BanjoInertia/know-your-fan

cd know-your-fan

npm install
```

**3. Configurar Variáveis de Ambiente:**
*   Na pasta raiz, crie um arquivo com o nome `.env`.
*   Abra o arquivo `.env` e cole o texto abaixo dentro dele, após isso, substitua os valores de placeholder (como `SUA_CHAVE_AQUI`) pelas suas credenciais reais obtidas nos respectivos serviços (Gemini, Twitch, News API). Gere um `SESSION_SECRET` seguro.


```bash
# Obtenha sua chave em https://aistudio.google.com/apikey
GEMINI_API_KEY=SUA_CHAVE_API_GEMINI_AQUI

FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
PORT=3001

# Obtenha sua chave em https://dev.twitch.tv/console/apps
TWITCH_CLIENT_ID=SEU_TWITCH_CLIENT_ID_AQUI
TWITCH_CLIENT_SECRET=SEU_TWITCH_CLIENT_SECRET_AQUI
TWITCH_REDIRECT_URI=http://localhost:3001/auth/twitch/callback # Ajuste a porta se necessário

# Segredo para assinatura de sessão (gere uma string aleatória segura)
SESSION_SECRET=SEU_SEGREDO_DE_SESSAO_SEGURO_AQUI
```

**4. Iniciar o projeto localmente, e o backend:**

Criar dois terminais, um para o frontend e outro para o backend

Primeiro terminal:
```bash
npm run dev
```
Segundo terminal:
```bash
node server.js
``` 

## 🚀 Como Usar:
Após iniciar o frontend e o backend, acesse a URL do frontend (ex: http://localhost:5173) no seu navegador.

Crie um novo perfil de fã preenchendo o formulário com seus dados básicos e selecionando seus interesses em e-sports.

Na seção de validação de identidade do formulário, faça o upload de uma imagem do seu documento (RG ou CNH). O sistema usará IA para tentar validar os dados.

Acesse a área de perfil, autorizando o aplicativo. O sistema verificará se você segue a FURIA.

Explore a seção de notícias para ver artigos sobre a FURIA relacionados ao seu jogo favorito.

Confira a seção de partidas para ver os resultados recentes da equipe de VALORANT da FURIA.

## 👨‍💻 Autor:

**LinkedIn:** https://www.linkedin.com/in/marcelo-ramos-8412202b5/

**GitHub:** https://github.com/BanjoInertia

**Portfólio:** https://portifolio-banjo-inertia.netlify.app