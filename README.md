# Persistual API

![CI](https://github.com/JoelBuenrostro/persistual-api/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/codecov/c/github/JoelBuenrostro/persistual-api)
![Release](https://img.shields.io/github/v/release/JoelBuenrostro/persistual-api)
![License](https://img.shields.io/github/license/JoelBuenrostro/persistual-api)

API open-source Node.js/TypeScript para gestión de hábitos y cálculo de rachas, con autenticación JWT, métricas y CI/CD.

## Getting Started

Clona el repositorio e inicia la aplicación:

```bash
git clone https://github.com/JoelBuenrostro/persistual-api.git
cd persistual-api
npm install
npm run dev
npm run test
npm run lint
npm run format
```

El servidor por defecto arranca en <http://localhost:3000>

## Documentación interactiva

La documentación Swagger está disponible en:

```https
http://localhost:3000/docs
```

## Endpoints de Autenticación

### POST /api/auth/register

Registra un nuevo usuario.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Responses**

- **201 Created**

  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
  ```

- **400 Bad Request** (validación)

  ```json
  {
    "errors": ["El email no es válido"]
  }
  ```

- **400 Bad Request** (duplicado)

  ```json
  {
    "message": "Email en uso"
  }
  ```

### POST /api/auth/login

Autentica un usuario registrado y devuelve tokens JWT.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Responses**

- **200 OK**

  ```json
  {
    "accessToken": "<token_jwt>",
    "refreshToken": "<token_refresh>"
  }
  ```

- **400 Bad Request** (validación)

  ```json
  {
    "errors": ["El email no es válido"]
  }
  ```

- **401 Unauthorized** (credenciales incorrectas)

  ```json
  {
    "message": "Email o contraseña invalida"
  }
  ```

## Cómo Contribuir

1. Lee el [Código de Conducta](./CODE_OF_CONDUCT.md).
2. Consulta la guía en [CONTRIBUTING.md](./CONTRIBUTING.md).
3. Usa las plantillas de issues y pull requests en `.github/`.

¡Gracias por tu contribución!

## License

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
