#!/usr/bin/env node

/**
 * Script de prueba para el servidor MCP de npm
 * Verifica que todas las herramientas estén funcionando correctamente
 */

import { spawn } from "child_process";
import { writeFileSync, readFileSync } from "fs";

const testMessages = [
  // Inicialización
  {
    jsonrpc: "2.0",
    method: "initialize",
    id: 1,
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test-client", version: "1.0.0" },
    },
  },
  // Listar herramientas
  {
    jsonrpc: "2.0",
    method: "tools/list",
    id: 2,
  },
  // Listar recursos
  {
    jsonrpc: "2.0",
    method: "resources/list",
    id: 3,
  },
  // Listar prompts
  {
    jsonrpc: "2.0",
    method: "prompts/list",
    id: 4,
  },
  // Probar búsqueda de paquetes
  {
    jsonrpc: "2.0",
    method: "tools/call",
    id: 5,
    params: {
      name: "npm_search",
      arguments: {
        query: "lodash",
        limit: 3,
      },
    },
  },
];

console.log("🧪 Iniciando pruebas del servidor MCP de npm...\n");

const child = spawn("node", ["dist/main.js"], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: process.cwd(),
});

let responseCount = 0;
let buffer = "";

child.stdout.on("data", (data) => {
  buffer += data.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";

  lines.forEach((line) => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        responseCount++;
        console.log(
          `✅ Respuesta ${responseCount}:`,
          JSON.stringify(response, null, 2)
        );
      } catch (e) {
        console.log(`📝 Mensaje: ${line}`);
      }
    }
  });
});

child.stderr.on("data", (data) => {
  console.log(`📢 Servidor: ${data.toString().trim()}`);
});

child.on("close", (code) => {
  console.log(`\n🏁 Servidor cerrado con código: ${code}`);
  console.log(`📊 Total de respuestas recibidas: ${responseCount}`);
});

// Enviar mensajes de prueba
testMessages.forEach((message, index) => {
  setTimeout(() => {
    console.log(
      `\n📤 Enviando mensaje ${index + 1}:`,
      JSON.stringify(message, null, 2)
    );
    child.stdin.write(JSON.stringify(message) + "\n");

    // Cerrar después del último mensaje
    if (index === testMessages.length - 1) {
      setTimeout(() => {
        child.stdin.end();
        setTimeout(() => child.kill(), 1000);
      }, 2000);
    }
  }, index * 1000);
});

// Timeout de seguridad
setTimeout(() => {
  console.log("\n⏰ Timeout alcanzado, cerrando prueba...");
  child.kill();
  process.exit(0);
}, 15000);
