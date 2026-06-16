---
name: skill-creator-local-rules
description: 補充官方 skill-creator 的本地製作規範。當使用者要求建立、更新、優化、檢查或撰寫 Codex skill，且需要套用繁體中文、UTF-8 no BOM、LF、SKILL.md frontmatter、agents/openai.yaml 使用者可見文字規則時使用；先遵循官方 skill-creator，再套用本 skill。
---

# Skill Creator Local Rules

## 目標

補充官方 `skill-creator` 的本地製作規範。建立、更新或檢查 skill 時，先依照官方 `skill-creator` 的流程，再套用本 skill 的規則。

## 適用範圍

只套用於 Codex skill 製作、更新與檢查流程。不要把專案的一般回答習慣、Shell 操作習慣或其他 AGENTS.md 通用規則寫入 skill，除非使用者另外明確要求。

## 本地製作規則

- Skill 的 `SKILL.md` 內容與 `agents/openai.yaml` 使用者可見文字預設使用繁體中文。
- Skill 的 `SKILL.md` 與 `agents/openai.yaml` 必須使用 UTF-8 no BOM 與 LF。
- 使用 PowerShell 讀取既有 `SKILL.md`、`agents/openai.yaml` 或 skill 內中文文字檔時，使用 `Get-Content -Encoding UTF8`，避免中文內容被讀成亂碼。
- `SKILL.md` 第一個 byte 必須直接是 frontmatter 的 `---`，不可有 UTF-8 BOM，避免 Codex 無法索引該 Skill。
- 技術識別字、指令、檔名、YAML key 與程式碼範例可保留原本語言。

## 建立或更新流程

1. 先使用官方 `skill-creator` 的流程建立或更新 skill。
2. 撰寫 `SKILL.md` 時，保持 frontmatter 只有必要欄位，並確保第一個 byte 是 `---`。
3. 若 skill 有 `agents/openai.yaml`，同步檢查 `display_name`、`short_description`、`default_prompt` 是否符合 skill 內容，且使用者可見文字預設為繁體中文。
4. 寫入或修改 `SKILL.md`、`agents/openai.yaml` 後，驗證 UTF-8 no BOM 與 LF。
5. 若官方 validator 因環境缺套件無法執行，至少手動檢查 frontmatter、BOM、CRLF、TODO 與亂碼。

## 格式驗證

可用 PowerShell 檢查檔案是否為 UTF-8 no BOM 與 LF：

```powershell
$paths=@('<skill-path>\SKILL.md','<skill-path>\agents\openai.yaml')
foreach($p in $paths){
  $bytes=[System.IO.File]::ReadAllBytes($p)
  $hasBom=($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  $crlf=0
  for($i=0;$i -lt $bytes.Length-1;$i++){ if($bytes[$i] -eq 13 -and $bytes[$i+1] -eq 10){ $crlf++ } }
  "$p BOM=$hasBom CRLF=$crlf"
}
```

若需要修正文字檔編碼與換行，使用 UTF-8 no BOM 寫回：

```powershell
$encoding=[System.Text.UTF8Encoding]::new($false)
$text=[System.IO.File]::ReadAllText($path,[System.Text.Encoding]::UTF8)
$text=$text -replace "`r`n","`n" -replace "`r","`n"
[System.IO.File]::WriteAllText($path,$text,$encoding)
```

## 回報格式

回覆使用者時說明：

- 建立或更新的 skill 路徑。
- 是否已套用官方 `skill-creator` 與本地規則。
- `SKILL.md` 是否第一個 byte 為 frontmatter 的 `---`。
- `SKILL.md` 與 `agents/openai.yaml` 是否通過 UTF-8 no BOM 與 LF 檢查。
- 若 validator 無法執行，說明原因與已完成的手動檢查。
