---
name: modify-submodules
description: 處理 Git submodule 新增、轉換、更新與修復流程。當使用者提到 submodule、submodules、子模組、內層 repo、既有資料夾要變成 submodule、空的 _UnityCore 目錄要補成 submodule、SourceTree 看不到 submodule、修正錯誤 .gitmodules path、gitlink 160000、git submodule add/update/init、Windows git-submodule 缺 basename/sed/git-sh-setup、dubious ownership，或需要撰寫 submodule 相關 commit message 時使用。
---

# Modify Submodules

## 目標

協助使用者安全處理 Git submodule，特別是「資料夾已經存在且裡面有自己的 `.git`」但外層 repo 尚未登記成 submodule 的情境。

## 基本原則

- 先分清楚「外層 repo」與「submodule 內層 repo」，所有狀態都要標明是哪一層。
- 不要自動刪除、搬移、重設或清空既有資料夾；需要破壞性操作時先取得明確同意。
- 內層 repo 有 dirty changes 時，不要自動 commit、stash 或 stage，除非使用者明確要求。
- 外層 repo 只記錄 submodule 的 commit hash，不會包含內層未提交修改。
- SourceTree 看不到 submodule 時，優先確認外層 index 是否有 `160000` gitlink；只有 `.gitmodules` 不算完成登記。
- 若 PowerShell 讀取中文檔案，使用 `Get-Content -Encoding UTF8`。
- 修改 `.gitmodules` 後，維持 UTF-8 no BOM 與 LF；若用 PowerShell 寫入，明確使用 `[System.Text.UTF8Encoding]::new($false)`。

## 快速檢查

在外層 repo 執行：

```powershell
git status --short
git ls-files .gitmodules
git config --file .gitmodules --get-regexp "submodule\\..*\\.(path|url)"
git ls-files --stage -- <submodule-path> .gitmodules
```

在 submodule 內層 repo 執行：

```powershell
git status --short
git rev-parse HEAD
git branch --show-current
git remote -v
```

判斷結果：

- `git ls-files --stage -- <path>` 顯示 `160000`：外層已登記為 submodule。
- 外層 `git status --short` 顯示 `?? <path>/`：外層只看到未追蹤資料夾，尚未登記 submodule。
- 外層 `git status --short` 顯示 `m <path>`：submodule 內層有未提交修改。
- 外層 `git status --short` 顯示 `M <path>`：外層記錄的 submodule commit 指標已變更。
- `.gitmodules` 有 path 但 `git ls-files --stage -- <path>` 沒有 `160000`：只有設定檔，尚未完成 gitlink 登記。
- `.gitmodules` 的 path 指向不存在的專案資料夾，但實際 repo 內有類似 `<current-project>/Assets/_UnityCore`：通常是從其他專案複製後遺留的錯誤 path，先修 `.gitmodules` 再登記 gitlink。
- `<submodule-path>` 存在但沒有檔案也沒有 `.git`：這是空目錄，不能當作既有內層 repo；若 url 已知，走「空目錄補成 submodule」流程。

## 既有內層 repo 轉成 submodule

適用於資料夾已存在、且 `<path>/.git` 存在的情境。

1. 先檢查內層狀態與 HEAD：

```powershell
cd <outer-repo>
git status --short

cd <submodule-path>
git status --short
git rev-parse HEAD
git remote -v
```

2. 確認或補上 `.gitmodules`。

若 `.gitmodules` 已有正確 path 與 url，可直接沿用。若沒有，新增類似內容：

```ini
[submodule "<submodule-path>"]
	path = <submodule-path>
	url = <remote-url>
```

3. 回到外層 repo，登記 gitlink：

```powershell
cd <outer-repo>
git add .gitmodules <submodule-path>
```

若 Git 顯示 `warning: adding embedded git repository`，在這個流程中是預期訊息；接著仍要驗證是否變成 `160000`。

4. 驗證：

```powershell
git ls-files --stage -- <submodule-path>
git diff --cached --submodule
git status --short
```

成功時應看到：

```text
160000 <commit-hash> 0	<submodule-path>
```

## 空目錄補成 submodule

適用於 `<submodule-path>` 已存在、但目錄為空或沒有 `.git`，且 `.gitmodules` path/url 可以確認的情境。

1. 先確認 `.gitmodules` 只保留目前 repo 實際需要的 path/url。若看到其他專案名稱，例如舊的 `<other-project>/Assets/_UnityCore`，改成目前專案實際路徑：

```ini
[submodule "<submodule-path>"]
	path = <submodule-path>
	url = <remote-url>
```

2. 若目標路徑是空目錄，使用 clone 補上內層 repo：

```powershell
git clone <remote-url> <submodule-path>
```

3. 回到外層 repo 登記 gitlink：

```powershell
git add .gitmodules <submodule-path>
```

若 Git 顯示 `warning: adding embedded git repository`，在這個流程中是預期訊息；接著仍要驗證是否變成 `160000`。

4. 驗證：

```powershell
git ls-files --stage -- .gitmodules <submodule-path>
git diff --cached --submodule
git status --short
```

成功時應看到：

```text
160000 <commit-hash> 0	<submodule-path>
```

## 更新 submodule 內容

若使用者要提交的是 submodule 內部程式碼變更：

1. 在內層 repo commit 並 push：

```powershell
cd <submodule-path>
git status --short
git add <files>
git commit -m "<message>"
git push origin <branch>
```

2. 回到外層 repo 更新 submodule 指標：

```powershell
cd <outer-repo>
git add <submodule-path>
git commit -m "chore(<scope>): 更新 submodule 指標"
```

提醒使用者：外層 commit 只記錄 submodule 指到哪個 commit，不會包含內層檔案 diff。

## 新增全新的 submodule

若目標路徑不存在或可安全建立：

```powershell
git submodule add <remote-url> <submodule-path>
git add .gitmodules <submodule-path>
git commit -m "chore(<scope>): 新增 submodule"
```

若目標路徑已存在，不要直接覆蓋；改走「既有內層 repo 轉成 submodule」流程。

若 `git submodule add` 在 Windows 失敗，且錯誤提到 `basename`、`sed` 或 `git-sh-setup`，改走等價 fallback：

```powershell
git clone <remote-url> <submodule-path>
git add .gitmodules <submodule-path>
git ls-files --stage -- <submodule-path>
```

不要因為 fallback 出現 `warning: adding embedded git repository` 就中止；以 `160000` gitlink 驗證是否成功。

## 初始化或拉取既有 submodule

```powershell
git submodule update --init --recursive
```

指定單一路徑：

```powershell
git submodule update --init --recursive <submodule-path>
```

若 `git submodule status` 在 Windows PowerShell 失敗，且錯誤提到 `basename`、`sed` 或 `git-sh-setup`，改用下列指令判斷狀態：

```powershell
git ls-files --stage -- <submodule-path>
git config --file .gitmodules --get-regexp "submodule\\..*\\.(path|url)"
```

## Windows dubious ownership

若內層 repo 檢查出現 `fatal: detected dubious ownership`，先判斷這是帳號/權限上下文差異，不代表 submodule 壞掉。

- 優先用與 clone 或實際使用者相同的權限上下文重新執行 `git status --short`、`git rev-parse HEAD`。
- 不要自動寫入全域 `safe.directory`；只有使用者同意或明確需要時才執行。
- 回報時說明外層 gitlink 驗證結果與內層狀態是否因 dubious ownership 受限。

## 編碼與換行驗證

修改 `.gitmodules` 後，若專案要求 UTF-8 no BOM 與 LF，可用 PowerShell 檢查：

```powershell
$bytes=[System.IO.File]::ReadAllBytes((Resolve-Path '.\.gitmodules'))
$hasBom=($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
$crlf=0; for($i=0;$i -lt $bytes.Length-1;$i++){ if($bytes[$i] -eq 13 -and $bytes[$i+1] -eq 10){ $crlf++ } }
"BOM=$hasBom CRLF=$crlf"
```

## Commit Message 建議

外層登記 submodule：

```text
chore(<scope>): 註冊 <name> submodule
```

外層更新 submodule 指標：

```text
chore(<scope>): 更新 <name> submodule 指標
```

內層 repo 功能變更則依實際 diff 撰寫，不要寫成 submodule 登記。例如日夜切換功能：

```text
feat(new-ux): 新增日夜切換 WebEvent
```

## 回報格式

回覆使用者時優先說明：

- 外層是否已有 `160000` gitlink。
- `.gitmodules` 是否存在且 path/url 是否正確。
- 內層 repo 是否有 dirty changes。
- 已 stage 或尚未 stage 哪些內容。
- 下一步是 commit 內層、commit 外層，或只需重新整理 SourceTree。
