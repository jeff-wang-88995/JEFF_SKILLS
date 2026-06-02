---
name: omniverse-live-api-verify
description: Omniverse Kit WebRTC custom-message API 的 live 驗證流程，適用於 omniverse-ntsac workspace。當 Codex 需要驗證 DrawCrowdFlowColor、CHANGE_SYSTEM 或其他 AppStreamer.sendMessage 前端到 Kit 的事件是否真的端到端運作時使用：啟動本機 USD Viewer Streaming、驅動 Vue 前端/headless browser，並用 Kit logs 證明成功。
---

# Omniverse Live API 驗證

## 概念

使用這個 skill 端到端 live 驗證 Omniverse WebRTC custom API：

`Vue frontend -> NVIDIA AppStreamer.sendMessage -> local Kit WebRTC streaming -> Kit message bus -> USD/extension handler -> Kit log evidence`

當使用者問「這條 API 真的有沒有 live 跑通」時，優先用這個流程，而不是只做靜態程式碼檢查。

## Workspace 假設

- Repository root：`D:\Work\omniverse-ntsac`
- Kit template root：`D:\Work\omniverse-ntsac\kit-app-template`
- Web root：`D:\Work\omniverse-ntsac\web`
- 預設 Kit app：`usd_viewer_streaming.kit`
- 預設 stage：`D:\Work\omniverse-ntsac\usds\Main.usda`
- live log 輸出：`D:\Work\omniverse-ntsac\logs`
- 前端 dev URL：`http://127.0.0.1:5173`
- Kit HTTP/presence URL：`http://127.0.0.1:8111`
- Kit WebRTC signaling/media：`127.0.0.1:49100` 與 `127.0.0.1:1024`

如果既有腳本如 `run_streaming.bat` 指到其他 USD 路徑，不要直接照跑。除非使用者明確指定其他 stage，否則直接用 `repo.bat` 並帶入 `--/app/auto_load_usd="D:/Work/omniverse-ntsac/usds/Main.usda"`。

## 快速流程

1. 啟動 Kit streaming 背景服務，並指定新的 log 檔。
2. 從 log 等待 `demo_manager_extension` 與 `WebRTCEventBridge` ready。
3. 啟動 Vue dev server：`cmd /c "npm.cmd run dev -- --host 127.0.0.1 --port 5173"`。
4. 啟動 headless Edge 或 Chrome，帶 `--remote-debugging-port=9222`。
5. 用 DevTools Protocol 打開目標路由，並在 app 載入前注入 meta override，讓前端 env 指向本機 Kit。
6. 觸發 UI 動作，或直接 evaluate 會送 custom event 的前端程式。
7. 統計 log 證據：
   - WebRTC plugin 行：`Processing custom kit message: {"event_type":"<API>"`
   - handler 行，例如：`CrowdFlowAnalysisSystem.set_floor_color()->`
   - 錯誤行，例如：`invalid prim`、`invalid payload`、traceback/fatal errors
8. 除非使用者要求保留服務，否則驗證後停止本次啟動的 process。

## DrawCrowdFlowColor 流程

Kit、Vite、DevTools browser 都啟動後，使用 `scripts/verify_draw_crowd_flow_color.js`。

預期前端路由：

`http://127.0.0.1:5173/crowd-flow-analysis`

預期流程：

1. 頁面送出 `CHANGE_SYSTEM`，payload 是 `{ system_name: "crowdFlowAnalysis" }`。
2. Kit log 出現 `CrowdFlowAnalysisSystem.on_init()->/AirconditioningSystem`。
3. 觸發「全部隨機變色」按鈕；若文字因編碼亂碼，找語意上對應全部樓層變色的按鈕。
4. 前端送出 27 筆 `DrawCrowdFlowColor`，樓層從 `N_01F` 到 `N_27F`。
5. Kit log 出現 27 筆 `CrowdFlowAnalysisSystem.set_floor_color()->...`。

成功條件：

```text
ChangeSystem >= 1
CrowdFlowInit >= 1
DrawProcessed == 27
DrawHandled == 27
InvalidPrim == 0
InvalidPayload == 0
```

Smart3D backend 沒跑時，前端可能出現 `/hub/...` SignalR 錯誤。除非待測 API 本身依賴 SignalR 資料，否則不要把這類錯誤判定為 WebRTC custom-message API 失敗。

## 常用指令

啟動 Kit 並指定 log：

```powershell
$logDir = "D:\Work\omniverse-ntsac\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$log = Join-Path $logDir "codex_live_kit_$ts.log"
$args = @(
  "launch", "-n", "usd_viewer_streaming.kit", "--",
  "--/app/auto_load_usd=`"D:/Work/omniverse-ntsac/usds/Main.usda`"",
  "--no-window",
  "--/log/file=`"$log`""
)
Start-Process -FilePath ".\repo.bat" -ArgumentList $args -WorkingDirectory "D:\Work\omniverse-ntsac\kit-app-template" -WindowStyle Hidden -PassThru
```

啟動 Vite：

```powershell
Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", "npm.cmd run dev -- --host 127.0.0.1 --port 5173") -WorkingDirectory "D:\Work\omniverse-ntsac\web" -WindowStyle Hidden -PassThru
```

啟動 headless Edge DevTools：

```powershell
$profile = "D:\Work\omniverse-ntsac\.codex-edge-profile-headless"
New-Item -ItemType Directory -Force -Path $profile | Out-Null
Start-Process -FilePath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList @(
  "--headless=new",
  "--remote-debugging-port=9222",
  "--user-data-dir=$profile",
  "--no-first-run",
  "--disable-gpu",
  "about:blank"
) -WindowStyle Hidden -PassThru
```

執行內建 verifier：

```powershell
node C:\Users\jeff.wang\.codex\skills\omniverse-live-api-verify\scripts\verify_draw_crowd_flow_color.js `
  --log D:\Work\omniverse-ntsac\logs\codex_live_kit_YYYYMMDD_HHMMSS.log
```

## 清理

只停止本次驗證啟動的 process。優先記錄 `Start-Process -PassThru` 回傳的 PID，避免誤殺使用者原本開著的 Chrome/Edge/Node。若 PID 記錄遺失，先看 start time 與 command context 再停止。
