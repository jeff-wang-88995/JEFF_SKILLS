---
name: omniverse-extension-folder
description: Generate minimal Omniverse Kit Extension folder structures in the omniverse-ntsac workspace. Use when the user asks to create or scaffold an Extension folder and wants the layout to follow AGENTS.md and local examples such as ennowell_draw_heatmap_adapter.
---
# Omniverse Extension 資料夾格式

使用這個 Skill 時，先遵守 workspace 的 `AGENTS.md`。在 `D:\Work\omniverse-ntsac` 中，回答與說明使用繁體中文。

## 參考格式

產生 Extension 資料夾時，優先參考：

```text
kit-app-template/source/extensions/ennowell_draw_heatmap_adapter
```

如果使用者要 UI 測試面板，也可以參考：

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

- 一般 extension 預設放 `kit-app-template/source/extensions`
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

不要自動加入 docs、README、CHANGELOG、測試資料夾或其他多餘檔案，除非使用者明確要求。

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

若有圖示：

```toml
icon = "data/icon.png"
preview_image = "data/preview.png"
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

## 完成檢查

產生資料夾後確認：

- 資料夾格式符合上述結構。
- 沒有多餘 docs / README / CHANGELOG，除非使用者指定。
- `extension.toml` package name 與 python module name 對齊。
- `premake5.lua` link 的 module folder 存在。
- `__init__.py` import 的主檔存在。
- 主 Python 檔不能是 `extension.py`，除非使用者指定。
