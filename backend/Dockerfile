# Estágio de desenvolvimento
FROM node:18-alpine AS development

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando para desenvolvimento
CMD ["npm", "run", "dev"]

# Estágio de produção
FROM node:18-alpine AS production

WORKDIR /app

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretório para banco de dados
RUN mkdir -p database && chown -R nodejs:nodejs database

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Comando para produção
CMD ["npm", "start"] 