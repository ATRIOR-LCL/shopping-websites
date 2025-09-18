import { initConfig } from './lib/database';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function initDatabase() {
  let connection: mysql.Connection | null = null;

  try {
    console.log('开始初始化数据库...');

    // 创建初始化连接（不指定数据库）
    connection = await mysql.createConnection(initConfig);

    // 读取 SQL 文件
    const sqlPath = path.resolve(__dirname, '../../database/init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // 分割 SQL 语句（按分号分割）
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // 执行每个 SQL 语句
    for (const sql of sqlStatements) {
      if (sql.trim()) {
        console.log('执行 SQL:', sql.substring(0, 50) + '...');
        // 对于 USE、CREATE DATABASE 等语句使用 query 方法
        if (sql.includes('USE ') || sql.includes('CREATE DATABASE') || sql.includes('CREATE TABLE')) {
          await connection.query(sql);
        } else {
          await connection.execute(sql);
        }
      }
    }

    console.log('数据库初始化完成！');

    // 使用 shopping-websites 数据库验证数据
    await connection.query('USE `shopping-websites`');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [items] = await connection.execute('SELECT COUNT(*) as count FROM items');
    console.log(`用户表记录数: ${(users as any)[0].count}`);
    console.log(`商品表记录数: ${(items as any)[0].count}`);

  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  initDatabase();
}

export default initDatabase;
