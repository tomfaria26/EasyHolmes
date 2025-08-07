#!/bin/bash

# Script de Deploy - EasyHolmes
# Autor: Sistema
# Data: $(date)

set -e

echo "🚀 Iniciando deploy do EasyHolmes..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    log_error "Arquivo docker-compose.yml não encontrado. Execute este script no diretório do projeto."
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    log_warning "Arquivo .env não encontrado. Copiando de env.example..."
    cp env.example .env
    log_success "Arquivo .env criado."
fi

# Parar containers existentes
log_info "Parando containers existentes..."
docker-compose down

# Fazer build das imagens
log_info "Fazendo build das imagens..."
docker-compose build --no-cache

# Iniciar containers
log_info "Iniciando containers..."
docker-compose up -d

# Aguardar um pouco para os containers inicializarem
log_info "Aguardando inicialização dos containers..."
sleep 10

# Verificar status dos containers
log_info "Verificando status dos containers..."
docker-compose ps

# Testar conectividade
log_info "Testando conectividade..."

# Testar backend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    log_success "Backend está respondendo (porta 3001)"
else
    log_error "Backend não está respondendo"
fi

# Testar frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8083 | grep -q "200"; then
    log_success "Frontend está respondendo (porta 8083)"
else
    log_error "Frontend não está respondendo"
fi

# Verificar banco de dados
if docker exec easyholmes-database pg_isready -U easyholmes > /dev/null 2>&1; then
    log_success "Banco de dados está funcionando (porta 5433)"
else
    log_error "Banco de dados não está funcionando"
fi

echo ""
log_success "Deploy concluído com sucesso!"
echo ""
echo "📋 Informações de acesso:"
echo "   🌐 Frontend: http://localhost:8083"
echo "   🔧 Backend API: http://localhost:3001"
echo "   🗄️  Banco de dados: localhost:5433"
echo ""
echo "📊 Comandos úteis:"
echo "   docker-compose ps          - Ver status dos containers"
echo "   docker-compose logs        - Ver logs"
echo "   docker-compose down        - Parar containers"
echo "   docker-compose up -d       - Iniciar containers"
echo "" 