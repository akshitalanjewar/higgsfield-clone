#!/usr/bin/env python3
"""Log user prompts and final agent responses to .agent-logs/.

Supports both Cursor hooks (.cursor/hooks.json) and Antigravity hooks (.agents/hooks.json).
Captures raw verbatim user prompts and final agent responses per session.
Intermediate reasoning (thinking), tool calls, and retries are strictly excluded.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

# Ensure UTF-8 streams on Windows
if sys.platform == "win32":
    if hasattr(sys.stdin, "reconfigure"):
        try:
            sys.stdin.reconfigure(encoding="utf-8")
        except Exception:
            pass
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    if hasattr(sys.stderr, "reconfigure"):
        try:
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

AUTHOR = os.environ.get("AGENT_CAPTURE_AUTHOR", "akshitalanjewar")
DEFAULT_TOOL = "cursor"
PROJECT = "higgsfield-clone"
FALLBACK_MODEL = "cursor-grok-4.6"

USER_REQUEST_RE = re.compile(r"<USER_REQUEST>\s*(.*?)\s*</USER_REQUEST>", re.DOTALL)
USER_QUERY_RE = re.compile(r"<user_query>\s*(.*?)\s*</user_query>", re.DOTALL)


def utc_now() -> str:
    dt = datetime.now(timezone.utc)
    ms = dt.microsecond // 1000
    return dt.strftime("%Y-%m-%dT%H:%M:%S") + f".{ms:03d}Z"


def project_root(payload: dict | None = None) -> Path:
    if payload:
        ws = payload.get("workspacePaths")
        if isinstance(ws, list) and ws and isinstance(ws[0], str) and ws[0].strip():
            p = Path(ws[0].strip())
            if p.exists():
                return p
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
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except OSError:
        pass


def read_stdin() -> bytes:
    chunks: list[bytes] = []
    try:
        while True:
            block = os.read(0, 65536)
            if not block:
                break
            chunks.append(block)
    except OSError:
        pass
    return b"".join(chunks)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--event", default="")
    args, _unknown = parser.parse_known_args()
    return args


def workspace_slug(root: Path) -> str:
    s = str(root.resolve())
    s = s.replace(":", "")
    s = s.replace("\\", "-").replace("/", "-")
    if s.startswith("-"):
        s = s[1:]
    return s


def find_transcript(root: Path, payload: dict) -> Path | None:
    # 1. Check Antigravity / Cursor payload keys
    for key in ("transcriptPath", "transcript_path", "CURSOR_TRANSCRIPT_PATH"):
        val = payload.get(key) if key in payload else os.environ.get(key)
        if isinstance(val, str) and val.strip():
            p = Path(val.strip())
            if p.exists():
                return p
    env = os.environ.get("CURSOR_TRANSCRIPT_PATH")
    if env:
        p = Path(env)
        if p.exists():
            return p
    # 2. Check Antigravity brain storage by conversationId
    cid = payload.get("conversationId")
    if cid:
        brain_path = Path.home() / ".gemini" / "antigravity" / "brain" / cid / ".system_generated" / "logs" / "transcript.jsonl"
        if brain_path.exists():
            return brain_path
    # 3. Check Cursor project transcripts
    base = Path.home() / ".cursor" / "projects" / workspace_slug(root) / "agent-transcripts"
    if base.exists():
        jsonls = sorted(base.rglob("*.jsonl"), key=lambda p: p.stat().st_mtime, reverse=True)
        if jsonls:
            return jsonls[0]
    return None


def session_id_from(payload: dict, transcript: Path | None) -> str:
    for key in ("conversationId", "conversation_id", "session_id", "composer_id"):
        val = payload.get(key)
        if isinstance(val, str) and val.strip():
            return val.strip()
    env = os.environ.get("AGENT_CAPTURE_SESSION_ID")
    if env:
        return env
    if transcript is not None:
        parts = transcript.resolve().parts
        for i, part in enumerate(parts):
            if part == "brain" and i + 1 < len(parts):
                return parts[i + 1]
        return transcript.parent.name or transcript.stem
    return "unknown-session"


def model_from(payload: dict, records: list[dict] | None = None) -> str:
    for key in ("modelName", "model", "model_name", "composer_model"):
        val = payload.get(key)
        if isinstance(val, str) and val.strip():
            return val.strip()
    if records:
        for r in records:
            content = r.get("content") or ""
            if isinstance(content, str) and "Model Selection" in content:
                m = re.search(r"`Model Selection` from \S+ to (.*?)\.", content)
                if m:
                    return m.group(1).strip()
    env = os.environ.get("AGENT_CAPTURE_MODEL")
    if env:
        return env
    return FALLBACK_MODEL


def tool_from(payload: dict, event: str) -> str:
    env = os.environ.get("AGENT_CAPTURE_TOOL")
    if env:
        return env
    if event in ("PreInvocation", "PostInvocation", "Stop") or "conversationId" in payload or "transcriptPath" in payload:
        return "antigravity"
    return DEFAULT_TOOL


def load_full_content(full_transcript_path: Path, step_idx: int | None) -> str:
    if step_idx is None or not full_transcript_path.exists():
        return ""
    try:
        with full_transcript_path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    if obj.get("step_index") == step_idx:
                        return obj.get("content") or ""
                except json.JSONDecodeError:
                    continue
    except OSError:
        pass
    return ""


def message_text(obj: dict, full_path: Path | None = None) -> str:
    # 1. Antigravity format (step has direct "content")
    if "content" in obj:
        truncated = obj.get("truncated_fields") or []
        if "content" in truncated and full_path:
            full_txt = load_full_content(full_path, obj.get("step_index"))
            if full_txt:
                return full_txt
        content = obj.get("content")
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts = []
            for item in content:
                if isinstance(item, str):
                    parts.append(item)
                elif isinstance(item, dict) and item.get("text"):
                    parts.append(str(item.get("text")))
            return "\n".join(parts)

    # 2. Cursor format (step has "message" dict)
    message = obj.get("message")
    if isinstance(message, dict):
        content = message.get("content")
        parts: list[str] = []
        if isinstance(content, str):
            parts.append(content)
        elif isinstance(content, list):
            for item in content:
                if isinstance(item, dict) and item.get("type") == "text":
                    text = item.get("text")
                    if isinstance(text, str) and text.strip():
                        parts.append(text)
        return "\n".join(parts)

    return ""


def unwrap_user_prompt(raw: str) -> str:
    if not isinstance(raw, str):
        return ""
    m = USER_REQUEST_RE.search(raw)
    if m:
        return m.group(1).strip()
    m = USER_QUERY_RE.search(raw)
    if m:
        return m.group(1).strip()
    return raw.strip()


def load_transcript_records(path: Path) -> list[dict]:
    records: list[dict] = []
    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(obj, dict):
                records.append(obj)
    except OSError:
        return []
    return records


def extract_turns(records: list[dict], full_path: Path | None = None) -> list[dict]:
    turns: list[dict] = []
    current_turn: dict | None = None

    for r in records:
        role = r.get("role")
        st = r.get("type")
        src = str(r.get("source") or "")

        is_user = (role == "user") or (st == "USER_INPUT") or src.startswith("USER")
        is_assistant = (role == "assistant") or (st == "PLANNER_RESPONSE" and src == "MODEL")

        if is_user:
            raw_text = message_text(r, full_path)
            unwrapped = unwrap_user_prompt(raw_text)
            if unwrapped.strip():
                if current_turn is not None:
                    turns.append(current_turn)
                ts = r.get("created_at") or utc_now()
                if isinstance(ts, str) and ts.endswith("Z") and "." not in ts:
                    ts = ts[:-1] + ".000Z"
                current_turn = {
                    "prompt": unwrapped,
                    "prompt_ts": ts,
                    "response": "",
                    "response_ts": "",
                }
        elif is_assistant and current_turn is not None:
            txt = message_text(r, full_path)
            if txt.strip():
                ts = r.get("created_at") or utc_now()
                if isinstance(ts, str) and ts.endswith("Z") and "." not in ts:
                    ts = ts[:-1] + ".000Z"
                current_turn["response"] = txt
                current_turn["response_ts"] = ts

    if current_turn is not None:
        turns.append(current_turn)

    return turns


def render_header(meta: dict) -> str:
    tool_val = meta.get("tool") or DEFAULT_TOOL
    return (
        "---\n"
        f"session_id: {meta['session_id']}\n"
        f"date: {meta['date']}\n"
        f"author: {AUTHOR}\n"
        f"model: {meta['model']}\n"
        f"tool: {tool_val}\n"
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


def ensure_session(root: Path, state: dict, sid: str, model: str, ts: str, tool: str) -> dict:
    sessions = state.setdefault("sessions", {})
    if sid in sessions:
        rec = sessions[sid]
        rec["model"] = model or rec.get("model") or FALLBACK_MODEL
        if tool:
            rec["tool"] = tool
        return rec

    logs = root / ".agent-logs"
    logs.mkdir(parents=True, exist_ok=True)
    existing_files = sorted(logs.glob(f"*_{sid}.md"))
    if existing_files:
        filename = existing_files[0].name
        date_str = filename.split("_")[0]
    else:
        dt = datetime.now(timezone.utc)
        date_str = dt.strftime("%Y-%m-%d")
        fname_time = dt.strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"{fname_time}_{sid}.md"

    rec = {
        "file": filename,
        "session_id": sid,
        "short_id": sid.split("-")[0] if sid else "unknown",
        "date": date_str,
        "model": model,
        "tool": tool,
        "total_exchanges": 0,
        "first_prompt_time": ts,
        "last_prompt_time": ts,
        "created_at": ts,
        "last_prompt_text": "",
        "last_response_text": "",
    }
    sessions[sid] = rec
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


def sync_turns(root: Path, rec: dict, state: dict, state_path: Path, model: str, turns: list[dict]) -> None:
    log_path = root / ".agent-logs" / rec["file"]
    existing_content = log_path.read_text(encoding="utf-8") if log_path.exists() else ""

    prompt_nums = set(map(int, re.findall(r"\[LOG_ENTRY type=PROMPT num=(\d+)", existing_content)))
    resp_nums = set(map(int, re.findall(r"\[LOG_ENTRY type=RESPONSE num=(\d+)", existing_content)))

    if turns and turns[0].get("prompt_ts"):
        rec["first_prompt_time"] = turns[0]["prompt_ts"]

    for i, t in enumerate(turns, 1):
        prompt = t.get("prompt") or ""
        response = t.get("response") or ""
        prompt_ts = t.get("prompt_ts") or utc_now()
        response_ts = t.get("response_ts") or utc_now()

        if i not in prompt_nums and prompt.strip():
            rec["total_exchanges"] = max(int(rec.get("total_exchanges") or 0), i)
            rec["last_prompt_time"] = prompt_ts
            if not rec.get("first_prompt_time"):
                rec["first_prompt_time"] = prompt_ts
            rec["model"] = model
            rec["last_prompt_text"] = prompt
            rec["awaiting_response"] = True
            rec["last_response_text"] = ""
            entry = format_entry("PROMPT", i, rec["short_id"], prompt_ts, model, prompt)
            rewrite_log(root, rec, entry)
            prompt_nums.add(i)

        if i in prompt_nums and i not in resp_nums and response.strip():
            rec["model"] = model
            rec["last_response_time"] = response_ts
            rec["last_response_text"] = response
            rec["awaiting_response"] = False
            entry = format_entry("RESPONSE", i, rec["short_id"], response_ts, model, response)
            rewrite_log(root, rec, entry)
            resp_nums.add(i)

    rec["total_exchanges"] = max(prompt_nums) if prompt_nums else int(rec.get("total_exchanges") or 0)
    save_state(state_path, state)


def main() -> int:
    args = parse_args()
    raw = read_stdin()
    try:
        payload = json.loads(raw.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        payload = {}
    if not isinstance(payload, dict):
        payload = {}

    root = project_root(payload)
    transcript = find_transcript(root, payload)
    full_transcript = transcript.with_name("transcript_full.jsonl") if transcript else None
    records = load_transcript_records(transcript) if transcript else []

    event = args.event or payload.get("hook_event_name") or payload.get("event") or ""
    if not event:
        if "prompt" in payload and "text" not in payload:
            event = "beforeSubmitPrompt"
        elif "duration_ms" in payload and "text" in payload:
            event = "afterAgentThought"
        elif "status" in payload and "loop_count" in payload:
            event = "stop"
        elif "text" in payload:
            event = "afterAgentResponse"
        elif "conversationId" in payload:
            event = "PreInvocation"
        else:
            event = "unknown"

    debug_write(
        root,
        "last-debug.json",
        {
            "event": event,
            "stdin_bytes": len(raw),
            "argv": sys.argv,
            "payload_keys": sorted(payload.keys()),
            "transcript": str(transcript) if transcript else None,
            "cursor_env": {k: os.environ.get(k) for k in sorted(os.environ) if "CURSOR" in k or "CLAUDE" in k},
        },
    )
    debug_write(root, "last-payload.json", payload)

    sid = session_id_from(payload, transcript)
    model = model_from(payload, records)
    tool = tool_from(payload, event)

    stdin_prompt = payload.get("prompt") if isinstance(payload.get("prompt"), str) else ""
    stdin_response = payload.get("text") if isinstance(payload.get("text"), str) else ""

    turns = extract_turns(records, full_transcript)

    # Fallback to stdin payload if transcript has no turns
    if not turns and stdin_prompt.strip():
        turns = [{
            "prompt": unwrap_user_prompt(stdin_prompt),
            "prompt_ts": utc_now(),
            "response": stdin_response,
            "response_ts": utc_now(),
        }]
    elif turns and stdin_response.strip() and not turns[-1].get("response"):
        turns[-1]["response"] = stdin_response
        turns[-1]["response_ts"] = utc_now()

    if sid != "unknown-session" or turns:
        state_path = root / ".cursor" / "hooks" / "capture-state.json"
        state = load_state(state_path)
        rec = ensure_session(root, state, sid, model, utc_now(), tool)
        sync_turns(root, rec, state, state_path, model, turns)

    if event in ("beforeSubmitPrompt", "sessionStart"):
        emit({"continue": True, "env": {"AGENT_CAPTURE_SESSION_ID": sid}})
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
        try:
            emit({"continue": True})
        except Exception:
            pass
        raise SystemExit(0)
