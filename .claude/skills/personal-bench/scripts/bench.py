#!/usr/bin/env python3
"""Deterministic parts of a personal benchmark run: blinding and scoring.

The skill (SKILL.md) runs the conversation and the model calls. This script owns
everything that should come out the same every time: the shuffled A/B/C labels and
the ranking math. Standard library only (Python 3.9+).

    python3 bench.py blind  <run_dir>   # responses.json -> blind.json + blind.md
    python3 bench.py report <run_dir>   # + judge.json [+ human.json] -> report.md

Run dir files:
    evals.json      [{id, category, title, prompt, context, criteria: [str]}]
    responses.json  [{eval_id, model, text, duration_ms}]
    blind.json      {eval_id: {"A": model, ...}}             (written by `blind`)
    judge.json      [{eval_id, label, criteria_scores: [1-5], overall: 1-10, reason}]
    human.json      [{eval_id, best: label, worst: label, note}]   (optional)
"""

import json
import random
import secrets
import statistics
import string
import sys
from collections import defaultdict
from pathlib import Path


def load(run, name, required=True):
    path = run / name
    if not path.exists():
        if required:
            sys.exit(f"missing {path}")
        return None
    return json.loads(path.read_text())


def responses_by_eval(responses):
    out = defaultdict(dict)
    for r in responses:
        if r["model"] in out[r["eval_id"]]:
            sys.exit(f"duplicate response for {r['eval_id']} / {r['model']}")
        out[r["eval_id"]][r["model"]] = r
    return out


def blind(run):
    evals = load(run, "evals.json")
    by_eval = responses_by_eval(load(run, "responses.json"))
    rng = random.Random(secrets.randbits(64))
    mapping, lines = {}, ["# Blind responses", "",
                          "Model names are hidden. The key is in blind.json; don't open it while rating.", ""]
    for ev in evals:
        models = sorted(by_eval.get(ev["id"], {}))
        if not models:
            sys.exit(f"no responses for eval {ev['id']}")
        rng.shuffle(models)
        labels = dict(zip(string.ascii_uppercase, models))
        mapping[ev["id"]] = labels
        lines += [f"## {ev['id']}: {ev['title']}", "", f"**Category:** {ev['category']}", "",
                  "**Prompt:**", "", ev["prompt"], ""]
        if ev.get("context"):
            lines += ["**Context:**", "", ev["context"], ""]
        lines += ["**What good looks like:**", ""] + [f"- {c}" for c in ev["criteria"]] + [""]
        for label, model in labels.items():
            lines += [f"### Response {label}", "", by_eval[ev["id"]][model]["text"], ""]
    (run / "blind.json").write_text(json.dumps(mapping, indent=2) + "\n")
    (run / "blind.md").write_text("\n".join(lines))
    print(f"wrote blind.json and blind.md for {len(evals)} evals")


def fmt(x, digits=1):
    return "–" if x is None else f"{x:.{digits}f}"


def mean(xs):
    return statistics.mean(xs) if xs else None


def report(run):
    evals = load(run, "evals.json")
    by_eval = responses_by_eval(load(run, "responses.json"))
    mapping = load(run, "blind.json")
    judge = load(run, "judge.json")
    human = load(run, "human.json", required=False) or []

    def model_for(eval_id, label):
        try:
            return mapping[eval_id][label]
        except KeyError:
            sys.exit(f"unknown label {label!r} for eval {eval_id!r}")

    models = sorted({m for e in by_eval.values() for m in e})
    cat_of = {e["id"]: e["category"] for e in evals}
    title_of = {e["id"]: e["title"] for e in evals}
    categories = sorted({e["category"] for e in evals})

    # Judge: overall 1-10 per (eval, model).
    jscore = {}
    for j in judge:
        jscore[(j["eval_id"], model_for(j["eval_id"], j["label"]))] = j["overall"]
    # Human: best = 2 points, worst = 0, everyone else = 1.
    hpoints, hbest = {}, {}
    for h in human:
        if h["best"] == h["worst"]:
            sys.exit(f"eval {h['eval_id']}: best and worst are the same label")
        hbest[h["eval_id"]] = model_for(h["eval_id"], h["best"])
        worst = model_for(h["eval_id"], h["worst"])
        for m in mapping[h["eval_id"]].values():
            hpoints[(h["eval_id"], m)] = 2 if m == hbest[h["eval_id"]] else 0 if m == worst else 1

    def agg(table, model, cat=None):
        return mean([v for (eid, m), v in table.items()
                     if m == model and (cat is None or cat_of[eid] == cat)])

    rows = []
    for m in models:
        durations = [by_eval[eid][m]["duration_ms"] for eid in by_eval if m in by_eval[eid]]
        rows.append({
            "model": m,
            "human": agg(hpoints, m) if human else None,
            "wins": sum(1 for b in hbest.values() if b == m),
            "judge": agg(jscore, m),
            "median_s": statistics.median(durations) / 1000 if durations else None,
        })
    rows.sort(key=lambda r: (-(r["human"] or 0), -(r["judge"] or 0)))

    # Did the judge's top pick match the human's best? Ties at the top count as a miss.
    agree = []
    for eid, best in hbest.items():
        scores = {m: jscore.get((eid, m)) for m in mapping[eid].values()}
        top = max(scores.values())
        tops = [m for m, s in scores.items() if s == top]
        agree.append(len(tops) == 1 and tops[0] == best)

    out = ["# Personal benchmark", ""]
    meta = load(run, "meta.json", required=False) or {}
    if meta:
        out += [f"**Who:** {meta.get('who', '–')}  ", f"**Date:** {meta.get('date', '–')}  ",
                f"**Evals:** {len(evals)} · **Models:** {', '.join(models)}", ""]
    out += ["## Ranking", "",
            "| Rank | Model | Your score (0–2) | Your picks for best | Judge score (1–10) | Median time (s) |",
            "|---|---|---|---|---|---|"]
    for i, r in enumerate(rows, 1):
        out.append(f"| {i} | {r['model']} | {fmt(r['human'], 2)} | {r['wins'] if human else '–'} "
                   f"| {fmt(r['judge'])} | {fmt(r['median_s'])} |")
    out += ["", "Your score: best answer = 2, worst = 0, the rest = 1, averaged over evals. "
            "Ranked by your score, judge breaks ties.", ""]

    out += ["## By category", "", "| Model | " + " | ".join(categories) + " |",
            "|---|" + "---|" * len(categories)]
    for r in rows:
        cells = []
        for c in categories:
            h = agg(hpoints, r["model"], c) if human else None
            cells.append(f"{fmt(h, 2)} you · {fmt(agg(jscore, r['model'], c))} judge")
        out.append(f"| {r['model']} | " + " | ".join(cells) + " |")
    out.append("")

    out += ["## Each eval", "", "| Eval | Category | Your best | " +
            " | ".join(f"Judge: {m}" for m in models) + " |",
            "|---|---|---|" + "---|" * len(models)]
    for e in evals:
        cells = [fmt(jscore.get((e["id"], m)), 0) for m in models]
        out.append(f"| {e['id']}: {title_of[e['id']]} | {e['category']} | "
                   f"{hbest.get(e['id'], '–')} | " + " | ".join(cells) + " |")
    out.append("")

    out += ["## How much to trust this", ""]
    if agree:
        out.append(f"- The judge's top pick matched yours on {sum(agree)} of {len(agree)} evals "
                   f"({100 * sum(agree) / len(agree):.0f}%).")
    out += [f"- {len(evals)} evals, one answer per model each. Models vary run to run, so a small gap "
            "between two models may be luck.",
            "- The judge is a Claude model grading Claude models, blind and in shuffled order. "
            "Your picks count more than the judge's.",
            "- Time is wall-clock time for each subagent call. It includes harness overhead, so "
            "compare models to each other, not to the API.", ""]

    (run / "report.md").write_text("\n".join(out))
    print("\n".join(out))


if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[1] not in ("blind", "report"):
        sys.exit(__doc__)
    {"blind": blind, "report": report}[sys.argv[1]](Path(sys.argv[2]))
