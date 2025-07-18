# NPM MCP Server

Un servidor MCP (Model Context Protocol) completo para interactuar con npm y sus servicios. Este servidor permite a los modelos de lenguaje usar npm de forma segura y estructurada.

**Desarrollado por:** [Kpangaa](https://github.com/Kpangaa)

## 🚀 Características

### 🛠️ Herramientas Disponibles

- **npm_search**: Buscar paquetes en el registro de npm
- **npm_info**: Obtener información detallada de un paquete
- **npm_install**: Instalar paquetes (con soporte para dependencias de desarrollo y globales)
- **npm_uninstall**: Desinstalar paquetes
- **npm_list**: Listar paquetes instalados
- **npm_outdated**: Verificar paquetes desactualizados
- **npm_update**: Actualizar paquetes a sus últimas versiones
- **npm_run_script**: Ejecutar scripts definidos en package.json
- **npm_init**: Inicializar un nuevo proyecto npm
- **npm_audit**: Auditar vulnerabilidades de seguridad
- **npm_audit_fix**: Arreglar vulnerabilidades automáticamente

### 📚 Recursos Disponibles

- **npm://package.json**: Acceso al contenido del archivo package.json
- **npm://scripts**: Lista de scripts disponibles en package.json

### 🧠 Prompts Disponibles

- **npm_project_analysis**: Análisis completo del estado del proyecto npm

## 📦 Instalación

```bash
git clone <este-repositorio>
cd npm-mcp-server
npm install
npm run build
```

## 🔧 Uso

### Como servidor MCP standalone

```bash
npm start
```

### Integración con clientes MCP

Agrega la siguiente configuración a tu cliente MCP:

```json
{
  "mcpServers": {
    "npm": {
      "command": "node",
      "args": ["/ruta/a/npm-mcp-server/main.js"],
      "env": {}
    }
  }
}
```

### Para Claude Desktop

Agrega esto a tu archivo de configuración de Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json` en macOS):

```json
{
  "mcpServers": {
    "npm": {
      "command": "node",
      "args": ["/ruta/completa/a/npm-mcp-server/main.js"]
    }
  }
}
```

## 📖 Ejemplos de Uso

### Buscar paquetes

```typescript
// Buscar paquetes relacionados con React
{
  "name": "npm_search",
  "arguments": {
    "query": "react",
    "limit": 5
  }
}
```

### Instalar dependencias

```typescript
// Instalar React y React DOM
{
  "name": "npm_install",
  "arguments": {
    "packages": ["react", "react-dom"],
    "directory": "/path/to/project"
  }
}
```

### Instalar dependencias de desarrollo

```typescript
// Instalar TypeScript como dependencia de desarrollo
{
  "name": "npm_install",
  "arguments": {
    "packages": ["typescript", "@types/node"],
    "dev": true
  }
}
```

### Ejecutar scripts

```typescript
// Ejecutar el script "build"
{
  "name": "npm_run_script",
  "arguments": {
    "script": "build"
  }
}
```

### Auditar seguridad

```typescript
// Verificar vulnerabilidades
{
  "name": "npm_audit",
  "arguments": {
    "directory": "/path/to/project"
  }
}
```

## 🛡️ Seguridad

- Todas las operaciones tienen timeout de 30 segundos
- Validación de entrada usando esquemas Zod
- Manejo seguro de errores
- Soporte para directorios específicos para evitar operaciones no deseadas

## 🗂️ Estructura del Proyecto

```
npm-mcp-server/
├── main.ts              # Código principal del servidor
├── main.js              # Código compilado
├── package.json         # Configuración del proyecto
├── tsconfig.json        # Configuración de TypeScript
├── README.md           # Este archivo
└── dist/               # Archivos compilados
```

## 🔧 Desarrollo

### Requisitos

- Node.js 18+
- npm 9+
- TypeScript 5+

### Scripts Disponibles

```bash
npm run build       # Compilar TypeScript
npm run dev         # Ejecutar en modo desarrollo con watch
npm start          # Ejecutar el servidor compilado
```

### Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 API Reference

### Herramientas (Tools)

#### npm_search

Busca paquetes en el registro de npm.

**Parámetros:**

- `query` (string): Término de búsqueda
- `limit` (number, opcional): Límite de resultados (default: 10)

#### npm_info

Obtiene información detallada de un paquete.

**Parámetros:**

- `name` (string): Nombre del paquete
- `version` (string, opcional): Versión específica

#### npm_install

Instala paquetes usando npm.

**Parámetros:**

- `packages` (string[]): Lista de paquetes a instalar
- `directory` (string, opcional): Directorio del proyecto
- `dev` (boolean, opcional): Instalar como dependencia de desarrollo
- `global` (boolean, opcional): Instalación global

#### npm_list

Lista los paquetes instalados.

**Parámetros:**

- `directory` (string, opcional): Directorio del proyecto

#### npm_run_script

Ejecuta un script definido en package.json.

**Parámetros:**

- `script` (string): Nombre del script
- `directory` (string, opcional): Directorio del proyecto

### Recursos (Resources)

#### npm://package.json

Proporciona acceso al contenido del archivo package.json del proyecto.

#### npm://scripts

Lista todos los scripts disponibles en package.json.

### Prompts

#### npm_project_analysis

Genera un análisis completo del estado actual del proyecto npm.

**Argumentos:**

- `directory` (string, opcional): Directorio del proyecto a analizar

## 🐛 Resolución de Problemas

### Error: "No se encuentra el módulo"

Asegúrate de que todas las dependencias estén instaladas:

```bash
npm install
```

### Error de permisos

Si tienes problemas con permisos globales:

```bash
sudo npm install -g <paquete>
```

### Timeout en comandos

Los comandos tienen un timeout de 30 segundos. Para proyectos grandes, considera usar el directorio específico.

## 📄 Licencia

MIT License - ver el archivo [LICENSE](LICENSE) para más detalles.

**Autor:** [Kpangaa](https://github.com/Kpangaa)

## 🤝 Soporte

Si encuentras algún problema o tienes sugerencias:

1. Revisa los [issues existentes](https://github.com/Kpangaa/npm-mcp-server/issues)
2. Crea un nuevo issue si es necesario
3. Proporciona información detallada sobre el problema

## 🔄 Changelog

### v1.0.0

- ✨ Implementación inicial del servidor MCP
- 🛠️ 11 herramientas completas para npm
- 📚 2 recursos para acceso a metadatos
- 🧠 1 prompt para análisis de proyectos
- 🛡️ Validación completa con Zod
- ⚡ Soporte para TypeScript
