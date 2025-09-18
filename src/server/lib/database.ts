import mysql from 'mysql2/promise';

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database?: string; // 使 database 成为可选的
  connectionLimit: number;
}

const config: DatabaseConfig = {
  host: 'localhost',
  user: 'wjh',
  password: '123456',
  database: 'shopping-websites',
  connectionLimit: 10,
};

// 创建连接池
export const pool = mysql.createPool(config);

// 用于初始化的连接配置（不指定数据库）
export const initConfig: DatabaseConfig = {
  host: 'localhost',
  user: 'wjh',
  password: '123456',
  connectionLimit: 10,
};

// 数据库连接单例
export class Database {
  private static instance: Database;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool(config);
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async query(sql: string, params?: any[]): Promise<any> {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();

    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export default Database.getInstance();
