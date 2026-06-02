#!/usr/bin/env node

const fs = require("fs");
const http = require("http");

const args = parseArgs(process.argv.slice(2));
const logPath = args.log;
const devtoolsPort = Number(args.devtoolsPort || 9222);
const route = args.route || "http://127.0.0.1:5173/crowd-flow-analysis";
const waitBeforeClickMs = Number(args.waitBeforeClickMs || 30000);
const waitAfterClickMs = Number(args.waitAfterClickMs || 8000);

if (!logPath) {
  console.error("Usage: node verify_draw_crowd_flow_color.js --log <kit-log-path> [--devtoolsPort 9222]");
  process.exit(2);
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    parsed[key.slice(2)] = argv[i + 1];
    i += 1;
  }
  return parsed;
}

function requestJson(method, path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: "127.0.0.1", port: devtoolsPort, path, method }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function openDevtoolsTarget() {
  const encoded = encodeURIComponent("about:blank");
  const target = await requestJson("PUT", `/json/new?${encoded}`);
  if (!target.webSocketDebuggerUrl) {
    throw new Error(`Could not create DevTools page on port ${devtoolsPort}`);
  }
  return target.webSocketDebuggerUrl;
}

async function runBrowserFlow() {
  const wsUrl = await openDevtoolsTarget();
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const consoleLines = [];

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
    if (message.method === "Runtime.consoleAPICalled") {
      const line = message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" ");
      consoleLines.push(line);
    }
  });

  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  function send(method, params = {}) {
    const callId = ++id;
    ws.send(JSON.stringify({ id: callId, method, params }));
    return new Promise((resolve) => pending.set(callId, resolve));
  }

  await send("Runtime.enable");
  await send("Page.enable");

  const envOverride = `(() => {
    const values = {
      SMART3D_SERVICE: "http://127.0.0.1:8111/",
      SIGNALING1_SERVER: "127.0.0.1",
      SIGNALING2_SERVER: "",
      SIGNALING1_PORT: "49100",
      SIGNALING2_PORT: "",
      MEDIA1_PORT: "1024",
      MEDIA2_PORT: "",
      PRESENCE1_SERVICE: "http://127.0.0.1:8111",
      PRESENCE2_SERVICE: ""
    };
    const original = Document.prototype.querySelector;
    Document.prototype.querySelector = function(selector) {
      const match = typeof selector === "string" && selector.match(/^meta\\[name="([^"]+)"\\]$/);
      if (match && Object.prototype.hasOwnProperty.call(values, match[1])) {
        return { getAttribute: (name) => name === "content" ? values[match[1]] : null };
      }
      return original.call(this, selector);
    };
  })();`;

  await send("Page.addScriptToEvaluateOnNewDocument", { source: envOverride });
  await send("Page.navigate", { url: route });
  await sleep(waitBeforeClickMs);

  const clickExpression = `(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const all = buttons.find((button) => button.innerText.includes("全部") && button.innerText.includes("變色"));
    const fallback = buttons[3];
    const target = all || fallback;
    if (!target) return { ok: false, buttons: buttons.map((button, index) => ({ index, text: button.innerText })) };
    target.click();
    return { ok: true, text: target.innerText, buttons: buttons.map((button, index) => ({ index, text: button.innerText })) };
  })()`;

  const click = await send("Runtime.evaluate", { expression: clickExpression, returnByValue: true });
  await sleep(waitAfterClickMs);
  ws.close();

  return {
    click: click.result && click.result.result && click.result.result.value,
    consoleLines,
  };
}

function countLogEvidence() {
  const text = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : "";
  const count = (pattern) => {
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  };
  return {
    changeSystem: count(/Processing custom kit message: \{"event_type":"CHANGE_SYSTEM"/g),
    crowdFlowInit: count(/CrowdFlowAnalysisSystem\.on_init/g),
    drawProcessed: count(/Processing custom kit message: \{"event_type":"DrawCrowdFlowColor"/g),
    drawHandled: count(/CrowdFlowAnalysisSystem\.set_floor_color\(\)->/g),
    invalidPrim: count(/set_floor_color\(\) invalid prim/g),
    invalidPayload: count(/set_floor_color\(\) invalid payload/g),
  };
}

(async () => {
  const before = countLogEvidence();
  const browser = await runBrowserFlow();
  const after = countLogEvidence();
  const delta = Object.fromEntries(Object.keys(after).map((key) => [key, after[key] - before[key]]));
  const ok =
    delta.changeSystem >= 1 &&
    delta.crowdFlowInit >= 1 &&
    delta.drawProcessed === 27 &&
    delta.drawHandled === 27 &&
    after.invalidPrim === before.invalidPrim &&
    after.invalidPayload === before.invalidPayload;

  const report = { ok, delta, totals: after, click: browser.click, logPath };
  console.log(JSON.stringify(report, null, 2));
  process.exit(ok ? 0 : 1);
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
