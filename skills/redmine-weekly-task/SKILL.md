---
name: redmine-weekly-task
description: 'Generate weekly task markdown from Redmine issues. Use when preparing weekly task sheets, 每週任務, 工時規劃, Redmine 議題整理, O/M/P estimation, PERT recalculation, or teammate handoff instructions.'
argument-hint: 'Provide date range, week code, output filename, Redmine base URL, and any manual overrides.'
user-invocable: true
disable-model-invocation: false
---
# Redmine Weekly Task

## 這個 Skill 會做什麼

這個 skill 用來把 Redmine 的本週 issue 整理成每週任務 markdown。

適用情境：

1. 產出每週任務表。
2. 整理本週工作項目。
3. 從 Redmine issue 重新計算 O/M/P 與 PERT。
4. 把流程轉交給同事使用。

這個 skill 是可轉交版本，整個資料夾可以直接複製到別人的環境中使用。

## 先收集 Input

執行前先確認以下 input 已提供：

1. 起訖日期，格式為 `YYYY-MM-DD~YYYY-MM-DD`。
2. Redmine API key。
3. 週次，例如 `115W16`。如果日期區間查不到資料，會改用這個值做 `週次代碼` 搜尋。
4. 輸出檔名，例如 `115W16_EW112031.md`。如果只提供檔名，預設輸出到 skill 資料夾外層；不可寫回 skill 資料夾內。
5. Redmine base URL，例如 `https://redmine.int.ennowell.net`。
6. 固定類型值，預設為 `3D`。
7. 人工修正項目，例如 `Issue 58134 O=1h`。

詳細格式請看 [input-checklist](./references/input-checklist.md)。

## 預設查詢條件

除非使用者另外指定，否則使用以下 Redmine 篩選條件：

1. 先用日期區間查詢。
2. 狀態不包含 `Closed`、`Rejected`。
3. 指派給 `me`。
4. 到期日介於起日與迄日之間。
5. 排序為 `status,id:desc`。
6. 如果日期區間查不到任何 issue，改用自訂欄位 `週次代碼` 搜尋。
7. `週次代碼` 的值使用使用者提供的週次，例如 `115W16`。

查詢指令模板請看 [query-redmine-weekly.ps1](./assets/query-redmine-weekly.ps1)。

## 輸出規則

產出的每週任務 markdown 需符合以下規則：

1. 專案代碼從 Redmine 專案概觀或專案描述取得。
2. 難度、O、M、P 從 issue 描述取得。
3. 所有工時單位統一為 `h`。
4. 除非使用者指定其他排序，否則依專案代碼排序。
5. 議題欄位輸出為 markdown 超連結。
6. 最後加總全部重算後的 PERT。
7. 輸出檔案永遠寫到 skill 資料夾外。
8. `assets/` 內的 markdown 僅作為模板或範例，不可覆寫成實際產出。

## 操作步驟

1. 檢查 input 是否完整。
2. 先用指定日期區間查詢目前使用者的 Redmine issue。
3. 如果查詢結果為 0 筆，改用 `週次代碼` 查詢。
4. 逐筆讀取 issue 詳細內容與 project 資料。
5. 從 project description 解析專案代碼。
6. 從 issue description 解析難度與 O/M/P。
7. 套用使用者提供的人工修正。
8. 產出 markdown 表格。
9. 將檔案寫到 skill 資料夾外；若使用者只提供檔名，預設寫到呼叫當下的工作區根目錄。
10. 不可覆寫 `assets/` 下的範例 markdown。

## 同事直接使用建議

如果要交給同事，建議一起附上這三份：

1. [input-checklist](./references/input-checklist.md)
2. [copilot-request-template](./assets/copilot-request-template.md)
3. [common-errors](./references/common-errors.md)
4. [weekly-task-template](./assets/weekly-task-template.md)
5. [weekly-task-sample](./assets/115W16_EW112031.md)

## 轉交方式

把 `redmine-weekly-task` 整個資料夾複製到以下任一位置即可：

1. 其他 repo：`.github/skills/redmine-weekly-task/`
2. 個人 Copilot skills：`~/.agents/skills/redmine-weekly-task/`
3. 其他支援的 Copilot skills 路徑

## 附帶資源

1. [Input 清單](./references/input-checklist.md)
2. [Copilot 提示詞模板](./assets/copilot-request-template.md)
3. [PowerShell 查詢模板](./assets/query-redmine-weekly.ps1)
4. [常見錯誤排查](./references/common-errors.md)
5. [每週任務模板](./assets/weekly-task-template.md)
6. [每週任務輸出範例](./assets/115W16_EW112031.md)
