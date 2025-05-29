# Política de Seguridad de Persistual

## 1. Resumen

Esta política describe cómo informar de vulnerabilidades y qué esperar tras un reporte.

---

## 2. Alcance

Esta política aplica a:

- Código fuente de la API Persistual.
- Dependencias críticas (paquetes npm declarados).
- Infraestructura de despliegue (si aplica).

---

## 3. Proceso de Reporte

1. **Enviar reporte por email**  
   Envía un correo a con el asunto:

2. **Información mínima a incluir**

- Descripción del fallo y su impacto.
- Pasos para reproducir, PoC o capturas de pantalla.
- Entorno afectado (versión de Persistual, Node.js, SO).
- Tu nivel de confianza en la vulnerabilidad.

3. **No publiques detalles**  
   Para evitar que terceros los aprovechen, mantén la información reservada hasta que esté corregida.

4. **Confirmación de recepción**  
   Recibirás respuesta en un plazo máximo de **48 horas** con un número de ticket y una estimación de tiempos.

---

## 4. Responsabilidades y Tiempos

- **Dentro de 48 horas:** Acusamos recibo y asignamos responsable.
- **Dentro de 7 días:** Proponemos plan de mitigación o solución.
- **Parche oficial:** Publicamos la corrección en la siguiente versión (con notas en el changelog).

---

## 5. Comunicación y Divulgación

- No divulgaremos públicamente detalles hasta que exista parche disponible.
- Tras la publicación de la solución, se anunciará la vulnerabilidad de forma responsable (release notes, CVE si aplica).

---

## 6. Excepciones

- Problemas de usabilidad o bugs no relacionados con seguridad **no se** gestionan aquí; repórtalos usando la plantilla de **reporte_de_errores.md**.

---

Gracias por ayudarnos a mantener Persistual seguro y confiable.
