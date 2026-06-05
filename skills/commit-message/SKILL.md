---
name: commit-message
description: 依照 OneDev 與 Conventional Commits 規範產生、改善、驗證或翻譯 commit message。當使用者要求撰寫 commit message、檢查 commit 訊息格式、依 staged diff 產生提交訊息、補上 scope/body/footer/測試說明，或處理 OneDev push 規範限制時使用。
---

# Commit Message

## 工作流程

1. 在可讀取 repository 時，先檢查變更內容再撰寫訊息：
   - 優先使用 `git diff --cached --stat`、`git diff --cached --name-status`，必要時再看重點 staged diff。
   - 同時使用 `git diff --stat`、`git diff --name-status`、`git status --short` 檢查 unstaged / untracked 檔案。
   - 判斷 unstaged / untracked 是否有與 staged commit 主題相關、可能漏 staged 的檔案。
   - 若發現疑似漏 staged，先在回覆中列出，不要自動 stage，除非使用者明確要求。
   - 若沒有 staged 內容，改看 `git diff --stat`，並在回覆中清楚說明建議是根據 unstaged changes。
   - 除非使用者明確要求，不要 stage、commit 或修改檔案。
2. 從變更內容判斷主要 `<type>` 與可用的 `<scope>`。
3. 判斷這次修改的目的：
   - 優先使用使用者明確描述的目的。
   - 其次從 staged diff 的功能變化、錯誤修正、流程調整推導。
   - 若目的無法可靠判斷，不要猜測；在回覆中標註「目的需確認」或省略目的句。
4. 先寫符合規範的 title；只有在需要補充 what、why、影響或測試方式時才加入 body。
5. 輸出應可直接作為 commit message 使用。通常提供一個推薦版本即可；必要時可附短版。

## 必要格式

Commit message 應符合：

```text
<type>[<optional scope>][!]: <briefing>

[<optional body>]

[<optional footer(s)>]
```

規則：

- Title 必須在單一行內。
- Title、body、footer 之間至少保留一行空白。
- Title 總長度限制 70 字元內，建議 50 字元內。
- 若 `<briefing>` 使用英文，第一個字必須大寫。
- Title 最後不要加句號。
- 若 title 是行動描述，優先使用命令句，動詞放前面。
- Body 與 footer 每行限制 72 字元內。
- Body 優先說明 what and why，而不是細節 how。
- 若已知測試或確認方式，建議在 body 補上。

## Type 選擇

依變更內容選擇合適類型：

- `fix`：修改或修正錯誤。
- `feat`：加入特徵或功能。
- `build`：與 build、建制、打包、部署或 build profile 有關。
- `chore`：與 git 環境、建制環境、程式碼風格、設定檔或註解有關，且不涉及功能或定義變更。
- `docs`：文件或說明變更。
- `style`：視覺或風格調整。
- `refactor`：不改變功能，僅調整結構。
- `perf`：改善效能。
- `test`：測試或測試工具相關。
- `none`：無關專案的 commit，例如自我測試或學習用途。

若 commit 同時涵蓋多種重要類型，可以連續標示，例如：

```text
fix: refactor: 修正登入流程並調整內部結構
```

## Scope

`<scope>` 用來描述 commit 涵蓋範圍，例如子系統、套件、功能、app、scene、module 或 domain。
若專案歷史已有相同範疇命名，優先沿用既有寫法。沒有明確範圍時可省略，但不建議省略。

範例：

```text
feat(tcvgh): 新增建築 Highlight Web 事件
fix(auth): 修正 refresh token 過期判斷
build(webgl): 更新 Unity WebGL build profile
```

## 重要或破壞性變更

若 commit 包含重要改變，或需要特別留意的破壞性變更，於 `<type>` 或 `<scope>` 後加入 `!`：

```text
feat(api)!: 要求裝置查詢帶入 tenant ID
```

若已知細節，加入 footer：

```text
BREAKING CHANGE: Device queries now require a tenant ID.
```

## Body 建議

Title 無法充分說明脈絡時才加入 body。需要 body 時，預設使用以下分段格式，讓目的、變更與測試清楚分離：

```text
<type>(<scope>): <briefing>

目的:
- 說明這次修改要解決的問題或降低的維護成本。
- 若目的無法從使用者描述或 diff 可靠判斷，標註「目的需確認」，不要自行猜測。

變更:
- 說明主要行為、資料流程、介面或結構調整。
- 只寫和此次 commit 主題直接相關的變更。

測試:
- 列出已執行的檢查、測試或人工驗證。
- 若未執行測試，明確寫「未執行測試」。
```

Body 可包含：

- 這次修改的目的與原因。
- 改了什麼。
- 對使用者、系統或部署的影響。
- 如何測試或確認。

範例：

```text
feat(elevator): 改用 Area API 處理電梯樓層

目的:
- 讓電梯 Web 與 Composer UI 使用統一的 Area metadata，
  避免前端與測試工具各自硬編樓層清單或自行組 areaName。

變更:
- 電梯 3D 頁改由 AreaDataForWeb 建立樓層到 areaName 的對應。
- 電梯 2D 頁改由 Area API 產生樓層軸，移除 33F/B4F 硬編範圍。
- 電梯 Composer UI 改用 get_area_data 取得 Area 清單。
- unsupported floor 不做 clamp、不送 3D 移動，只記 warning。

測試:
- python -m py_compile elevator_system_ui.py
- npm.cmd run type-check 仍受既有 unrelated 型別錯誤影響
```

## 輸出偏好

- 使用者未指定語言時，優先輸出中文 commit message。
- 保留 commit type 關鍵字為英文，例如 `feat`、`fix`、`build`。
- Scope 可依專案慣例使用英文或既有名稱。
- Commit body 預設使用「目的 / 變更 / 測試」分段；只有極小修改才可省略 body 或改用短段落。
- 若使用者要求英文版，再輸出英文 commit message。

## 檢查清單

送出前確認：

- Title 符合 `<type>[<scope>][!]: <briefing>`。
- Title 不超過 70 字元。
- 英文 briefing 第一個字大寫。
- Title 沒有句號結尾。
- Title、body、footer 之間有空白行。
- Body/footer 每行不超過 72 字元。
- 需要 body 時，已使用「目的 / 變更 / 測試」分段，且目的沒有被省略。
- 已檢查 staged / unstaged / untracked，並提醒可能漏 staged 的相關檔案。
- Commit message 有說明此次修改目的；若目的不明，已明確標註需確認或避免猜測。
- Commit message 符合實際 staged changes；若根據 unstaged 或使用者描述產生，需清楚說明。
