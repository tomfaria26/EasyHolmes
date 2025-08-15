const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

/**
 * Modelo de usuário para gerenciamento de usuários com PostgreSQL
 */
class User {
  constructor() {
    // Lógica de configuração do pool de conexão
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    } else {
      this.pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'easyholmes',
        user: process.env.DB_USER || 'easyholmes',
        password: process.env.DB_PASSWORD || 'easyholmes123',
      });
    }
    
    this.initDatabase();
  }

  /**
   * Inicializar banco de dados e criar tabela de usuários
   */
  async initDatabase() {
    try {
      const client = await this.pool.connect();
      
      // Criar tabela de usuários se não existir
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Verificar se usuário admin existe
      const adminCheck = await client.query(
        "SELECT COUNT(*) as count FROM users WHERE email = $1",
        ['admin@easyholmes.com']
      );

      if (parseInt(adminCheck.rows[0].count) === 0) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await client.query(`
          INSERT INTO users (name, email, password, role) 
          VALUES ($1, $2, $3, $4)
        `, ['Administrador', 'admin@easyholmes.com', hashedPassword, 'admin']);
        
        console.log('Usuário admin criado com sucesso');
      }

      client.release();
    } catch (err) {
      console.error('Erro ao inicializar banco de dados:', err);
    }
  }

  /**
   * Buscar usuário por email
   */
  async findByEmail(email) {
    try {
      const client = await this.pool.connect();
      const result = await client.query(
        "SELECT id, name, email, password, role, is_active FROM users WHERE email = $1",
        [email]
      );
      client.release();
      
      return result.rows[0] || null;
    } catch (err) {
      console.error('Erro ao buscar usuário por email:', err);
      throw err;
    }
  }

  /**
   * Buscar usuário por ID
   */
  async findById(id) {
    try {
      const client = await this.pool.connect();
      const result = await client.query(
        "SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = $1",
        [id]
      );
      client.release();
      
      return result.rows[0] || null;
    } catch (err) {
      console.error('Erro ao buscar usuário por ID:', err);
      throw err;
    }
  }

  /**
   * Buscar todos os usuários
   */
  async findAll() {
    try {
      const client = await this.pool.connect();
      const result = await client.query(
        "SELECT id, name, email, role, is_active, created_at, updated_at FROM users ORDER BY name"
      );
      client.release();
      
      return result.rows;
    } catch (err) {
      console.error('Erro ao buscar todos os usuários:', err);
      throw err;
    }
  }

  /**
   * Criar novo usuário
   */
  async create(userData) {
    try {
      const client = await this.pool.connect();
      const { name, email, password, role = 'user' } = userData;
      
      // Hash da senha
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      const result = await client.query(`
        INSERT INTO users (name, email, password, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, role
      `, [name, email, hashedPassword, role]);
      
      client.release();
      
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      throw err;
    }
  }

  /**
   * Atualizar usuário
   */
  async update(id, userData) {
    try {
      const client = await this.pool.connect();
      const { name, email, password, role, is_active } = userData;
      
      let query = "UPDATE users SET name = $1, email = $2, role = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP";
      let params = [name, email, role, is_active];
      let paramCount = 4;
      
      // Se uma nova senha foi fornecida, incluí-la na atualização
      if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        paramCount++;
        query += `, password = $${paramCount}`;
        params.push(hashedPassword);
      }
      
      paramCount++;
      query += ` WHERE id = $${paramCount}`;
      params.push(id);
      
      await client.query(query, params);
      client.release();
      
      return { id, name, email, role, is_active };
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      throw err;
    }
  }

  /**
   * Deletar usuário
   */
  async delete(id) {
    try {
      const client = await this.pool.connect();
      const result = await client.query(
        "DELETE FROM users WHERE id = $1",
        [id]
      );
      client.release();
      
      return { deleted: result.rowCount > 0 };
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      throw err;
    }
  }

  /**
   * Verificar se email já existe
   */
  async emailExists(email, excludeId = null) {
    try {
      const client = await this.pool.connect();
      
      let query = "SELECT COUNT(*) as count FROM users WHERE email = $1";
      let params = [email];
      
      if (excludeId) {
        query += " AND id != $2";
        params.push(excludeId);
      }
      
      const result = await client.query(query, params);
      client.release();
      
      return parseInt(result.rows[0].count) > 0;
    } catch (err) {
      console.error('Erro ao verificar email:', err);
      throw err;
    }
  }

  /**
   * Verificar senha
   */
  async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      return false;
    }
    
    return bcrypt.compareSync(password, user.password);
  }
}

module.exports = new User(); 