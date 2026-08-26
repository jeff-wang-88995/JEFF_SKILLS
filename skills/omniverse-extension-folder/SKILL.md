---
name: omniverse-extension-folder
description: 在 omniverse-ntsac workspace 建立或整理 Omniverse Kit Extension 的資料夾、命名、依賴與標準 Extension Manager 文件結構。當使用者要求建立或 scaffold Extension、整理既有 Extension、補齊中英文 Overview／Changelog、設定 Composer 文件預覽，或仿照 ennowell_alarm_system_ui、ennowell_draw_heatmap_adapter 等本地 Extension 格式時使用。
---
# Omniverse Extension 資料夾格式

用來產生或整理 Omniverse Kit Extension 資料夾。內容只描述 Extension 結構、命名、依賴、標準 Extension Manager 文件與 Composer UI 面板相關規則。

## 專案規則

- 可以參照 `ennowell_alarm_system_ui` 的資料夾格式，特別是 UI 面板 extension。
- 若製作 UI 面板，畫面顯示文字請使用英文，因為 Omni Composer 內不支援顯示中文。
- 如果是單純給 Composer 使用的 UI / 測試面板，不需要添加依賴至 USD Viewer Streaming。
- Python 主檔不要命名為 `extension.py`，除非使用者明確要求。
- Python 檔內註解可以使用繁體中文；若能用中文說清楚，優先使用中文註解。

## 建立前確認

- 每次建立新的 Extension 時，先詢問使用者：「這個 Extension 是否需要建立 Extension Manager 的 Overview 與 Changelog？若需要，會同時產生英文預覽版與繁體中文版。」
- 若使用者在原始需求已明確要求或拒絕文件，直接依需求執行，不要重複詢問。
- 只在建立新 Extension 時詢問；修改既有 Extension 時不要每次詢問。使用者已要求替既有 Extension 建立或整理 Overview／Changelog 時，直接依需求執行。若本次修改涉及 Extension Manager 顯示且既有 Extension 缺少文件，可以提醒一次。
- 使用者需要文件時，依「中英文 Extension Manager 文件」建立四份文件並完成設定。
- 使用者不需要文件時，維持最小 Extension 結構，不要建立 `docs/`。

## 參考格式

產生 Extension 資料夾時，優先參考：

```text
kit-app-template/source/extensions/ennowell_draw_heatmap_adapter
```

如果使用者要 UI 測試面板，優先參考：

```text
kit-app-template/source/exts/ennowell_alarm_system_ui
```

## 放置位置

依使用者需求選擇：

```text
kit-app-template/source/extensions/<extension_name>
```

或：

```text
kit-app-template/source/exts/<extension_name>
```

若使用者沒有指定位置：

- 一般 adapter / provider / runtime extension 預設放 `kit-app-template/source/extensions`
- UI / 測試面板 extension 預設放 `kit-app-template/source/exts`

## 基本資料夾格式

最小格式：

```text
<extension_name>/
  config/
    extension.toml
  <python_module>/
    __init__.py
    <main_file>.py
  premake5.lua
```

若需要 Extension Manager 圖示或使用者要求沿用圖示，可加入：

```text
<extension_name>/
  data/
    icon.png
    preview.png
```

依「建立前確認」的回答決定是否加入 `docs/`。不要自行加入 README、測試資料夾或其他多餘檔案。

## 中英文 Extension Manager 文件

使用者需要 Overview 與 Changelog 時，建立：

```text
<extension_name>/
  docs/
    Overview.md
    CHANGELOG.md
    Overview.zh-TW.md
    CHANGELOG.zh-TW.md
```

- `Overview.md` 與 `CHANGELOG.md` 是 Composer 預覽使用的英文版。使用純英文與 ASCII 字元，避免 Composer 顯示 `????`。
- `Overview.zh-TW.md` 與 `CHANGELOG.zh-TW.md` 是完整繁體中文版，不要只提供簡化摘要。
- 中英文 Changelog 的版本、日期與變更項目保持一致。
- Overview 至少包含用途、操作流程、UI 控制項、結果欄位、還原或資料安全機制，以及限制與注意事項。
- Changelog 使用版本分段，並以 Added、Changed、Fixed、Removed 等類別記錄實際變更；中文版使用對應的繁體中文標題。
- 本 Skill 的標準文件範圍就是上述四份檔案；不要因建立 `docs/` 而自行增加使用者未要求的其他文件。

## 命名規則

- `<extension_name>` 使用使用者指定的 extension 名稱。
- `<python_module>` 通常與 `<extension_name>` 相同。
- `extension.toml` 的 `[package].name` 要與 `<extension_name>` 一致。
- `extension.toml` 的 `[[python.module]].name` 要與 `<python_module>` 一致。
- 主 Python 檔不要命名為 `extension.py`，除非使用者明確要求。
- 主 Python 檔使用能看出用途的名稱，例如：
  - `draw_heatmap_adapter.py`
  - `alarm_system_ui.py`
  - `<feature>_adapter.py`
  - `<feature>_ui.py`

## extension.toml 最小格式

```toml
[package]
name = "<extension_name>"
title = "<title>"
description = "<description>"
version = "0.1.0"
category = "Utility"
keywords = ["kit", "python"]

[fswatcher.patterns]
include = ["*.py"]

[dependencies]
"omni.kit.uiapp" = {}

[[python.module]]
name = "<python_module>"
```

若 extension 不是 UI 面板，依實際需求調整 dependencies，不要為了模板固定加入不需要的依賴。

若有圖示：

```toml
icon = "data/icon.png"
preview_image = "data/preview.png"
```

若有中英文 Extension Manager 文件，在 `[package]` 加入英文預覽路徑，並登錄四份文件：

```toml
readme = "docs/Overview.md"
changelog = "docs/CHANGELOG.md"

[documentation]
pages = [
    "docs/Overview.md",
    "docs/CHANGELOG.md",
    "docs/Overview.zh-TW.md",
    "docs/CHANGELOG.zh-TW.md",
]
```

## __init__.py 格式

`__init__.py` 只需要從主 Python 檔 import extension class：

```python
from .<main_file_without_py> import <ExtensionClassName>

__all__ = [
    "<ExtensionClassName>",
]
```

## premake5.lua 格式

無 `data/` 時：

```lua
local ext = get_current_extension_info()

project_ext(ext)

repo_build.prebuild_link {
    { "<python_module>", ext.target_dir.."/<python_module>" },
}
```

有 `data/` 時：

```lua
local ext = get_current_extension_info()

project_ext(ext)

repo_build.prebuild_link {
    { "<python_module>", ext.target_dir.."/<python_module>" },
    { "data", ext.target_dir.."/data" },
}
```

有 `docs/` 時，將 `docs` 加入 `repo_build.prebuild_link`，確保打包後包含文件：

```lua
repo_build.prebuild_link {
    { "<python_module>", ext.target_dir.."/<python_module>" },
    { "docs", ext.target_dir.."/docs" },
}
```

若同時有 `data/` 與 `docs/`，兩者都要加入 link。

## 完成檢查

產生資料夾後確認：

- 資料夾格式符合上述結構。
- 已在建立新 Extension 前確認是否需要中英文 Overview 與 Changelog；原始需求已明確指定時沒有重複詢問。
- 使用者不需要文件時，沒有多餘的 `docs/`、README 或 CHANGELOG。
- 使用者需要文件時，四份中英文文件都存在，內容互相對應。
- `extension.toml` 的 `readme` 與 `changelog` 指向英文版，`documentation.pages` 登錄四份文件。
- 英文 Overview 與 Changelog 只使用英文與 ASCII 字元，繁體中文文件使用 UTF-8 no BOM 與 LF。
- 有 `docs/` 時，`premake5.lua` 已 link `docs`。
- `extension.toml` package name 與 python module name 對齊。
- `premake5.lua` link 的 module folder 存在。
- `__init__.py` import 的主檔存在。
- 主 Python 檔不能是 `extension.py`，除非使用者指定。
- UI 面板顯示文字使用英文。
- Composer-only UI / 測試面板沒有被加入 USD Viewer Streaming 依賴。
- Extension 相關檔案結構、命名與依賴符合本 Skill 規則。
