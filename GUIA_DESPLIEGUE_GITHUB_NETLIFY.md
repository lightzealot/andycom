# 🚀 Guía de Despliegue Online: GitHub, Netlify & Base de Datos Supabase

Esta guía te explica paso a paso cómo montar **andyontrade** en GitHub, desplegarlo online en **Netlify** con tu propio dominio y conectar la base de datos en la nube **Supabase (PostgreSQL)**.

---

## 📌 Paso 1: Subir el Proyecto a tu GitHub

1. Abre tu terminal en la carpeta del proyecto:
   ```bash
   cd C:\Users\andre\.gemini\antigravity\scratch\skool-community-app
   ```

2. Inicializa el repositorio Git (si aún no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "feat: plataforma andyontrade completa y lista para deploy"
   ```

3. Crea un nuevo repositorio en tu cuenta de [GitHub.com](https://github.com/new) llamado `andyontrade`.

4. Conecta tu repositorio local y sube los archivos:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/andyontrade.git
   git push -u origin main
   ```

---

## ⚡ Paso 2: Desplegar en Netlify (Gratis en 2 Minutos)

1. Entra a [https://app.netlify.com/](https://app.netlify.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en el botón **"Add new site"** > **"Import an existing project"**.
3. Selecciona **GitHub** y escoge tu repositorio `andyontrade`.
4. Netlify detectará automáticamente los parámetros gracias al archivo `netlify.toml` ya incluido:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Haz clic en **"Deploy andyontrade"**.
6. ¡Listo! En menos de 60 segundos tendrás tu enlace público funcionando (ej: `https://andyontrade.netlify.app`), y puedes vincular tu dominio personalizado (ej: `andyontrade.com`).

---

## 🗄️ Paso 3: Conectar la Base de Datos en la Nube (Supabase / PostgreSQL)

1. Entra a [https://supabase.com/](https://supabase.com/) y crea un proyecto nuevo gratuito.
2. En el panel izquierdo de Supabase, entra en **SQL Editor**.
3. Abre el archivo `supabase_schema.sql` que te dejamos en la raíz de tu proyecto, copia todo su contenido, pégalo en el editor de Supabase y haz clic en **Run**.
   *(Esto creará automáticamente todas las tablas: perfiles, posts, comentarios, encuestas, cursos, lecciones, eventos y mensajes).*
4. En Supabase, ve a **Project Settings** > **API** y copia:
   - **Project URL**
   - **anon / public key**
5. Ve a tu panel de **Netlify** > **Site configuration** > **Environment variables** y añade estas dos variables:
   - `VITE_SUPABASE_URL` = (Tu Project URL)
   - `VITE_SUPABASE_ANON_KEY` = (Tu anon public key)
6. En Netlify haz clic en **Trigger deploy** para que se recompile con la base de datos conectada.

---

## 👑 Acceso de Administrador (Creator Studio)
- En la cabecera superior de la web, haz clic en la pestaña **Admin Studio**.
- Desde allí tienes el **control total de Skool**:
  - Crear y editar cursos, módulos y lecciones (con videos de YouTube/Vimeo y checklists de acción).
  - Gestionar miembros y cambiar sus roles (Admin, Moderador, VIP, Miembro Pro).
  - Fijar o moderar publicaciones del Feed.
  - Ajustar el nombre, descripción y precios de membresía ($49/mes y $399/año).
- Puedes alternar en cualquier momento entre **Modo Administrador** y **Modo Alumno (Nivel 1)** con el botón en la cabecera para ver la experiencia que tendrán tus estudiantes.
