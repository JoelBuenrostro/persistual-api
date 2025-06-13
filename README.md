# Persistual API

![CI](https://github.com/JoelBuenrostro/persistual-api/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/codecov/c/github/JoelBuenrostro/persistual-api)
![Release](https://img.shields.io/github/v/release/JoelBuenrostro/persistual-api)
![License](https://img.shields.io/github/license/JoelBuenrostro/persistual-api)

API open-source en Node.js/TypeScript para gestión de hábitos y cálculo de rachas, con autenticación JWT, métricas y CI/CD.

---

## Puesta en marcha

```bash
git clone https://github.com/JoelBuenrostro/persistual-api.git
cd persistual-api
npm install

# Variables de entorno (copia y completa .env.example)
# JWT_SECRET=
# REFRESH_TOKEN_SECRET=
# ACCESS_TOKEN_TTL=
# REFRESH_TOKEN_TTL=

npm run dev      # arranca en http://localhost:3000
npm run lint     # chequea estilo
npm run format   # aplica prettier
npm run test     # ejecuta Jest con coverage
```

---

## Documentación interactiva

La UI de Swagger está disponible en  
```
http://localhost:3000/docs
```

---

## Autenticación

Todos los endpoints de `/api/habits` requieren un header  
```
Authorization: Bearer <accessToken>
```

---

## Endpoints de Autenticación

### POST `/api/auth/register`

Registra un nuevo usuario.

**Request Body**
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Responses**

- **201 Created**
  ```json
  { "id": "uuid", "email": "user@example.com" }
  ```

- **400 Bad Request** (validación)
  ```json
  { "errors": ["El email no es válido", …] }
  ```

- **400 Bad Request** (email duplicado)
  ```json
  { "message": "Email en uso" }
  ```

---

### POST `/api/auth/login`

Obtiene tokens JWT.

**Request Body**
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Responses**

- **200 OK**
  ```json
  { "accessToken": "<jwt>", "refreshToken": "<refresh_jwt>" }
  ```

- **400 Bad Request** (validación)
  ```json
  { "errors": ["El email no es válido", …] }
  ```

- **401 Unauthorized** (credenciales)
  ```json
  { "message": "Email o contraseña inválida" }
  ```

---

### POST `/api/auth/refresh`

Renueva el access token usando el refresh token.

**Request Body**
```json
{ "refreshToken": "<refresh_jwt>" }
```

**Responses**

- **200 OK**
  ```json
  { "accessToken": "<nuevo_jwt>" }
  ```

- **400 Bad Request** (missing body)
  ```json
  { "message": "refreshToken must be provided" }
  ```

- **401 Unauthorized** (inválido/expirado)
  ```json
  { "message": "Token inválido o expirado" }
  ```

---

## Endpoints de Hábitos

### POST `/api/habits`

Crea un nuevo hábito.

**Request Body**
```json
{ "name": "leer diario", "description": "30 min al día" }
```

**Responses**

- **201 Created**
  ```json
  {
    "id": "uuid",
    "userId": "uuid_del_usuario",
    "name": "leer diario",
    "description": "30 min al día",
    "createdAt": "2025-06-12T…Z"
  }
  ```

- **400 Bad Request** (validación)
  ```json
  { "errors": ["El nombre debe tener al menos 3 caracteres"] }
  ```

---

### GET `/api/habits`

Lista todos los hábitos del usuario.

**Responses**

- **200 OK**
  ```json
  [ { "id": "...", "userId": "...", "name": "...", … }, … ]
  ```

---

### PUT `/api/habits/:habitId`

Actualiza nombre y/o descripción.

**Request Body**
```json
{ "name": "nuevo nombre", "description": "…"}
```

**Responses**

- **200 OK** → objeto `Habit` actualizado.  
- **400 Bad Request** (validación)  
- **403 Forbidden** (no es tu hábito)  
- **404 Not Found** (ID no existe)

---

### DELETE `/api/habits/:habitId`

Elimina un hábito.

**Responses**

- **204 No Content**  
- **403 Forbidden** (no es tu hábito)  
- **404 Not Found** (ID no existe)

---

### POST `/api/habits/:habitId/check`

Marca el hábito como completado hoy y devuelve la racha.

**Responses**

- **200 OK**
  ```json
  { "habitId": "...", "date": "YYYY-MM-DD", "currentStreak": 3 }
  ```

- **400 Bad Request** (ya marcado hoy)  
- **403 Forbidden** / **404 Not Found**  

---

### GET `/api/habits/:habitId/streak`

 consulta la racha actual sin alterar datos.

**Responses**

- **200 OK** (sin checks)
  ```json
  { "habitId": "...", "currentStreak": 0 }
  ```
- **200 OK** (con racha)
  ```json
  {
    "habitId": "...",
    "currentStreak": 5,
    "lastCheck": "YYYY-MM-DD"
  }
  ```

- **403 Forbidden** / **404 Not Found**  

---

## Cómo Contribuir

1. Lee el [Código de Conducta](./CODE_OF_CONDUCT.md).  
2. Consulta la guía en [CONTRIBUTING.md](./CONTRIBUTING.md).  
3. Abre un Issue usando nuestras plantillas en `.github/ISSUE_TEMPLATE/`.  
4. Envía tu Pull Request con checklist completado.

---

## License

Este proyecto está bajo la Licencia MIT. Véase [LICENSE](LICENSE).  
_Traducción no oficial: consulta la MIT original en https://opensource.org/licenses/MIT_
