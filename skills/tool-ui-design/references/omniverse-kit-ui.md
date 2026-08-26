# Omniverse Kit／Composer UI 規則

只有任務明確涉及 NVIDIA Omniverse、Kit、USD Composer 或 `omni.ui` 時才讀取並套用本文件。

## 顯示文字與平台限制

- Composer UI 的使用者可見文字使用英文，避免中文在目標版本顯示成亂碼。
- 程式註解與獨立繁體中文文件可依 repository 規範使用繁體中文。
- 同一概念有不同名稱時，介面使用最短且一致的名稱，Tooltip 補充完整名稱或代稱，例如 `Authoring Layer (Edit Target)`。

## Dockable Panel 與版面

- 先確認面板會停駐的位置、常用寬度與可用高度，再決定排列。
- 使用 `VStack`、`HStack`、`ScrollingFrame`、條件 `visible` 與適當 spacing 組織內容；不要只為了壓縮而犧牲可讀性。
- 長 Tooltip 應換行並限制可讀寬度；長路徑需考慮截斷、Tooltip 或可複製欄位。
- 條件欄位隱藏後，其他元件應自然回收空間，不留下無意義空白。
- 在窄面板檢查標籤、ComboBox、數值欄位、單位與按鈕是否重疊或產生水平捲動。

## Stage 選取與自動更新

- 先判斷 Stage selection 是操作目標、瀏覽狀態，還是兩者皆是；不要因任何 selection event 都重做昂貴工作。
- 自動掃描或重新整理應只在相關 Scope／Mode 啟用時發生，避免無關選取干擾效能測量。
- 切換選取不得自動移除 Preview、暫存 Layer 或未儲存編輯，除非產品流程明確如此設計。
- 顯示的 Prim、Scope、Layer 與實際套用目標必須一致；若欄位隱藏，狀態摘要仍須提供必要確認。

## Layer、Edit Target 與危險操作

- 寫入 Layer 或 Edit Target 前，確認視窗應顯示解析後的實際 Layer 路徑或 identifier，以及會修改的資料範圍。
- 儲存整個 Layer 可能同時保存其他未儲存 opinions 時，必須在確認內容說明。
- 刪除 Layer 檔案時，區分解除 Sublayer 掛載與永久刪除，並說明能否還原。
- 如果確認視窗開啟後目標 Layer、Edit Target 或路徑改變，應中止操作並要求重新確認。
- Session Layer、匿名 Layer、唯讀 Layer 與 Resolver 路徑需依實際 API 能力處理，不要假設都是本機檔案。

## 驗證

1. 先閱讀 repository 的 `AGENTS.md`、Extension 設定與既有 build 指令。
2. 若專案提供 `repo.bat build`，從正確的 Kit template 目錄執行，不假設它位於 repository 根目錄。
3. 建置成功只證明解析與 staging 流程通過，不等於 UI runtime 已驗證；但這不代表每個小改都必須啟動 Composer。
4. 先依通用決策框架分級，優先採用靜態分析、既有測試、Build、log、使用者提供的截圖或既有快照。只有這些證據不足以回答具體排版、互動或 runtime 風險時，才啟動或控制 Composer。
5. 需要視覺檢查時，只涵蓋受影響的 Dock 寬度、條件狀態與滾動範圍；需要行為檢查時，也只涵蓋與本次變更相關的 Stage、Selection、Scope、Mode、Modal 或失敗狀態。
6. 使用 Composer／Windows 視覺控制前，先簡短說明要驗證的具體風險。採風險分級時不需為一般低風險操作額外停下等待確認；若使用者已要求不要視覺控制，則不得使用。
7. Runtime 問題先依 repository 指定的 Kit logs 查詢；沒有專案規則時，再查使用者資料目錄下對應 Kit app 的 logs。

未執行視覺驗證時，明確回報「僅完成靜態／Build 驗證」及未驗證項目，不得宣稱畫面或 runtime 行為已確認。
