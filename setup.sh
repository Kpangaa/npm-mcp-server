#!/bin/bash

# Script de configuración rápida para el servidor MCP de npm

echo "🚀 Configurando servidor MCP de npm..."

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar que npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm primero."
    exit 1
fi

echo "✅ Node.js y npm están instalados"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Verificar que la compilación fue exitosa
if [ ! -f "dist/main.js" ]; then
    echo "❌ Error en la compilación"
    exit 1
fi

echo "✅ Compilación exitosa"

# Obtener la ruta absoluta del proyecto
PROJECT_PATH=$(pwd)

# Crear configuración para Claude Desktop
echo "📝 Creando configuración para Claude Desktop..."

cat > claude_desktop_config.json << EOF
{
  "mcpServers": {
    "npm": {
      "command": "node",
      "args": ["$PROJECT_PATH/dist/main.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF

echo "✅ Configuración creada en claude_desktop_config.json"

# Mostrar instrucciones
echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Instrucciones para usar con Claude Desktop:"
echo "1. Copia el contenido de claude_desktop_config.json"
echo "2. Pégalo en tu archivo de configuración de Claude Desktop:"
echo "   - macOS: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "   - Windows: %APPDATA%/Claude/claude_desktop_config.json"
echo "   - Linux: ~/.config/Claude/claude_desktop_config.json"
echo ""
echo "🧪 Para probar el servidor manualmente:"
echo "   npm start"
echo ""
echo "📚 Funcionalidades disponibles:"
echo "   - 11 herramientas para npm (search, install, update, etc.)"
echo "   - 2 recursos (package.json, scripts)"
echo "   - 1 prompt de análisis de proyecto"
echo ""
echo "📖 Lee el README.md para más información detallada."
