---
name: initialize-unity-project
description: 初始化從範本、既有 repo 或複製專案建立的 Unity 專案。當使用者提到初始化 Unity 專案、Unity 專案改名、從舊專案複製成新專案、清理 README/ProjectSettings/Build Profile/UserSettings、修正 productName/companyName、檢查舊專案名稱殘留、整理 .gitignore、建立或修正 _UnityCore submodule、套用 modify-submodules skill、確認 UTF-8 no BOM 與 LF、準備初始 commit 前檢查時使用。
---

# Initialize Unity Project

## 目標

協助使用者把從範本或舊專案複製出來的 Unity 專案整理成目前專案可用的初始狀態。流程重點是命名清理、Unity 設定檢查、submodule 修正、Git 狀態整理與格式驗證。

## 基本原則

- 先辨識「外層 repo」與「Unity 專案資料夾」，不要假設兩者同名；常見結構是 `<repo>/<unity-project>/Assets`。
- 不要自動刪除大型資料夾、重設 Git、清空 Unity 產物或覆蓋使用者改動；需要破壞性操作時先取得明確同意。
- 使用 PowerShell 讀取專案內中文文字檔時，使用 `Get-Content -Encoding UTF8`，避免 README、Unity YAML 或設定檔被讀成亂碼。
- Unity 專案可能含有大量二進位或套件內容；搜尋時排除 `.git`、`Library`、`Temp`、`Logs`、`obj` 等資料夾。
- 若遇到 submodule、`.gitmodules`、`_UnityCore`、`160000 gitlink`，必須套用 `modify-submodules` skill 的流程處理。

## 快速盤點

在外層 repo 執行：

```powershell
git status --short
Get-ChildItem -Force
Get-ChildItem -Recurse -Force -Directory -Filter Assets | Select-Object -First 20 FullName
rg --files --hidden --no-ignore -g '!**/.git/**' -g '!**/Library/**' -g '!**/Temp/**' -g '!**/Logs/**' -g '!**/obj/**'
```

辨識 Unity 專案資料夾：

- 有 `Assets`、`Packages`、`ProjectSettings` 的資料夾通常是 Unity project root。
- 有 `ProjectSettings/ProjectSettings.asset` 可確認為 Unity 專案。
- 若 repo 根目錄還有 README、CI 設定或 `.gitmodules`，把 repo 根目錄與 Unity project root 分開回報。

## 初始化流程

1. 確認目前專案名稱與舊專案名稱。

若使用者沒有明講舊名稱，從 README、OneDev remote、資料夾名稱、Unity `productName`、`.gitmodules` path 推測，但要在回報中說明這是推測。

```powershell
git remote -v
rg -n --hidden --no-ignore "<old-name>|<old-keyword>" . -g '!**/.git/**' -g '!**/Library/**' -g '!**/Temp/**' -g '!**/Logs/**' -g '!**/obj/**'
rg --files --hidden --no-ignore -g '!**/.git/**' -g '!**/Library/**' -g '!**/Temp/**' -g '!**/Logs/**' -g '!**/obj/**' | rg -i "<old-name>|<old-keyword>"
```

2. 清理專案命名殘留。

優先檢查並修正：

- `README.md`：移除舊專案名稱、舊 Redmine、舊 OneDev、舊 GitLab、舊 TG 群組、舊專案概述。
- `ProjectSettings/ProjectSettings.asset`：`productName`、`companyName`、`projectName`。
- `Assets/Settings/Build Profiles/*.asset`：Build Profile 內嵌的 `productName`、`companyName`、`projectName`。
- CI/CD 設定，例如 `.onedev-buildspec.yml`、Dockerfile、nginx 設定。
- `UserSettings`：通常不應提交；若已存在於 repo，先回報用途與風險，不要直接刪除。

對 README 的原則：

- 使用者若說「概述不用填」，保留 `## 概述` 標題即可，不要放 `待確認` 欄位。
- 不知道的專案資訊不要硬填；寧可移除舊內容。
- OneDev URL 可以從 `git remote -v` 確認後更新。

3. 修正 submodule。

一旦涉及 `.gitmodules`、`_UnityCore`、內層 repo 或 SourceTree 看不到 submodule，立即套用 `modify-submodules` skill。不要在此 skill 內重新發明完整 submodule 流程。

最低要求：

```powershell
git status --short
git config --file .gitmodules --get-regexp "submodule\\..*\\.(path|url)"
git ls-files --stage -- .gitmodules <submodule-path>
```

完成後必須確認：

- `.gitmodules` path 指向目前專案路徑。
- 外層 index 有 `160000 <commit> 0 <submodule-path>`。
- 內層 repo remote 與 HEAD 可讀。
- 內層 dirty changes 沒有被自動 commit、stash 或忽略。

4. 檢查 Unity 忽略規則與不該提交的產物。

確認 `.gitignore` 有排除常見 Unity 產物：

```text
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/
```

若 `UserSettings`、`Library`、`Temp` 已經出現在 Git 狀態中，先回報。不要直接移除 tracked 檔案，除非使用者要求。

5. 格式與編碼驗證。

對本次修改過的文字檔檢查 UTF-8 no BOM 與 LF：

```powershell
$paths=@('<file1>','<file2>')
foreach($p in $paths){
  $full=(Resolve-Path -LiteralPath $p)
  $bytes=[System.IO.File]::ReadAllBytes($full)
  $hasBom=($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  $crlf=0
  for($i=0;$i -lt $bytes.Length-1;$i++){ if($bytes[$i] -eq 13 -and $bytes[$i+1] -eq 10){ $crlf++ } }
  "$full BOM=$hasBom CRLF=$crlf"
}
```

若需要修正換行，使用 UTF-8 no BOM 寫回：

```powershell
$encoding=[System.Text.UTF8Encoding]::new($false)
$text=[System.IO.File]::ReadAllText($full,[System.Text.Encoding]::UTF8)
$text=$text -replace "`r`n","`n" -replace "`r","`n"
[System.IO.File]::WriteAllText($full,$text,$encoding)
```

6. 最終驗證。

```powershell
rg -n --hidden --no-ignore "<old-name>|<old-keyword>" . -g '!**/.git/**' -g '!**/Library/**' -g '!**/Temp/**' -g '!**/Logs/**' -g '!**/obj/**'
git status --short
git diff --stat
git diff -- .gitmodules README.md ProjectSettings "Assets/Settings"
```

若 `rg` 沒有結果，說明舊名稱關鍵字已清乾淨。若仍有結果，逐項說明是否應保留，例如第三方套件、歷史文件或 binary metadata。

## 回報格式

回覆使用者時優先說明：

- 目前專案名稱、舊專案名稱，以及是否仍有殘留。
- 修改了哪些檔案與重要欄位。
- 是否已套用 `modify-submodules`，以及外層是否有 `160000` gitlink。
- 有哪些檔案仍未追蹤或需要使用者決定是否加入 `.gitignore`。
- 本次修改過的文字檔是否通過 UTF-8 no BOM 與 LF 檢查。

## Commit Message 建議

初始化 Unity 專案：

```text
chore(unity): 初始化專案設定
```

清理舊專案命名：

```text
chore(unity): 清理舊專案命名
```

修正 submodule：

```text
chore(submodule): 修正 UnityCore submodule 登記
```
