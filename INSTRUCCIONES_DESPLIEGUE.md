# GUÍA DE DESPLIEGUE: PatagoniaCoach Click 🚀

Sigue estos pasos para poner la plataforma en producción.

## 1. Configuración de Base de Datos (Supabase)
1. Ve a tu proyecto en [Supabase](https://supabase.com).
2. Abre el **SQL Editor**.
3. Copia y pega el contenido del archivo `SCHEMA.sql`.
4. Ejecuta el script. Esto creará las tablas `clients`, `links`, `page_views` y `clicks`.

## 2. Variables de Entorno
Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente formato:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

## 3. Autenticación de Administrador
1. En Supabase, ve a **Authentication** > **Users**.
2. Haz clic en **Add User** > **Create new user**.
3. Ingresa tu correo (ej: `admin@agenciapatagoniacoach.cl`) y una contraseña segura.
4. Desactiva "Confirm Email" si quieres entrar de inmediato.

## 4. Ejecución en Local
```bash
npm install
npm run dev
```
Entra a `http://localhost:3000/login` para acceder al panel.

## 5. Datos de Prueba (Seed)
Una vez dentro del Dashboard:
1. Crea el cliente **Ruta9** con slug `ruta9`.
2. Entra a su perfil y añade los botones: "WhatsApp", "Menú", "Instagram".
3. Visita `http://localhost:3000/ruta9` para ver el resultado.

---
**Desarrollado por Agencia PatagoniaCoach**
"Domina tus métricas, domina tu mercado."
