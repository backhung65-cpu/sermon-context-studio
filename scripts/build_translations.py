"""Build static UI dictionaries from reviewed ko/en strings; no translation API runs in the app.

The public Google Translate endpoint is used only when regenerating this checked-in snapshot.
Review generated copy with native speakers before treating it as publication quality.
"""

import concurrent.futures
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = json.loads((ROOT / "src" / "i18n-source.json").read_text(encoding="utf-8"))
TARGETS = ["ja", "zh-CN", "es", "th", "hi", "fr", "de"]


def translate(item):
    locale, key, value = item
    marked = re.sub(r"\{([a-z]+)\}", lambda match: f"ZX{match.group(1).upper()}ZX", value)
    query = urllib.parse.urlencode({"client": "gtx", "sl": "en", "tl": locale, "dt": "t", "q": marked})
    for attempt in range(4):
        try:
            request = urllib.request.Request("https://translate.googleapis.com/translate_a/single?" + query,
                                             headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(request, timeout=20) as response:
                chunks = json.load(response)[0]
            result = "".join(chunk[0] for chunk in chunks if chunk[0])
            for placeholder in re.findall(r"\{([a-z]+)\}", value):
                result = re.sub(r"ZX\s*" + placeholder.upper() + r"\s*ZX", "{" + placeholder + "}", result, flags=re.I)
            if set(re.findall(r"\{([a-z]+)\}", result)) != set(re.findall(r"\{([a-z]+)\}", value)):
                raise ValueError(f"Missing placeholder: {locale} {key}: {result}")
            return locale, key, result
        except Exception:
            if attempt == 3:
                raise
            time.sleep(1.5 * (attempt + 1))


items = [(locale, key, value) for locale in TARGETS for key, value in SOURCE["en"].items()]
output = {"ko": SOURCE["ko"], "en": SOURCE["en"], **{locale: {} for locale in TARGETS}}
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    for index, (locale, key, value) in enumerate(executor.map(translate, items), start=1):
        output[locale][key] = value
        if index % 100 == 0:
            print(f"Translated {index}/{len(items)}", flush=True)
for locale, messages in output.items():
    if set(messages) != set(SOURCE["en"]):
        raise ValueError(f"Incomplete {locale}: {set(SOURCE['en']) - set(messages)}")
target = ROOT / "src" / "i18n.js"
target.write_text("// Static interface translations. See i18n-source.json and scripts/build_translations.py.\n"
                  + "import { OVERRIDES } from './i18n-overrides.js';\n"
                  + "export const MESSAGES = " + json.dumps(output, ensure_ascii=False, separators=(",", ":")) + ";\n"
                  + "for (const [locale, overrides] of Object.entries(OVERRIDES)) Object.assign(MESSAGES[locale], overrides);\n"
                  + "export const LOCALES = {ko:'한국어',en:'English',ja:'日本語','zh-CN':'简体中文',es:'Español',th:'ไทย',hi:'हिन्दी',fr:'Français',de:'Deutsch'};\n"
                  + "export function t(locale,key,variables={}) { const template=MESSAGES[locale]?.[key] ?? MESSAGES.en[key] ?? key; return template.replace(/\\{(\\w+)\\}/g, (_,name)=>String(variables[name] ?? '')); }\n",
                  encoding="utf-8")
print(f"Wrote {target} ({target.stat().st_size} bytes)")
