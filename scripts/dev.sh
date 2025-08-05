#!/bin/bash

# Script de desenvolvimento para EasyHolmes
# Uso: ./scripts/dev.sh [comando]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[EasyHolmes]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker não está rodando. Inicie o Docker e tente novamente."
        exit 1
    fi
}

# Verificar se arquivo .env existe
check_env() {
    if [ ! -f .env ]; then
        print_warning "Arquivo .env não encontrado. Copiando de env.example..."
        cp env.example .env
        print_info "Arquivo .env criado. Edite-o com suas configurações."
    fi
}

# Comando: start
start() {
    print_message "Iniciando EasyHolmes em modo desenvolvimento..."
    check_docker
    check_env
    docker-compose up --build
}

# Comando: stop
stop() {
    print_message "Parando EasyHolmes..."
    docker-compose down
}

# Comando: restart
restart() {
    print_message "Reiniciando EasyHolmes..."
    stop
    start
}

# Comando: logs
logs() {
    print_message "Exibindo logs..."
    docker-compose logs -f
}

# Comando: clean
clean() {
    print_message "Limpando containers e volumes..."
    docker-compose down -v
    docker system prune -f
}

# Comando: rebuild
rebuild() {
    print_message "Rebuildando imagens..."
    docker-compose build --no-cache
    start
}

# Comando: shell-backend
shell_backend() {
    print_message "Abrindo shell do backend..."
    docker-compose exec backend sh
}

# Comando: shell-frontend
shell_frontend() {
    print_message "Abrindo shell do frontend..."
    docker-compose exec frontend sh
}

# Comando: install-deps
install_deps() {
    print_message "Instalando dependências..."
    
    # Backend
    print_info "Instalando dependências do backend..."
    cd backend && npm install && cd ..
    
    # Frontend
    print_info "Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
    
    print_message "Dependências instaladas com sucesso!"
}

# Comando: help
help() {
    echo "EasyHolmes - Script de Desenvolvimento"
    echo ""
    echo "Uso: ./scripts/dev.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start          - Inicia o projeto em modo desenvolvimento"
    echo "  stop           - Para todos os containers"
    echo "  restart        - Reinicia o projeto"
    echo "  logs           - Exibe logs dos containers"
    echo "  clean          - Limpa containers e volumes"
    echo "  rebuild        - Rebuilda as imagens e inicia"
    echo "  shell-backend  - Abre shell no container do backend"
    echo "  shell-frontend - Abre shell no container do frontend"
    echo "  install-deps   - Instala dependências localmente"
    echo "  help           - Exibe esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/dev.sh start"
    echo "  ./scripts/dev.sh logs"
    echo "  ./scripts/dev.sh shell-backend"
}

# Verificar argumentos
if [ $# -eq 0 ]; then
    help
    exit 1
fi

# Executar comando
case $1 in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    clean)
        clean
        ;;
    rebuild)
        rebuild
        ;;
    shell-backend)
        shell_backend
        ;;
    shell-frontend)
        shell_frontend
        ;;
    install-deps)
        install_deps
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Comando desconhecido: $1"
        echo ""
        help
        exit 1
        ;;
esac 