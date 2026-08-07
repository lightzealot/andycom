const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = "postgresql://postgres:Ni72da1213.@db.pkimwppqoujxbntxdzxu.supabase.co:5432/postgres";
  console.log("Conectando a la base de datos Supabase PostgreSQL...");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("¡Conexión establecida con Supabase con éxito!");

    const sqlPath = path.join(__dirname, 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Ejecutando script de creación de tablas y políticas de seguridad (RLS)...");
    await client.query(sql);
    console.log("✅ ¡Todas las tablas, índices y datos iniciales de andyontrade han sido creados en Supabase!");
  } catch (err) {
    console.error("Error ejecutando la migración en Supabase:", err);
  } finally {
    await client.end();
  }
}

runMigration();
