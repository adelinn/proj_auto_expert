#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import sys
from pathlib import Path
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

# ---------------- TEST DEFINITIONS ----------------
TEST_DEFS = {
    "A":  {"group": "A, A1, A2, AM", "nr": 20, "time": 20, "min": 17},
    "A1": {"group": "A, A1, A2, AM", "nr": 20, "time": 20, "min": 17},
    "A2": {"group": "A, A1, A2, AM", "nr": 20, "time": 20, "min": 17},
    "AM": {"group": "A, A1, A2, AM", "nr": 20, "time": 20, "min": 17},

    "B":  {"group": "B, B1, Tr", "nr": 26, "time": 30, "min": 22},
    "B1": {"group": "B, B1, Tr", "nr": 26, "time": 30, "min": 22},
    "Tr": {"group": "B, B1, Tr", "nr": 26, "time": 30, "min": 22},

    "C":  {"group": "C, C1", "nr": 26, "time": 30, "min": 22},
    "C1": {"group": "C, C1", "nr": 26, "time": 30, "min": 22},

    "D":  {"group": "D, D1, Tb, Tv", "nr": 26, "time": 30, "min": 22},
    "D1": {"group": "D, D1, Tb, Tv", "nr": 26, "time": 30, "min": 22},
    "Tb": {"group": "D, D1, Tb, Tv", "nr": 26, "time": 30, "min": 22},
    "Tv": {"group": "D, D1, Tb, Tv", "nr": 26, "time": 30, "min": 22},

    "E": {"group": "BE, CE, DE", "nr": 11, "time": 15, "min": 9},
}

ANSWER_MAP = {
    1: [1, 0, 0],
    2: [0, 1, 0],
    3: [0, 0, 1],
    4: [1, 1, 0],
    5: [1, 0, 1],
    6: [0, 1, 1],
    7: [1, 1, 1],
}
# --------------------------------------------------


def esc(s: str) -> str:
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def extract_image_uri(url: str) -> str:
    return "/img_chestionare/" + url.split("/")[-1]


def parse_answer_mask(mask: int):
    """Returns [A, B, C] correctness flags"""
    return ANSWER_MAP[mask]


def main():
    if len(sys.argv) != 2:
        print("Usage: python -X utf8 jsonl_to_sql.py <questions.jsonl>", file=sys.stderr)
        sys.exit(1)

    jsonl_path = Path(sys.argv[1])
    if not jsonl_path.exists():
        print(f"File not found: {jsonl_path}", file=sys.stderr)
        sys.exit(1)

    questions = []
    with jsonl_path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                questions.append(json.loads(line))

    # -------- Group questions by test group --------
    grouped_questions = defaultdict(list)
    for q in questions:
        cat = q["category"]
        grouped_questions[TEST_DEFS[cat]["group"]].append(q)

    sql = []
    sql.append(
        "SET NAMES utf8mb4;\n"
        "SET CHARACTER SET utf8mb4;\n"
        "START TRANSACTION;\n"
    )

    test_ids = {}
    test_id = 0

    # -------- Create tests (exact question count enforced) --------
    for group, qs in grouped_questions.items():
        required = TEST_DEFS[qs[0]["category"]]["nr"]
        if len(qs) < required:
            raise RuntimeError(
                f"Not enough questions for '{group}': "
                f"{len(qs)} found, {required} required"
            )

        test_id += 1
        test_ids[group] = test_id
        test_name = f"{group} - Set 1"

        td = TEST_DEFS[qs[0]["category"]]

        sql.append(
            f"""INSERT INTO teste
(nume, categorie, punctajStart, punctajMinim, timpLimitaS, versiune)
VALUES (
{esc(test_name)},
{esc(group)},
0,
{td["min"]},
{td["time"]},
1
);\n"""
        )

        grouped_questions[group] = qs[:required]  # enforce exact count

    # -------- Insert questions / answers --------
    img_map = {}
    img_id = 0
    q_id = 0

    for group, qs in grouped_questions.items():
        for q in qs:
            # Image
            if q.get("imageUrl"):
                uri = extract_image_uri(q["imageUrl"])
                if uri not in img_map:
                    img_id += 1
                    img_map[uri] = img_id
                    sql.append(
                        f"INSERT INTO pozeQ (uri) VALUES ({esc(uri)});\n"
                    )
                id_poza = img_map[uri]
            else:
                id_poza = "NULL"

            # Question
            q_id += 1
            sql.append(
                f"""INSERT INTO intrebari
(text, categorie, id_poza, tipQ_1xR)
VALUES (
{esc(q["text"])},
{esc(q["category"])},
{id_poza},
1
);\n"""
            )

            sql.append(
                f"""INSERT INTO chestionare
(id_test, id_intrebare, valoareQ)
VALUES ({test_ids[group]}, {q_id}, 1);\n"""
            )

            # Answers
            correct = parse_answer_mask(int(q["answer"]))
            answers = [q["textA"], q["textB"], q["textC"]]

            for i, txt in enumerate(answers):
                sql.append(
                    f"""INSERT INTO raspunsuriQ
(id_intrebare, text, corect)
VALUES (
{q_id},
{esc(txt)},
{correct[i]}
);\n"""
                )

    sql.append("COMMIT;\n")
    print("".join(sql))


if __name__ == "__main__":
    main()
