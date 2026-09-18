# Omniverse Kit／Composer UI 規則

只有製作或檢查 NVIDIA Omniverse、Kit、USD Composer 或 `omni.ui` 的工具面板時才讀取並套用本文件。

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

## 涉及 Stage 或 Layer 編輯時

- 選取變化不應意外清除 Preview 或未儲存內容；顯示的操作目標應與實際寫入目標一致。
- 寫入或刪除前顯示實際 Layer、影響範圍與可否還原；USD 的詳細行為依專案規範與實際 API 確認。

## 驗證

- 依專案的 Extension 與 build 指令檢查；Build 成功不代表工具面板在 Composer 中的顯示與互動已驗證。
- 需要視覺檢查時，只涵蓋受影響的 Dock 寬度、條件狀態與滾動範圍。Runtime 問題先查專案指定的 Kit logs。
