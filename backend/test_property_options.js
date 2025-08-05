const axios = require('axios');
require('dotenv').config();

// Configuração do cliente HTTP
const holmesClient = axios.create({
  baseURL: process.env.HOLMES_API_BASE_URL || 'https://app-api.holmesdoc.io/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': process.env.API_TOKEN
  }
});

async function testTaskProperties() {
  try {
    // Primeiro, vamos buscar uma tarefa específica
    console.log('Buscando detalhes da tarefa...');
    const taskResponse = await holmesClient.get('/tasks/6892731599e1ddb51c24ad87'); // ID real da tarefa
    const taskDetails = taskResponse.data;
    
    console.log('Estrutura completa da tarefa:', JSON.stringify(taskDetails, null, 2));
    console.log('\nPropriedades da tarefa:', JSON.stringify(taskDetails.properties, null, 2));
    
    // Verificar se há propriedades
    if (!taskDetails.properties || taskDetails.properties.length === 0) {
      console.log('\n⚠️  Nenhuma propriedade encontrada na tarefa!');
      return;
    }
    
    // Agora vamos testar buscar opções para cada propriedade que tem type
    for (const property of taskDetails.properties) {
      console.log(`\n=== Propriedade: ${property.name} ===`);
      console.log(`ID: ${property.id}`);
      console.log(`Type: ${property.type}`);
      console.log(`Required: ${property.required}`);
      console.log(`Estrutura completa:`, JSON.stringify(property, null, 2));
      
      if (property.type) {
        console.log(`\nBuscando opções para type: ${property.type}`);
        
        try {
          // Testar com payload correto baseado no exemplo Python
          console.log('Testando com payload correto...');
          const searchPayload = {
            "query": {
              "from": 0,
              "size": 200,
              "order": "asc",
              "groups": [{
                "match_all": true,
                "terms": [{
                  "field": "entity_id",
                  "type": "is",
                  "value": property.type
                }]
              }],
              "sort": "8547a640-504b-11f0-a2c8-75d9e0938171"
            }
          };
          
          const optionsResponse = await holmesClient.post(`/entities/${property.type}/instances/search`, searchPayload);
          console.log(`Opções encontradas:`, JSON.stringify(optionsResponse.data, null, 2));
          
          // Verificar se há docs na resposta
          if (optionsResponse.data.docs) {
            console.log(`Número de opções: ${optionsResponse.data.docs.length}`);
            optionsResponse.data.docs.forEach((option, index) => {
              console.log(`  Opção ${index + 1}: ${option.name} (ID: ${option.id})`);
            });
          } else {
            console.log(`⚠️  Nenhuma opção encontrada (docs não presente na resposta)`);
          }
          
        } catch (error) {
          console.error(`❌ Erro ao buscar opções para ${property.name}:`, error.message);
          if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, JSON.stringify(error.response.data, null, 2));
          }
        }
      } else {
        console.log(`\n⚠️  Propriedade ${property.name} não tem type definido - será renderizada como campo de texto`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar o teste
testTaskProperties(); 