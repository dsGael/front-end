# CommentWall

Aplicacion web de comentarios en tiempo real.
Cada usuario inicia sesion, publica comentarios y visualiza los de otros usuarios sin recargar la pagina.

---

## Deployment

https://front-end-three-alpha-79.vercel.app/

---

## Caracteristicas

- Manejo de sesion con JWT (login, validacion de token y logout).
- Publicacion de comentarios por usuario autenticado.
- Listado compartido de comentarios entre todos los usuarios.
- Eliminacion de comentarios.
- Actualizacion en tiempo real mediante polling automatico cada 3 segundos.

---

## Funcionalidad

- El login consume el endpoint de autenticacion y guarda `access_token`, `userId` y `name` en `localStorage`.
- La vista principal de comentarios valida sesion antes de cargar.
- Al publicar, el frontend envia `comment` y `userId`.
- El nombre del autor se renderiza tomando el valor de `user.user` que retorna la API.
- Se realiza refresco periodico con GET para mostrar nuevos comentarios de otros usuarios.

---

## Stack

- Frontend: HTML5, TailwindCSS y JavaScript.
- Backend/API: NestJS desplegado en Railway.
- Persistencia: PostgreSQL (Supabase) con TypeORM.

---

## Estructura de la API

La comunicacion principal del proyecto se realiza con estos endpoints:

| Metodo | Endpoint | Descripcion |
| :--- | :--- | :--- |
| **POST** | `/auth/login` | Inicia sesion y devuelve token JWT + datos del usuario. |
| **GET** | `/comments` | Obtiene los comentarios (respuesta envuelta en `value`). |
| **POST** | `/comments` | Crea un comentario. Requiere body con `comment` y `userId`. |
| **DELETE** | `/comments/:id` | Elimina un comentario por id. |

---

## Flujo rapido

1. Abrir `login.html` e iniciar sesion.
2. Redireccion a `index.html` si la sesion es valida.
3. Escribir comentario y publicar.
4. Ver comentarios propios y de otros usuarios en tiempo real.


