請依據我的 Redmine issue 生成每週任務 markdown 檔。

請使用以下 input：

1. 起訖日期：{{DATE_RANGE}}
2. 週次：{{WEEK_CODE}}
3. 輸出檔名：{{OUTPUT_FILENAME}}
4. Redmine base URL：{{REDMINE_BASE_URL}}
5. 類型固定值：{{FIXED_TYPE}}
6. 人工修正清單：{{MANUAL_OVERRIDES}}

請依照以下流程執行：

1. 先查詢指派給 `me` 的 Redmine issue。
2. 排除狀態 `Closed` 與 `Rejected`。
3. 先用到期日落在指定起訖日期內的條件查詢。
4. 如果日期區間查不到任何 issue，改用 `週次代碼 = {{WEEK_CODE}}` 查詢。
5. 依 `status,id:desc` 排序。
6. 從專案概觀或專案描述取得專案代碼。
7. 從 issue 描述取得難度、O、M、P。
8. 套用我提供的人工修正。
9. 以 `(O + 4M + P) / 6` 重新計算 PERT。
10. 將 PERT 四捨五入到 `0.5h`。
11. 所有工時單位統一使用 `h`。
12. 依專案代碼排序最終表格。
13. 議題欄位輸出為 markdown 超連結。
14. 加總所有重算後的 PERT。
15. 直接輸出成指定檔名的 markdown 檔。
16. 輸出檔案永遠寫到 skill 資料夾外；若只提供檔名，預設寫到工作區根目錄。
17. 不可覆寫 skill 資料夾內 `assets/` 的範例 markdown。

若人工修正清單為空，請視為 `無`。