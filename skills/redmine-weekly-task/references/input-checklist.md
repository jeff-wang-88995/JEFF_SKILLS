# Input Checklist

執行前請先填好以下 input。

1. 起訖日期：格式 `YYYY-MM-DD~YYYY-MM-DD`
2. Redmine API key：來源為 `Redmine / 我的帳戶 / API 存取金鑰`
3. 週次：例如 `115W16`，日期查不到資料時會拿來查 `週次代碼`
4. 輸出檔名：例如 `115W16_EW112031.md`，只填檔名即可；實際輸出必須寫到 skill 資料夾外
5. Redmine base URL：例如 `https://redmine.int.ennowell.net`
6. 類型固定值：預設為 `3D`
7. 人工修正清單：例如 `Issue 58134 O=1h`

## 範例

1. 起訖日期：`2026-04-13~2026-04-17`
2. Redmine API key：`your-api-key`
3. 週次：`115W16`
4. 輸出檔名：`115W16_EW112031.md`
5. Redmine base URL：`https://redmine.int.ennowell.net`
6. 類型固定值：`3D`
7. 人工修正清單：`Issue 58134 O=1h`

## 若沒有人工修正

請明確填寫：`無`

## 建議同事照這個格式回覆

1. 起訖日期：`2026-04-13~2026-04-17`
2. Redmine API key：`<your-api-key>`
3. 週次：`115W16`
4. 輸出檔名：`115W16_EW112031.md`

## 輸出位置規則

1. 實際產出檔必須寫到 skill 資料夾外。
2. 若只提供檔名，不提供完整路徑，預設寫到呼叫當下的工作區根目錄。
3. 不可把產出檔寫回 `redmine-weekly-task/` 內，尤其不可覆寫 `assets/` 下的範例檔。
5. Redmine base URL：`https://redmine.int.ennowell.net`
6. 類型固定值：`3D`
7. 人工修正清單：`無`

## 查詢順序

1. 先用起訖日期查詢。
2. 如果查不到任何資料，再用 `週次代碼 = 週次` 查詢。