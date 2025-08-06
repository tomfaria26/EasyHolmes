# Estágio de desenvolvimento
FROM node:18 AS development

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando para desenvolvimento
CMD ["npm", "run", "dev"]

# Estágio de produção
FROM node:18-slim AS production

WORKDIR /app

# Criar usuário não-root
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# Copiar código fonte
COPY . .

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Comando para produção
CMD ["npm", "start"] 