---
name: redmine-direct-access
description: 直接使用固定的 Redmine base URL，並從 Git 忽略的本機文字檔讀取 API key，以查詢、建立、更新或搬移 Redmine issue。當使用者提到「上 Redmine」、「幫我上 Redmine」、「用 Redmine 金鑰」、「直接建 Redmine issue」、「查 Redmine 單號」、「修改 Redmine issue」、「搬移 Redmine issue」時使用。
argument-hint: 提供要查詢、建立或修改的 issue 內容；若未提供專案、tracker 或分類，需先查 Redmine metadata 再執行。
user-invocable: true
disable-model-invocation: false
---

# Redmine Direct Access

## 這個 Skill 會做什麼

這個 skill 用來直接操作 Redmine，而不是只產生 issue 草稿。

適用情境：

1. 幫使用者直接上 Redmine 查 issue。
2. 用 API key 建立、更新或搬移 issue。
3. 查詢 project、tracker、category、version 與 issue custom field。
4. 在網頁未登入時，改走 API 完成 Redmine 操作。

## 固定連線資訊

除非使用者明確要求覆蓋，否則一律使用以下設定：

1. Redmine base URL：`https://redmine.int.ennowell.net`
2. API key 來源：相對於本 Skill 目錄的 `.local/redmine-api-key.txt`。
3. 執行前，先從目前載入的 `SKILL.md` 來源位置取得其所在目錄並設為 `$skillDir`；不可依賴目前工作目錄，也不可寫死絕對路徑。
4. 使用 PowerShell 讀取：
   ```powershell
   $keyPath = Join-Path $skillDir '.local\redmine-api-key.txt'
   $apiKey = (Get-Content -LiteralPath $keyPath -Raw -Encoding UTF8).Trim()
   ```
5. 若本機文字檔不存在或內容為空，停止 API 操作並告知使用者。
6. 不可將 API key 寫入 Skill、程式碼、命令輸出或 Git 追蹤檔案。
7. 呼叫 API 時，將讀取到的值放入 `X-Redmine-API-Key` Header。

## 預設操作原則

1. 優先使用 Redmine API，不要先假設一定要用瀏覽器登入。
2. 在建立 issue 前，先確認目標 project 是否真的支援該 tracker、category 與必要 custom field。
3. 若使用者只說「上 Redmine」，先驗證 `/users/current.json` 是否可通，再決定後續查詢或建單流程。
4. 若 API 建單失敗，不要直接改掛其他專案；先查失敗原因，再向使用者說明。
5. 只有在使用者明確同意，或專案配置明顯無法建單時，才可改掛父專案或共享專案。
6. 使用者提到週次代碼或主旨含有週別格式（例如 `[115W25]`）時，主旨必須保留該週別，並同步寫入 Redmine 自訂欄位 `週次代碼`（custom field id `29`），值只填週別本體（例如 `115W25`）。

## 最小驗證流程

收到 Redmine 相關要求時，優先做以下驗證：

1. 呼叫 `GET /users/current.json` 確認 API key 可用。
2. 若需查專案，呼叫 `GET /projects.json?limit=100`。
3. 若需建單到特定專案，先呼叫：
   - `GET /projects/{identifier_or_id}.json?include=trackers,issue_categories,issue_custom_fields,enabled_modules`
4. 若需查專案版本，呼叫：
   - `GET /projects/{identifier}/versions.json`

## 建立 Issue 流程

建立 issue 時，請依序執行：

1. 確認目標專案。
2. 確認 tracker 是否存在於該專案。
3. 確認 category 是否為該專案有效類別。
4. 若專案存在 `issue_custom_fields`，先補齊必要欄位。
5. 若 issue 屬於特定週次，或主旨含 `[115Wxx]` 這類週別，需同時在 `custom_fields` 寫入 `{ "id": 29, "value": "115Wxx" }`。
6. 再送出 `POST /issues.json`。
7. 建立完成後，立即反查 issue 或讀取回傳 id，確認真的建立成功。

送出格式範例：

```json
{
  "issue": {
    "project_id": 272,
    "tracker_id": 2,
    "category_id": 2286,
    "assigned_to_id": 251,
    "subject": "[115W24] 範例主旨",
    "description": "【目標】...",
    "custom_fields": [
      { "id": 29, "value": "115W24" }
    ]
  }
}
```

## 更新與搬移 Issue 流程

若使用者要求修改既有 issue：

1. 先讀 issue 詳情，確認目前 project、tracker、category、status、custom_fields。
2. 再呼叫 `PUT /issues/{id}.json` 更新必要欄位。
3. 若要搬移 project，先確認目標 project 支援相同 tracker 與必要欄位。
4. 若目標 project 缺 tracker、status 或 category，先告知使用者，不要硬搬。

## 常用查詢端點

1. 目前使用者：`GET /users/current.json`
2. 專案清單：`GET /projects.json?limit=100`
3. 專案詳細資料：`GET /projects/{identifier_or_id}.json?include=trackers,issue_categories,issue_custom_fields,enabled_modules`
4. 版本清單：`GET /projects/{identifier}/versions.json`
5. issue 清單：`GET /issues.json?...`
6. issue 詳情：`GET /issues/{id}.json`
7. 建立 issue：`POST /issues.json`
8. 更新 issue：`PUT /issues/{id}.json`

## 失敗排查規則

若 Redmine 回傳 422，優先檢查以下項目：

1. `分類 不能是空白字元`
   - 代表該專案需要 `category_id`。
2. `Revision 不能是空白字元`
   - 代表該專案需要自訂欄位 `Revision`，需補 `custom_fields`。
3. `專案 不能是空白字元`、`追蹤標籤 不能是空白字元`、`狀態 不能是空白字元`
   - 多半代表該專案 API 端可用 metadata 不完整，或該專案尚未正確配置 tracker / workflow。
4. 若 project detail 讀得到，但 `trackers` 或 `issue_categories` 為空，先視為該專案目前不適合直接建單。

## 此環境已知資訊

目前已確認：

1. 使用者帳號可由 API key 驗證取得。
2. `新北二辦統包工程` 可正常建單，但某些 tracker 需補 category 與 `Revision`。
3. `越南QTSC園區智慧整合系統開發平台` 可正常建單，但需補有效 category。
4. `橋頭園區數位創新復合樓群統包工程` 已確認可由 API 查得 tracker 與 issue category，並可正常建單；建單前仍需依 project metadata 選擇有效 tracker/category。

## 回覆規則

完成 Redmine 操作後，回覆至少要包含：

1. 是否成功。
2. 新建立或修改的 issue id。
3. 實際掛到哪個 project。
4. 若有 fallback 或欄位補正，需明確說明原因。

若無法完成，需明確指出是：

1. API key 無效。
2. 專案配置不完整。
3. 使用者尚未提供必要資訊。
4. 目標 issue 不存在。
