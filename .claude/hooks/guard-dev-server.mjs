#!/usr/bin/env node
// PreToolUse guard for Bash/PowerShell: enforces "one live instance per project"
// (docs/ENGINEERING-STANDARDS.md §7, R-10). Blocks a dev/preview server start when
// that project's port is already listening, and blocks any attempt to pick another
// port. Exit 2 blocks the tool call and shows stderr to the agent; exit 0 allows it.
import net from "node:net";

// Project folder fragment -> the ports its dev and preview servers own.
// apps/desktop does not pin preview.port yet, so Vite's default (4173) applies.
const projects = [
  { name: "desktop UI (apps/desktop)", match: /apps[\\/]+desktop/i, dev: 5174, preview: 4173 },
  { name: "design prototype (docs/design/onecode-experience)", match: /onecode-experience/i, dev: 5173, preview: 4173 },
];

const npmScript = /\b(npm|pnpm|yarn)\b(?:\s+--prefix\s+\S+)?\s+(?:run\s+)?(dev|preview|start)\b/i;
const viteCli = /(?:^|[\s;&|(])(?:npx\s+)?vite(?:\s+(dev|serve|preview))?(?=\s|$|[;&|)])/i;
const viteNonServer = /\bvite\s+(build|optimize)\b/i;
const tauriDev = /\btauri\s+dev\b/i;
const altPort = /--port(\s|=)|--strictPort(\s|=)false|\bPORT=\d+/i;

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

function isListening(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    const done = (result) => { socket.destroy(); resolve(result); };
    socket.setTimeout(300, () => done(false));
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
  });
}

// Returns "dev", "preview", or null for the server a command would start.
function serverKind(command) {
  const script = npmScript.exec(command);
  if (script) return script[2].toLowerCase() === "preview" ? "preview" : "dev";
  if (tauriDev.test(command)) return "dev";
  const vite = viteCli.exec(command);
  if (vite && !viteNonServer.test(command)) return vite[1]?.toLowerCase() === "preview" ? "preview" : "dev";
  return null;
}

const input = JSON.parse((await readStdin()) || "{}");
const original = String(input.tool_input?.command ?? "");
// Ignore quoted text when deciding whether a server starts, so `grep "npm run dev"` or an
// echoed payload is not mistaken for a launch. Project paths are matched on the original.
const unquoted = original.replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, "''");
const kind = serverKind(unquoted);
if (!kind) process.exit(0);

if (altPort.test(unquoted)) {
  console.error("Blocked: never move a dev server to another port. Reuse the running instance, or ask the user before restarting it in place (ENGINEERING-STANDARDS §7, R-10).");
  process.exit(2);
}

const where = `${original} ${input.cwd ?? ""}`;
const project = projects.find((p) => p.match.test(where));
const port = project?.[kind];
if (port && (await isListening(port))) {
  console.error(`Blocked: the ${project.name} ${kind} server is already running at http://127.0.0.1:${port}/. Use that instance; never start a second one (ENGINEERING-STANDARDS §7, R-10).`);
  process.exit(2);
}
process.exit(0);
