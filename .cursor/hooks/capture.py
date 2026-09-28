#!/usr/bin/env python3
"""Log user prompts and final agent responses to .agent-logs/.

Fired automatically by Cursor hooks. Writes only prompt + final response.
Does not log thinking, tool calls, or intermediate steps.
"""
from __future__ import annotations

import json
import os
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

AUTHOR = os.environ.get("AGENT_CAPTURE_AUTHOR", "akshitalanjewar")
TOOL = "cursor"
PROJECT = "higgsfield-clone"
FALLBACK_MODEL = "cursor-grok-4.6"


def utc_now() -> str:
    dt = datetime.now(timezone.utc)
    ms = dt.microsecond // 1000
    return dt.strftime("%Y-%m-%dT%H:%M:%S") + f".{ms:03d}Z"


def project_root() -> Path:
    env = os.environ.get("CURSOR_PROJECT_DIR") or os.environ.get("CLAUDE_PROJECT_DIR")
    if env:
        return Path(env)
    return Path(__file__).resolve().parents[2]


def emit(obj: dict) -> None:
    sys.stdout.write(json.dumps(obj, ensure_ascii=False))
    sys.stdout.flush()


def debug_write(root: Path, name: str, data) -> None:
    path = root / ".cursor" / "hooks" / name
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(data, (dict, list)):
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        else:
            path.write_text(str(data), encoding="utf-8")
    except OSError:
        pass


def load_state(path: Path) -> dict:
    if not path.exists():
        return {"sessions": {}}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"sessions": {}}


def save_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def session_id_from(payload: dict) -> str:
    for key in ("conversation_id", "session_id", "composer_id"):
        val = payload.get(key)
        if isinstance(val, str) and val.strip():
            return val.strip()
    env = os.environ.get("AGENT_CAPTURE_SESSION_ID")
    if env:
        return env
    return "unknown-session"


def model_from(payload: dict) -> str:
    for key in ("model", "model_name", "composer_model"):
        val = payload.get(key)
        if isinstance(val, str) and val.strip():
            return val.strip()
    return FALLBACK_MODEL


def event_name(payload: dict) -> str:
    name = payload.get("hook_event_name") or payload.get("event")
    if isinstance(name, str) and name:
        return name
    if "prompt" in payload and "text" not in payload:
        return "beforeSubmitPrompt"
    if "duration_ms" in payload and "text" in payload:
        return "afterAgentThought"
    if "status" in payload and "loop_count" in payload:
        return "stop"
    if "composer_mode" in payload or (
        "session_id" in payload and "is_background_agent" in payload
    ):
        return "sessionStart"
    if "text" in payload:
        return "afterAgentResponse"
    return "unknown"


def render_header(meta: dict) -> str:
    return (
        "---\n"
        f"session_id: {meta['session_id']}\n"
        f"date: {meta['date']}\n"
        f"author: {AUTHOR}\n"
        f"model: {meta['model']}\n"
        f"tool: {TOOL}\n"
        f"project: {PROJECT}\n"
        f"total_exchanges: {meta['total_exchanges']}\n"
        f"first_prompt_time: {meta['first_prompt_time']}\n"
        f"last_prompt_time: {meta['last_prompt_time']}\n"
        "---\n"
        "\n"
        f"# Session Log - {meta['date']}\n"
        "\n"
        f"Session: `{meta['short_id']}` | Project: `{PROJECT}` | Author: `{AUTHOR}`\n"
        "\n"
        "---\n"
        "\n"
    )


def format_entry(kind: str, num: int, short_id: str, ts: str, model: str, body: str) -> str:
    return (
        f"[LOG_ENTRY type={kind} num={num} session={short_id}]\n"
        f"timestamp: {ts}\n"
        f"model: {model}\n"
        "\n"
        f"{body.rstrip()}\n"
        "\n"
        "\n"
    )


def split_entries(text: str) -> tuple[str, str]:
    idx = text.find("[LOG_ENTRY")
    if idx == -1:
        return text, ""
    return text[:idx], text[idx:]


def ensure_session(root: Path, state: dict, sid: str, model: str, ts: str) -> dict:
    sessions = state.setdefault("sessions", {})
    if sid in sessions:
        rec = sessions[sid]
        rec["model"] = model or rec.get("model") or FALLBACK_MODEL
        return rec

    dt = datetime.now(timezone.utc)
    date = dt.strftime("%Y-%m-%d")
    fname_time = dt.strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"{fname_time}_{sid}.md"
    rec = {
        "file": filename,
        "session_id": sid,
        "short_id": sid.split("-")[0] if sid else "unknown",
        "date": date,
        "model": model,
        "total_exchanges": 0,
        "first_prompt_time": ts,
        "last_prompt_time": ts,
        "created_at": ts,
    }
    sessions[sid] = rec
    logs = root / ".agent-logs"
    logs.mkdir(parents=True, exist_ok=True)
    path = logs / filename
    if not path.exists():
        path.write_text(render_header(rec), encoding="utf-8")
    return rec


def rewrite_log(root: Path, rec: dict, new_entry: str) -> None:
    path = root / ".agent-logs" / rec["file"]
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        existing = path.read_text(encoding="utf-8")
        _, entries = split_entries(existing)
    else:
        entries = ""
    path.write_text(render_header(rec) + entries + new_entry, encoding="utf-8")


def handle_prompt(root: Path, payload: dict) -> dict:
    ts = utc_now()
    sid = session_id_from(payload)
    model = model_from(payload)
    prompt = payload.get("prompt")
    if not isinstance(prompt, str):
        prompt = "" if prompt is None else str(prompt)

    state_path = root / ".cursor" / "hooks" / "capture-state.json"
    state = load_state(state_path)
    rec = ensure_session(root, state, sid, model, ts)
    rec["total_exchanges"] = int(rec.get("total_exchanges") or 0) + 1
    rec["last_prompt_time"] = ts
    if not rec.get("first_prompt_time"):
        rec["first_prompt_time"] = ts
    rec["model"] = model
    rec["pending_response_num"] = rec["total_exchanges"]
    num = rec["total_exchanges"]
    entry = format_entry("PROMPT", num, rec["short_id"], ts, model, prompt)
    rewrite_log(root, rec, entry)
    save_state(state_path, state)
    return {"continue": True, "env": {"AGENT_CAPTURE_SESSION_ID": sid}}


def handle_response(root: Path, payload: dict) -> dict:
    ts = utc_now()
    sid = session_id_from(payload)
    model = model_from(payload)
    text = payload.get("text")
    if not isinstance(text, str):
        text = "" if text is None else str(text)

    state_path = root / ".cursor" / "hooks" / "capture-state.json"
    state = load_state(state_path)
    rec = ensure_session(root, state, sid, model, ts)
    num = rec.get("pending_response_num") or rec.get("total_exchanges") or 1
    rec["model"] = model
    rec["last_response_time"] = ts
    entry = format_entry("RESPONSE", int(num), rec["short_id"], ts, model, text)
    rewrite_log(root, rec, entry)
    save_state(state_path, state)
    return {}


def handle_session_start(payload: dict) -> dict:
    sid = session_id_from(payload)
    return {"env": {"AGENT_CAPTURE_SESSION_ID": sid}}


def main() -> int:
    raw = sys.stdin.buffer.read()
    try:
        payload = json.loads(raw.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        payload = {}
    if not isinstance(payload, dict):
        payload = {}

    root = project_root()
    debug_write(root, "last-payload.json", payload)
    event = event_name(payload)

    if event == "beforeSubmitPrompt":
        emit(handle_prompt(root, payload))
        return 0
    if event == "afterAgentResponse":
        emit(handle_response(root, payload))
        return 0
    if event == "sessionStart":
        emit(handle_session_start(payload))
        return 0
    if event in ("afterAgentThought", "stop", "sessionEnd", "unknown"):
        emit({})
        return 0
    emit({})
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception:
        try:
            root = project_root()
            err = root / ".cursor" / "hooks" / "capture-errors.log"
            err.parent.mkdir(parents=True, exist_ok=True)
            with err.open("a", encoding="utf-8") as fh:
                fh.write(utc_now() + "\n")
                fh.write(traceback.format_exc() + "\n")
        except OSError:
            pass
        # Fail open: never block the agent.
        event_guess = "unknown"
        try:
            emit({"continue": True})
        except Exception:
            pass
        raise SystemExit(0)
