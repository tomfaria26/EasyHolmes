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

O frontend é uma aplicação Vue.js servida por um Nginx, que também atua como proxy reverso para o backend.

1.  **Crie um Novo Serviço**:
    *   Siga o mesmo processo do backend: **Applications** > **Add a new resource**.
    *   Selecione o mesmo repositório e branch.

2.  **Configure o Build e o Ambiente**:
    *   **Build Pack**: Selecione **"Dockerfile"**.
    *   **Dockerfile Location**: Especifique o caminho: `./frontend/Dockerfile`.
    *   **Base Directory**: Defina como `./frontend/`.
    *   **Port**: A porta exposta no `frontend/Dockerfile` é a `8080`.

3.  **Configurando o Proxy Reverso para o Backend**:
    *   O nosso `nginx.conf` está configurado para fazer proxy de `/api/` para `http://backend:3000/api/`. O Coolify não reconhecerá o nome do serviço `backend` diretamente. Precisamos usar as variáveis de ambiente que o Coolify provê.
    *   No Coolify, cada serviço tem uma URL interna. A URL do nosso serviço de backend será algo como `http://<nome-do-serviço-backend>:<porta>`.
    *   Para resolver isso, temos duas opções no Coolify:

        **Opção A (Recomendada): Usar o Proxy do Coolify**
        1.  No serviço do **frontend**, vá para a aba **"Networking"**.
        2.  Desabilite a publicação da porta `8080` se não for necessária externamente.
        3.  Em vez de usar o proxy do Nginx, configure o proxy diretamente no Coolify. Vá para a seção de **"Proxy"** do seu projeto.
        4.  Configure o domínio principal (ex: `app.seusite.com`) para apontar para o serviço do **frontend**, na porta `8080`.
        5.  Adicione uma rota de proxy para o backend:
            *   **Path**: `/api`
            *   **Target**: `http://<nome-do-serviço-backend>:3000`

        **Opção B: Ajustar o `nginx.conf` (Menos flexível)**
        1.  Você teria que modificar o `nginx.conf` para receber a URL do backend como uma variável de ambiente e usar `envsubst` no `CMD` do `frontend/Dockerfile` para substituí-la. Esta abordagem é mais complexa e menos recomendada.

4.  **Variáveis de Ambiente para o Frontend**:
    *   Vá para a aba **"Environment Variables"** do serviço de frontend.
    *   A variável mais importante é a que diz ao Vue.js onde está a API.
        *   `VUE_APP_API_URL`: `/api` (se usar a Opção A) ou a URL pública completa do seu backend.

5.  **Deploy**:
    *   Salve as configurações e clique em **"Deploy"**.

### 3.4. Configuração de Domínio e SSL

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