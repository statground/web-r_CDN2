"""Check the labels embedded in the active, pinned book detail asset."""

import json
import re
import unittest
from pathlib import Path


ASSET = (
    Path(__file__).resolve().parents[1]
    / "scripts_go/web_r_go_20260629_1025/scripts_v2/book/set_main.js"
)
SUPPORTED = {
    "ko", "en", "ja", "zh-Hans", "zh-Hant", "es", "fr", "de", "pt-BR", "ru",
    "id", "vi", "th", "ms", "fil", "hi", "ar", "it", "nl", "pl", "sv", "tr", "uk",
}
VARIABLES = {
    "tocAll": {"count"},
    "tocPartial": {"count", "shown"},
    "notFound": {"sub"},
    "loadError": {"error"},
}


def labels():
    source = ASSET.read_text(encoding="utf-8")
    detail = source.split("window.WebRBookPages.list =", 1)[0]
    keys = json.loads(re.search(r"const detailKeys = (\[[^;]+\]);", detail).group(1))
    matrix = {}
    for code, row in re.findall(r'^\s*("[^"]+"|[A-Za-z-]+): (\[.*\]),?$', detail, re.M):
        if code.startswith('"'):
            code = json.loads(code)
        if code in SUPPORTED:
            matrix[code] = json.loads(row)
    return source, detail, keys, matrix


class BookDetailLocalesTest(unittest.TestCase):
    def test_all_supported_languages_have_complete_distinct_labels(self):
        _, _, keys, matrix = labels()
        self.assertEqual(set(matrix), SUPPORTED)
        self.assertEqual(len(keys), len(set(keys)))
        self.assertEqual(len(keys), 23)
        for code, values in matrix.items():
            self.assertEqual(len(values), len(keys), code)
            self.assertTrue(all(isinstance(value, str) and value.strip() for value in values), code)
            if code != "ko":
                self.assertNotEqual(values, matrix["ko"], code)
                for key in ("books", "recommended", "marketplace", "description", "contents", "bookInfo", "published", "publisher", "view"):
                    value = values[keys.index(key)]
                    self.assertIsNone(re.search(r"[가-힣]", value), (code, key, value))

    def test_format_variables_and_used_keys_match(self):
        _, detail, keys, matrix = labels()
        for code, values in matrix.items():
            for key, value in zip(keys, values):
                self.assertEqual(set(re.findall(r"\{(\w+)\}", value)), VARIABLES.get(key, set()), (code, key))
        used = set(re.findall(r'detailText\("([A-Za-z]+)"', detail))
        self.assertEqual(used, set(keys))
        self.assertIn('row(detailText("registration"), isbnRegistrationGroup', detail)
        self.assertIn('"data-webr-user-content": ""', detail)


if __name__ == "__main__":
    unittest.main()
