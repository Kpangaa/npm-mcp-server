#!/usr/bin/env node

/**
 * NPM MCP Server
 *
 * Un servidor MCP (Model Context Protocol) completo para interactuar con npm y sus servicios.
 * Este servidor permite a los modelos de lenguaje usar npm de forma segura y estructurada.
 *
 * @author Kpangaa
 * @version 1.0.0
 * @license MIT
 * @repository https://github.com/Kpangaa/npm-mcp-server
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);

// Esquemas de validación con Zod
const PackageInfoSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
});

const SearchSchema = z.object({
  query: z.string(),
  limit: z.number().optional().default(10),
});

const ProjectSchema = z.object({
  directory: z.string().optional(),
});

const InstallSchema = z.object({
  packages: z.array(z.string()),
  directory: z.string().optional(),
  dev: z.boolean().optional().default(false),
  global: z.boolean().optional().default(false),
});

const ScriptSchema = z.object({
  script: z.string(),
  directory: z.string().optional(),
});

// Funciones de utilidad
async function executeNpmCommand(
  command: string,
  cwd?: string
): Promise<{ stdout: string; stderr: string }> {
  try {
    const result = await execAsync(command, {
      cwd: cwd || process.cwd(),
      timeout: 30000, // 30 segundos timeout
    });
    return result;
  } catch (error: any) {
    throw new Error(`Error ejecutando comando npm: ${error.message}`);
  }
}

async function readPackageJson(directory?: string): Promise<any> {
  const packagePath = path.join(directory || process.cwd(), "package.json");
  try {
    const content = await fs.readFile(packagePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`No se pudo leer package.json en ${packagePath}`);
  }
}

// Crear el servidor MCP
const server = new Server(
  {
    name: "npm-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Registrar handlers para herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "npm_search",
        description: "Buscar paquetes en el registro de npm",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Término de búsqueda" },
            limit: {
              type: "number",
              description: "Límite de resultados",
              default: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "npm_info",
        description: "Obtener información detallada de un paquete",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Nombre del paquete" },
            version: {
              type: "string",
              description: "Versión específica (opcional)",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "npm_install",
        description: "Instalar paquetes usando npm",
        inputSchema: {
          type: "object",
          properties: {
            packages: {
              type: "array",
              items: { type: "string" },
              description: "Lista de paquetes a instalar",
            },
            directory: {
              type: "string",
              description: "Directorio del proyecto (opcional)",
            },
            dev: {
              type: "boolean",
              description: "Instalar como dependencia de desarrollo",
              default: false,
            },
            global: {
              type: "boolean",
              description: "Instalación global",
              default: false,
            },
          },
          required: ["packages"],
        },
      },
      {
        name: "npm_uninstall",
        description: "Desinstalar paquetes usando npm",
        inputSchema: {
          type: "object",
          properties: {
            packages: {
              type: "array",
              items: { type: "string" },
              description: "Lista de paquetes a desinstalar",
            },
            directory: {
              type: "string",
              description: "Directorio del proyecto (opcional)",
            },
            global: {
              type: "boolean",
              description: "Desinstalación global",
              default: false,
            },
          },
          required: ["packages"],
        },
      },
      {
        name: "npm_list",
        description: "Listar paquetes instalados",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "Directorio del proyecto (opcional)",
            },
          },
        },
      },
      {
        name: "npm_outdated",
        description: "Verificar paquetes desactualizados",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "Directorio del proyecto (opcional)",
            },
          },
        },
      },
      {
        name: "npm_update",
        description: "Actualizar paquetes a sus últimas versiones",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "Directorio del proyecto (opcional)",
            },
          },
        },
      },
      {
        name: "npm_run_script",
        description: "Ejecutar un script definido en package.json",
        inputSchema: {
          type: "object",
          properties: {
            script: {
              type: "string",
              description: "Nombre del script a ejecutar",
            },
            directory: {
              type: "string",
              description: "Directorio del proyecto (opcional)",
            },
          },
          required: ["script"],
        },
      },
      {
        name: "npm_init",
        description: "Inicializar un nuevo proyecto npm",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "Directorio del proyecto (opcional)",
            },
          },
        },
      },
      {
        name: "npm_audit",
        description: "Auditar vulnerabilidades de seguridad",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "Directorio del proyecto (opcional)",
            },
          },
        },
      },
      {
        name: "npm_audit_fix",
        description: "Arreglar vulnerabilidades automáticamente",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "Directorio del proyecto (opcional)",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "npm_search": {
        const { query, limit } = SearchSchema.parse(args);
        const command = `npm search ${query} --json --searchlimit=${limit}`;
        const { stdout } = await executeNpmCommand(command);
        const results = JSON.parse(stdout);

        return {
          content: [
            {
              type: "text",
              text: `Resultados de búsqueda para "${query}":\n\n${JSON.stringify(
                results,
                null,
                2
              )}`,
            },
          ],
        };
      }

      case "npm_info": {
        const { name: packageName, version } = PackageInfoSchema.parse(args);
        const fullPackageName = version
          ? `${packageName}@${version}`
          : packageName;
        const command = `npm info ${fullPackageName} --json`;
        const { stdout } = await executeNpmCommand(command);
        const info = JSON.parse(stdout);

        return {
          content: [
            {
              type: "text",
              text: `Información del paquete ${fullPackageName}:\n\n${JSON.stringify(
                info,
                null,
                2
              )}`,
            },
          ],
        };
      }

      case "npm_install": {
        const { packages, directory, dev, global } = InstallSchema.parse(args);
        let command = "npm install";

        if (global) {
          command += " -g";
        } else if (dev) {
          command += " --save-dev";
        }

        command += ` ${packages.join(" ")}`;
        const { stdout, stderr } = await executeNpmCommand(command, directory);

        return {
          content: [
            {
              type: "text",
              text: `Instalación completada:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
            },
          ],
        };
      }

      case "npm_uninstall": {
        const { packages, directory, global } = InstallSchema.parse(args);
        let command = "npm uninstall";

        if (global) {
          command += " -g";
        }

        command += ` ${packages.join(" ")}`;
        const { stdout, stderr } = await executeNpmCommand(command, directory);

        return {
          content: [
            {
              type: "text",
              text: `Desinstalación completada:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
            },
          ],
        };
      }

      case "npm_list": {
        const { directory } = ProjectSchema.parse(args);
        const command = "npm list --json";
        const { stdout } = await executeNpmCommand(command, directory);
        const packages = JSON.parse(stdout);

        return {
          content: [
            {
              type: "text",
              text: `Paquetes instalados:\n\n${JSON.stringify(
                packages,
                null,
                2
              )}`,
            },
          ],
        };
      }

      case "npm_outdated": {
        const { directory } = ProjectSchema.parse(args);
        const command = "npm outdated --json";

        try {
          const { stdout } = await executeNpmCommand(command, directory);
          if (stdout.trim()) {
            const outdated = JSON.parse(stdout);
            return {
              content: [
                {
                  type: "text",
                  text: `Paquetes desactualizados:\n\n${JSON.stringify(
                    outdated,
                    null,
                    2
                  )}`,
                },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: "Todos los paquetes están actualizados.",
                },
              ],
            };
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: "Todos los paquetes están actualizados.",
              },
            ],
          };
        }
      }

      case "npm_update": {
        const { directory } = ProjectSchema.parse(args);
        const command = "npm update";
        const { stdout, stderr } = await executeNpmCommand(command, directory);

        return {
          content: [
            {
              type: "text",
              text: `Actualización completada:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
            },
          ],
        };
      }

      case "npm_run_script": {
        const { script, directory } = ScriptSchema.parse(args);
        const command = `npm run ${script}`;
        const { stdout, stderr } = await executeNpmCommand(command, directory);

        return {
          content: [
            {
              type: "text",
              text: `Ejecución del script "${script}":\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
            },
          ],
        };
      }

      case "npm_init": {
        const { directory } = ProjectSchema.parse(args);
        const command = "npm init -y";
        const { stdout, stderr } = await executeNpmCommand(command, directory);

        return {
          content: [
            {
              type: "text",
              text: `Proyecto inicializado:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
            },
          ],
        };
      }

      case "npm_audit": {
        const { directory } = ProjectSchema.parse(args);
        const command = "npm audit --json";
        const { stdout } = await executeNpmCommand(command, directory);
        const audit = JSON.parse(stdout);

        return {
          content: [
            {
              type: "text",
              text: `Auditoría de seguridad:\n\n${JSON.stringify(
                audit,
                null,
                2
              )}`,
            },
          ],
        };
      }

      case "npm_audit_fix": {
        const { directory } = ProjectSchema.parse(args);
        const command = "npm audit fix";
        const { stdout, stderr } = await executeNpmCommand(command, directory);

        return {
          content: [
            {
              type: "text",
              text: `Corrección de vulnerabilidades:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Registrar recursos
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "npm://package.json",
        name: "Package.json",
        description: "Contenido del archivo package.json del proyecto actual",
        mimeType: "application/json",
      },
      {
        uri: "npm://scripts",
        name: "NPM Scripts",
        description: "Scripts disponibles en package.json",
        mimeType: "application/json",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    switch (uri) {
      case "npm://package.json": {
        const packageJson = await readPackageJson();
        return {
          contents: [
            {
              uri: "npm://package.json",
              mimeType: "application/json",
              text: JSON.stringify(packageJson, null, 2),
            },
          ],
        };
      }

      case "npm://scripts": {
        const packageJson = await readPackageJson();
        const scripts = packageJson.scripts || {};
        return {
          contents: [
            {
              uri: "npm://scripts",
              mimeType: "application/json",
              text: JSON.stringify(scripts, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Recurso desconocido: ${uri}`);
    }
  } catch (error: any) {
    throw new Error(`Error leyendo recurso: ${error.message}`);
  }
});

// Registrar prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "npm_project_analysis",
        description: "Analizar el estado actual del proyecto npm",
        arguments: [
          {
            name: "directory",
            description: "Directorio del proyecto (opcional)",
            required: false,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "npm_project_analysis") {
    throw new Error(`Prompt desconocido: ${name}`);
  }

  const directory = args?.directory as string | undefined;

  try {
    const packageJson = await readPackageJson(directory);
    const { stdout: listOutput } = await executeNpmCommand(
      "npm list --json",
      directory
    );

    let auditOutput = "";
    try {
      const { stdout } = await executeNpmCommand("npm audit --json", directory);
      auditOutput = stdout;
    } catch (error) {
      auditOutput = "No se pudo realizar la auditoría";
    }

    const analysis = `# Análisis del Proyecto NPM

## Información del Proyecto
- **Nombre**: ${packageJson.name}
- **Versión**: ${packageJson.version}
- **Descripción**: ${packageJson.description || "No disponible"}

## Dependencias
${JSON.stringify(packageJson.dependencies || {}, null, 2)}

## Dependencias de Desarrollo
${JSON.stringify(packageJson.devDependencies || {}, null, 2)}

## Scripts Disponibles
${JSON.stringify(packageJson.scripts || {}, null, 2)}

## Estado de Instalación
${listOutput}

## Auditoría de Seguridad
${auditOutput}`;

    return {
      description: "Análisis completo del proyecto npm",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: analysis,
          },
        },
      ],
    };
  } catch (error: any) {
    return {
      description: "Error analizando proyecto",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Error analizando el proyecto: ${error.message}`,
          },
        },
      ],
    };
  }
});

// Iniciar el servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Esto solo se verá en stderr cuando se ejecute desde un cliente MCP
  console.error("Servidor MCP de npm iniciado correctamente");
}

// Manejar errores y señales
process.on("SIGINT", async () => {
  console.error("Cerrando servidor MCP de npm...");
  await server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("Cerrando servidor MCP de npm...");
  await server.close();
  process.exit(0);
});

// Ejecutar el servidor
main().catch((error) => {
  console.error("Error iniciando el servidor:", error);
  process.exit(1);
});
