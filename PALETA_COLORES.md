# Paleta de Colores - Family Calendar App

## 🎨 Colores Principales de la Paleta

La aplicación ahora utiliza una paleta de colores personalizada definida en `src/styles/theme.css`. Cada color tiene 10 variaciones de tonalidad (100-900).

### 1. **Almond Cream** (Crema/Beige)
> Tonos cálidos y acogedores - Ideal para fondos y acentos suaves

```css
--almond-cream: #fae5d2;        /* Color base */
--almond-cream-100: #532d09;    /* Oscuro (texto sobre fondos claros) */
--almond-cream-200: #a55912;
--almond-cream-300: #e8872c;
--almond-cream-400: #f1b67e;
--almond-cream-500: #fae5d2;    /* Color principal */
--almond-cream-600: #fbeada;
--almond-cream-700: #fcefe3;
--almond-cream-800: #fdf5ed;
--almond-cream-900: #fefaf6;    /* Muy claro (fondos) */
```

**Casos de uso:**
- Fondos secundarios
- Elementos decorativos
- Accents cálidos

---

### 2. **Dust Grey** (Gris Polvo)
> Tonos neutrales y versátiles - Ideal para texto y bordes

```css
--dust-grey: #d1d0ce;           /* Color base */
--dust-grey-100: #2b2a28;       /* Muy oscuro (texto principal) */
--dust-grey-200: #555350;
--dust-grey-300: #807d78;
--dust-grey-400: #a8a6a3;
--dust-grey-500: #d1d0ce;       /* Color principal */
--dust-grey-600: #d9d9d7;
--dust-grey-700: #e3e2e1;       /* Bordes */
--dust-grey-800: #ececeb;
--dust-grey-900: #f6f5f5;       /* Muy claro (fondos) */
```

**Casos de uso:**
- Texto principal: `--dust-grey-100`
- Texto secundario: `--dust-grey-300`
- Bordes: `--dust-grey-700`

---

### 3. **Honeydew** (Verde Menta)
> Tonos frescos y tranquilos - Ideal para acentos naturales

```css
--honeydew: #c9ddd1;            /* Color base */
--honeydew-100: #213428;
--honeydew-200: #416851;
--honeydew-300: #629c79;
--honeydew-400: #96bda5;
--honeydew-500: #c9ddd1;        /* Color principal (color secundario de la app) */
--honeydew-600: #d4e4db;
--honeydew-700: #dfebe4;
--honeydew-800: #eaf2ed;        /* Fondo terciario */
--honeydew-900: #f4f8f6;        /* Fondos */
```

**Casos de uso:**
- Botones secundarios
- Fondos terciarios
- Elementos relajantes/tranquilos

---

### 4. **Powder Petal** (Naranja/Melocotón Pastel)
> Tonos cálidos y energéticos - Ideal para acentos destacados

```css
--powder-petal: #fce7d7;        /* Color base */
--powder-petal-100: #572a07;
--powder-petal-200: #af530d;
--powder-petal-300: #ef802b;    /* Acentos destacados */
--powder-petal-400: #f6b482;
--powder-petal-500: #fce7d7;    /* Color principal (accents) */
--powder-petal-600: #fdede1;
--powder-petal-700: #fdf1e8;
--powder-petal-800: #fef6f0;
--powder-petal-900: #fefaf7;    /* Muy claro */
```

**Casos de uso:**
- Color accent de la aplicación
- Elementos destacados
- Iconos importantes

---

### 5. **Powder Blue** (Azul Pastel)
> Tonos frescos y profesionales - Ideal para colores primarios

```css
--powder-blue: #a9c5db;          /* Color base */
--powder-blue-100: #172937;      /* Muy oscuro */
--powder-blue-200: #2e526d;
--powder-blue-300: #457ba4;      /* Azul oscuro */
--powder-blue-400: #72a1c4;
--powder-blue-500: #a9c5db;      /* Color principal (PRIMARY) */
--powder-blue-600: #bad1e2;
--powder-blue-700: #cbdce9;
--powder-blue-800: #dce8f1;      /* Fondos secundarios */
--powder-blue-900: #eef3f8;      /* Fondos muy claros */
```

**Casos de uso:**
- Color primario de la aplicación
- Botones principales
- Elementos destacados

---

## 🎯 Colores Derivados (Ya Configurados)

Estos colores están pre-configurados en la aplicación:

```css
/* Uso en botones e interfaces principales */
--primary-color: var(--powder-blue-500);      /* #a9c5db */
--primary-dark: var(--powder-blue-300);       /* #457ba4 */

/* Uso en elementos secundarios */
--secondary-color: var(--honeydew-500);       /* #c9ddd1 */

/* Uso en elementos de atención */
--accent-color: var(--powder-petal-300);      /* #ef802b */

/* Colores para el logo */
--peach: var(--almond-cream-500);             /* #fae5d2 */
--mint: var(--honeydew-500);                  /* #c9ddd1 */
--sky: var(--powder-blue-800);                /* #dce8f1 */
--navy: var(--dust-grey-100);                 /* #2b2a28 */
```

---

## 📂 Colores de Texto y Fondos

```css
/* TEXTO */
--text-primary: var(--dust-grey-100);         /* #2b2a28 - Texto principal */
--text-secondary: var(--dust-grey-300);       /* #807d78 - Texto secundario */
--text-muted: var(--dust-grey-400);           /* #a8a6a3 - Texto deshabilitado */
--text-light: var(--dust-grey-600);           /* #d9d9d7 - Texto ligero */

/* FONDOS */
--bg-primary: #FFFFFF;                        /* Fondo blanco principal */
--bg-secondary: var(--almond-cream-900);      /* #fefaf6 - Fondo cálido claro */
--bg-tertiary: var(--honeydew-900);           /* #f4f8f6 - Fondo fresco claro */
--bg-light-gradient: linear-gradient(135deg, var(--almond-cream-900) 0%, var(--powder-blue-900) 100%);
--bg-card: #FFFFFF;                           /* Fondo de tarjetas */

/* BORDES */
--border-color: var(--dust-grey-700);         /* #e3e2e1 - Bordes normales */
--border-color-light: var(--honeydew-800);    /* #eaf2ed - Bordes claros */
```

---

## 💡 Cómo Usar en Nuevos Componentes

### Ejemplo 1: Botón con Color Secundario
```css
.btn-secondary-custom {
    background-color: var(--secondary-color);
    color: white;
    border: 2px solid var(--honeydew-600);
}

.btn-secondary-custom:hover {
    background-color: var(--honeydew-300);
    color: white;
}
```

### Ejemplo 2: Elemento de Alerta/Importante
```css
.alert-important {
    background-color: var(--powder-petal-900);
    border-left: 4px solid var(--accent-color);
    color: var(--text-primary);
}
```

### Ejemplo 3: Card con Borde Decorativo
```css
.card-premium {
    background: white;
    border-top: 3px solid var(--primary-color);
    box-shadow: 0 0 20px rgba(169, 197, 219, 0.1);
}
```

### Ejemplo 4: Texto de Estado
```css
.status-success {
    color: var(--honeydew-300);
    font-weight: 600;
}

.status-warning {
    color: var(--accent-color);
    font-weight: 600;
}

.status-info {
    color: var(--primary-color);
    font-weight: 600;
}
```

---

## 🎨 Combinaciones Recomendadas

### Combinación Cálida (Para eventos familiares)
```css
background: var(--almond-cream-900);
border: 1px solid var(--almond-cream-700);
color: var(--dust-grey-100);
accent: var(--powder-petal-300);
```

### Combinación Fresca (Para tareas y eventos normales)
```css
background: var(--honeydew-900);
border: 1px solid var(--honeydew-700);
color: var(--dust-grey-100);
accent: var(--powder-blue-500);
```

### Combinación Neutral (Para contenido general)
```css
background: white;
border: 1px solid var(--dust-grey-700);
color: var(--text-primary);
accent: var(--primary-color);
```

---

## 🔄 Modo Oscuro (Futuro)

Si deseas añadir soporte para modo oscuro, estas son las sugerencias:

```css
@media (prefers-color-scheme: dark) {
    :root {
        --bg-primary: var(--dust-grey-100);
        --bg-secondary: var(--dust-grey-200);
        --bg-tertiary: var(--dust-grey-300);
        --text-primary: var(--dust-grey-900);
        --text-secondary: var(--dust-grey-800);
        --border-color: var(--dust-grey-300);
    }
}
```

---

## 📝 Variables Disponibles

| Categoría | Variables |
|-----------|-----------|
| Colores primarios | `--primary-color`, `--primary-dark`, `--secondary-color`, `--accent-color` |
| Paletas completas | `--almond-cream-*`, `--dust-grey-*`, `--honeydew-*`, `--powder-petal-*`, `--powder-blue-*` |
| Textos | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-light` |
| Fondos | `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-light-gradient`, `--bg-card` |
| Bordes | `--border-color`, `--border-color-light` |
| Componentes | `--peach`, `--mint`, `--sky`, `--navy` |

---

## ✨ Notas de Diseño

1. **Contrast**: Todos los colores han sido seleccionados para mantener una buena accesibilidad
2. **Armonía**: La paleta crea una experiencia visual coherente y agradable
3. **Versatilidad**: Cada color puede ser usado tanto en contextos cortos como en amplios
4. **Relajación**: Los tonos pastel ayudan a crear una interfaz tranquila y acogedora

---

## 📄 Ubicación del Archivo de Configuración

- **Archivo principal**: `frontend/src/styles/theme.css`
- **Importado en**: `frontend/src/styles/index.css`
- **Usado en**: Todos los archivos CSS de la aplicación

---

**Última actualización**: 2 de marzo de 2026
