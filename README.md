# 👨‍👩‍👧‍👦 Family Calendar App - Portfolio Demo

Una aplicación de calendario familiar moderna, rápida y totalmente funcional, diseñada para funcionar de manera **autónoma en el navegador**.

## 🌟 Demo para Portfolio
Esta versión de la aplicación utiliza **LocalStorage** para la persistencia de datos. No requiere base de datos externa ni backend, lo que garantiza una estabilidad del 100% y una carga instantánea. Es la solución ideal para demostraciones profesionales donde la fiabilidad es clave.

### Características Principales:
*   **Gestión de Miembros**: Crea perfiles familiares con avatares personalizados.
*   **Calendario Interactivo**: Visualiza y gestiona eventos familiares con iconos y colores.
*   **Persistencia Local**: Tus datos se quedan en tu navegador. Puedes refrescar la página y todo seguirá ahí.
*   **Modo Oscuro/Claro**: Interfaz moderna y adaptable.
*   **Gestión de Documentos**: Sube y previsualiza documentos vinculados a miembros.

## 🚀 Instalación Local

La aplicación ahora funciona en **Modo Híbrido**: los datos se guardan localmente para mayor estabilidad, pero el asistente inteligente utiliza un pequeño servidor para hablar con Ollama.

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/Diana-Bernardos/Family.git
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Asegúrate de tener **Ollama** ejecutándose localmente con el modelo `phi3` (o cámbialo en `backend/.env`).
4.  Inicia todo el sistema (Frontend + AI Proxy):
    ```bash
    npm run dev
    ```

La aplicación se abrirá en `http://localhost:3000`. El servidor de la IA correrá en el puerto `3001`.

La aplicación se abrirá en `http://localhost:3000`.

## 🛠️ Tecnologías Utilizadas
*   **React.js**: Biblioteca principal para la interfaz de usuario.
*   **FullCalendar**: Para la visualización de eventos.
*   **Lucide React**: Set de iconos modernos.
*   **Vanilla CSS**: Diseño personalizado y responsive.
*   **LocalStorage API**: Persistencia de datos sin servidor.

---
*Desarrollado para Diana Bernardos - Portfolio Project*
