const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error(
      'Falta SUPABASE_DB_URL. Configura la cadena de conexión del proyecto del cliente antes de ejecutar la migración.'
    );
  }
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
    console.log("✅ La estructura de la comunidad ha sido creada en Supabase.");
  } catch (err) {
    console.error("Error ejecutando la migración en Supabase:", err);
  } finally {
    await client.end();
  }
}

runMigration();
