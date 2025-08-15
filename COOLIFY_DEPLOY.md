# Guia de Deploy do EasyHolmes no Coolify

Este guia detalha o processo passo a passo para fazer o deploy da aplicação EasyHolmes, que utiliza Docker Compose, na plataforma de auto-hospedagem Coolify.

## 1. Pré-requisitos

- Uma instância do Coolify instalada e funcionando.
- O código-fonte do projeto EasyHolmes em um repositório Git (GitHub, GitLab, etc.).
- Acesso ao painel do Coolify para configurar os serviços.

## 2. Estrutura do Projeto no Coolify

O Coolify fará o deploy da nossa aplicação a partir de um repositório Git. Vamos configurar três serviços separados que correspondem aos nossos serviços no `docker-compose.prod.yml`:

- **Serviço de Banco de Dados**: Para o `postgres:15-alpine`.
- **Serviço de Aplicação**: Para o `backend` Node.js.
- **Serviço de Aplicação**: Para o `frontend` Vue.js com Nginx.

## 3. Passo a Passo do Deploy

### 3.1. Configurando o Banco de Dados (PostgreSQL)

O Coolify oferece um serviço de banco de dados PostgreSQL "as a service", o que simplifica muito a configuração.

1.  **Crie um Novo Recurso**:
    *   No painel do Coolify, vá para a seção **"Resources"**.
    *   Clique em **"Add a new resource"** e selecione **"PostgreSQL"**.

2.  **Configure o Banco de Dados**:
    *   **Nome**: Dê um nome descritivo, como `easyholmes-database`.
    *   **Versão**: Selecione uma versão compatível. A `15` é uma boa escolha, conforme o seu `docker-compose.yml`.
    *   As credenciais (usuário, senha, nome do banco) serão geradas automaticamente pelo Coolify. Anote-as, pois você precisará delas para configurar o backend.

3.  **Deploy**:
    *   Clique em **"Deploy"** para provisionar o banco de dados.
    *   Após o deploy, o Coolify exibirá a **URL de conexão interna** do banco. Ela será algo como `postgresql://user:password@service_name:5432/db_name`. Esta URL é vital para o próximo passo.

### 3.2. Configurando o Backend (Node.js)

O backend é uma aplicação Node.js que será implantada como um serviço separado, conectando-se ao banco de dados que criamos.

1.  **Crie um Novo Serviço**:
    *   No painel do Coolify, vá para a seção **"Applications"**.
    *   Clique em **"Add a new resource"** e selecione a fonte do seu repositório Git (GitHub, GitLab, etc.).
    *   Selecione o repositório do EasyHolmes e o branch principal.

2.  **Configure o Build e o Ambiente**:
    *   **Build Pack**: Selecione **"Dockerfile"**. O Coolify detectará automaticamente o `Dockerfile` na raiz do projeto, mas precisamos ajustar o caminho.
    *   **Dockerfile Location**: Especifique o caminho para o Dockerfile do backend: `./backend/Dockerfile`.
    *   **Base Directory**: Defina como `./backend/`. Isso garante que o contexto do build seja o diretório do backend.
    *   **Port**: A porta exposta no `backend/Dockerfile` é a `3000`. O Coolify irá mapeá-la automaticamente.

3.  **Configure as Variáveis de Ambiente**:
    *   Esta é a parte mais importante para a segurança e o funcionamento da aplicação. Vá para a aba **"Environment Variables"**.
    *   Adicione as seguintes variáveis. Marque as sensíveis (`JWT_SECRET`, `API_TOKEN`, `DB_PASSWORD`) como **"secret"**.
        *   `NODE_ENV`: `production`
        *   `PORT`: `3000`
        *   `API_TOKEN`: *Seu token secreto*
        *   `JWT_SECRET`: *Sua chave secreta para JWT*
        *   `DB_HOST`: O nome do serviço do seu banco de dados no Coolify (ex: `easyholmes-database`).
        *   `DB_PORT`: `5432`
        *   `DB_NAME`: O nome do banco de dados criado no passo anterior.
        *   `DB_USER`: O usuário do banco de dados.
        *   `DB_PASSWORD`: A senha do banco de dados.

    > **Nota de Segurança**: Ao usar o nome do serviço (`DB_HOST`) para a conexão, você está utilizando a rede interna e segura do Coolify, evitando expor seu banco de dados à internet pública.

4.  **Configure o Health Check**:
    *   Para garantir que o Coolify possa monitorar corretamente o estado da sua aplicação, é crucial configurar um "health check". Isso evita que o serviço seja marcado como "Unhealthy".
    *   Vá para a aba **"Health Check"** do seu serviço de backend.
    *   Defina os seguintes valores:
        *   **Path**: `/health`
        *   **Port**: `3000`
    *   Isso instrui o Coolify a fazer uma requisição para `http://<container>:3000/health` para verificar se a aplicação está respondendo.

5.  **Deploy**:
    *   Salve as configurações e clique em **"Deploy"**. O Coolify irá clonar o repositório, construir a imagem Docker (agora com `curl` instalado) e iniciar o contêiner.

### 3.3. Configurando o Frontend (Vue.js + Nginx)

O frontend é uma aplicação Vue.js servida por um Nginx.

1.  **Crie um Novo Serviço**:
    *   Siga o mesmo processo do backend: **Applications** > **Add a new resource**.
    *   Selecione o mesmo repositório e branch.

2.  **Configure o Build e o Ambiente**:
    *   **Build Pack**: Selecione **"Dockerfile"**.
    *   **Dockerfile Location**: Especifique o caminho: `./frontend/Dockerfile`.
    *   **Base Directory**: Defina como `./frontend/`.
    *   **Port**: A porta exposta no `frontend/Dockerfile` é a `8080`.

3.  **Variáveis de Ambiente para o Frontend**:
    *   Vá para a aba **"Environment Variables"** do serviço de frontend.
    *   A variável mais importante é a que diz ao Vue.js onde está a API. Como usaremos o proxy do Coolify, o caminho será relativo.
        *   `VUE_APP_API_URL`: `/api`

### 3.4. Configuração de Rede e Proxy

Esta é a etapa crucial para conectar o frontend ao backend. Em vez de gerenciar um proxy reverso dentro do contêiner do Nginx, usaremos o proxy global do Coolify, que é mais poderoso e fácil de gerenciar.

1.  **Acesse as Configurações de Rede do Frontend**:
    *   Navegue até o serviço do `frontend` que você acabou de criar.
    *   Vá para a aba **"Networking"**.
    *   No campo **"FQDN (Fully Qualified Domain Name)"**, você verá o domínio principal gerado pelo Coolify para sua aplicação (ex: `http://<seu-dominio-gerado-pelo-coolify>`). Este será o endereço público do seu frontend.

2.  **Configure o Proxy Global para a API**:
    *   No menu lateral esquerdo do Coolify, vá para a seção **"Proxy"** do seu projeto.
    *   Clique em **"Add New"** para adicionar uma nova rota de proxy.
    *   Preencha os campos da seguinte forma:
        *   **Path**: `/api`
          *   Isso significa que todo o tráfego que chegar no seu domínio principal com o caminho `/api` (ex: `http://<seu-dominio>/api/tasks`) será redirecionado.
        *   **Target**: `http://<nome-do-serviço-backend>:3000`
          *   Este é o alvo do redirecionamento. Use o nome exato do seu serviço de backend no Coolify (ex: `easyholmes-backend`). A URL completa deve ser `http://easyholmes-backend:3000`.

    > **Como funciona?** Ao fazer isso, o Coolify intercepta todas as requisições para `/api` no seu domínio principal e as encaminha para o contêiner do backend na porta `3000`, exatamente como a API espera. O frontend (Vue.js) simplesmente faz chamadas para `/api/...` e o Coolify cuida do resto.

5.  **Deploy**:
    *   Salve as configurações e clique em **"Deploy"**.

### 3.5. Configuração de Domínio e SSL

Depois que todos os serviços estiverem em execução, você pode configurar um domínio personalizado.

1.  **Aponte seu DNS**:
    *   No seu provedor de domínio, crie um registro CNAME ou A apontando seu domínio (ex: `app.seusite.com`) para o endereço IP ou hostname do seu servidor Coolify.

2.  **Configure o Domínio no Coolify**:
    *   No serviço do **frontend**, vá para a aba **"Networking"**.
    *   Adicione seu domínio no campo **"FQDN (Fully Qualified Domain Name)"**.
    *   O Coolify automaticamente provisionará um certificado SSL/TLS gratuito usando Let's Encrypt.

3.  **Acesse sua Aplicação**:
    *   Após a propagação do DNS e a emissão do certificado, sua aplicação estará disponível em `https://app.seusite.com`.

## 4. Conclusão

Seguindo estes passos, você terá a aplicação EasyHolmes implantada no Coolify de forma escalável e segura. A plataforma cuida da orquestração dos contêineres, redes, e certificados SSL, permitindo que você foque no desenvolvimento.