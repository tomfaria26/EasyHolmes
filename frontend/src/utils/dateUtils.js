/**
 * Formata uma data para o formato brasileiro
 * @param {string|Date} dateString - Data a ser formatada
 * @param {boolean} includeTime - Se deve incluir o horário
 * @returns {string} Data formatada
 */
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return 'Data não disponível'
  
  try {
    const dt = new Date(dateString)
    
    // Verificar se a data é válida
    if (isNaN(dt.getTime())) {
      return 'Data inválida'
    }
    
    // Ajustar para fuso horário de São Paulo (UTC-3)
    const saoPauloOffset = -3 * 60 * 60 * 1000 // -3 horas em milissegundos
    const localTime = new Date(dt.getTime() + saoPauloOffset)
    
    if (includeTime) {
      return localTime.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return localTime.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return 'Data inválida'
  }
}

/**
 * Formata uma data para exibição relativa (ex: "há 2 dias")
 * @param {string|Date} dateString - Data a ser formatada
 * @returns {string} Data relativa formatada
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return 'Data não disponível'
  
  try {
    const dt = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - dt)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Hoje'
    } else if (diffDays === 1) {
      return 'Ontem'
    } else if (diffDays < 7) {
      return `Há ${diffDays} dias`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `Há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`
    } else {
      const years = Math.floor(diffDays / 365)
      return `Há ${years} ${years === 1 ? 'ano' : 'anos'}`
    }
  } catch (error) {
    console.error('Erro ao formatar data relativa:', error)
    return 'Data inválida'
  }
}

/**
 * Verifica se uma data está vencida
 * @param {string|Date} dateString - Data a ser verificada
 * @returns {boolean} True se a data está vencida
 */
export function isOverdue(dateString) {
  if (!dateString) return false
  
  try {
    const dt = new Date(dateString)
    const now = new Date()
    return dt < now
  } catch (error) {
    console.error('Erro ao verificar data vencida:', error)
    return false
  }
}

/**
 * Formata uma data para exibição em tabelas
 * @param {string|Date} dateString - Data a ser formatada
 * @returns {string} Data formatada para tabela
 */
export function formatTableDate(dateString) {
  if (!dateString) return '-'
  
  try {
    const dt = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - dt)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Se for hoje, mostrar apenas o horário
    if (diffDays === 0) {
      return dt.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // Se for ontem, mostrar "Ontem" + horário
    if (diffDays === 1) {
      return `Ontem ${dt.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    }
    
    // Se for nos últimos 7 dias, mostrar o dia da semana
    if (diffDays < 7) {
      return dt.toLocaleDateString('pt-BR', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // Caso contrário, mostrar data completa
    return formatDate(dateString, true)
  } catch (error) {
    console.error('Erro ao formatar data para tabela:', error)
    return '-'
  }
} 