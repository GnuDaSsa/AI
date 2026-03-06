import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


MODEL = "gemini-3.1-flash-image-preview"
API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"{MODEL}:generateContent"
)

ROOT = Path(__file__).resolve().parents[1]
GAME_DIR = ROOT / "renpy" / "game"
BG_DIR = GAME_DIR / "images" / "bg"
CHAR_DIR = GAME_DIR / "images" / "chars"


BACKGROUNDS = [
    (
        BG_DIR / "city_hall.png",
        "Create a high-quality visual novel background, 16:9. "
        "A South Korean city hall auditorium during a public official appointment "
        "ceremony, formal podium, rows of chairs, municipal atmosphere, modest but "
        "hopeful mood, semi-realistic anime style, grounded office drama, no text, "
        "no watermark, no logo.",
    ),
    (
        BG_DIR / "district_office_exterior.png",
        "Create a high-quality visual novel background, 16:9. "
        "Exterior of a South Korean district office building in daytime, realistic "
        "local government office architecture, subdued colors, grounded civic mood, "
        "semi-realistic anime style, no text, no watermark, no logo.",
    ),
    (
        BG_DIR / "office_construction.png",
        "Create a high-quality visual novel background, 16:9. "
        "Interior of a Korean district office construction department, dusty desk for "
        "a new employee, old monitors, stacks of civil engineering documents, ringing "
        "office phones, fluorescent lights, realistic bureaucratic atmosphere, "
        "semi-realistic anime style, no text, no watermark, no logo.",
    ),
    (
        BG_DIR / "winter_road.png",
        "Create a high-quality visual novel background, 16:9. "
        "A winter roadside scene in a Korean city during municipal snow response, icy "
        "asphalt, snow residue, road maintenance atmosphere, cold dawn light, "
        "semi-realistic anime style, no text, no watermark, no logo.",
    ),
    (
        BG_DIR / "spring_street.png",
        "Create a high-quality visual novel background, 16:9. "
        "A spring urban street in South Korea near a small construction site, "
        "temporary barriers, pedestrians, complaint-prone roadside conditions, mild "
        "sunlight, grounded office drama mood, semi-realistic anime style, no text, "
        "no watermark, no logo.",
    ),
    (
        BG_DIR / "office_evening.png",
        "Create a high-quality visual novel background, 16:9. "
        "Interior of a Korean district office construction department in the evening, "
        "dim office lights, half-empty desks, documents left behind, emotional but "
        "tired atmosphere after a long year, semi-realistic anime style, no text, "
        "no watermark, no logo.",
    ),
]


CHARACTERS = [
    (
        CHAR_DIR / "protagonist_default.png",
        "Create a Korean visual novel character sprite, 3/4 body, centered, "
        "large readable face, standing pose, on a pure bright green chroma key background "
        "(solid #00ff00 only, no patterns, no shadows on background). "
        "Young Korean male civil servant, newly appointed, modest office wear, "
        "slightly nervous but sincere expression, semi-realistic anime style, "
        "no text, no watermark.",
    ),
    (
        CHAR_DIR / "manager_default.png",
        "Create a Korean visual novel character sprite, 3/4 body, centered, "
        "large readable face, standing pose, on a pure bright green chroma key background "
        "(solid #00ff00 only, no patterns, no shadows on background). "
        "Korean public office department manager, late 40s to 50s, calm and slightly "
        "distant expression, formal office attire, experienced civil servant aura, "
        "semi-realistic anime style, no text, no watermark.",
    ),
    (
        CHAR_DIR / "chief_default.png",
        "Create a Korean visual novel character sprite, 3/4 body, centered, "
        "large readable face, standing pose, on a pure bright green chroma key background "
        "(solid #00ff00 only, no patterns, no shadows on background). "
        "Korean district office team leader, practical and brisk personality, neat "
        "business look, tired but competent expression, semi-realistic anime style, "
        "no text, no watermark.",
    ),
    (
        CHAR_DIR / "deputy_default.png",
        "Create a Korean visual novel character sprite, 3/4 body, centered, "
        "large readable face, standing pose, on a pure bright green chroma key background "
        "(solid #00ff00 only, no patterns, no shadows on background). "
        "Korean deputy-level civil servant, reliable practical worker, realistic and "
        "helpful expression, office wear, semi-realistic anime style, no text, no watermark.",
    ),
    (
        CHAR_DIR / "junior_one_default.png",
        "Create a Korean visual novel character sprite, 3/4 body, centered, "
        "large readable face, standing pose, on a pure bright green chroma key background "
        "(solid #00ff00 only, no patterns, no shadows on background). "
        "Korean junior civil servant, slightly worn-out but humorous expression, "
        "practical office outfit, semi-realistic anime style, no text, no watermark.",
    ),
    (
        CHAR_DIR / "junior_two_default.png",
        "Create a Korean visual novel character sprite, 3/4 body, centered, "
        "large readable face, standing pose, on a pure bright green chroma key background "
        "(solid #00ff00 only, no patterns, no shadows on background). "
        "Korean youngest office staff member, nervous and lively, simple office wear, "
        "semi-realistic anime style, no text, no watermark.",
    ),
    (
        CHAR_DIR / "buddy_default.png",
        "Create a Korean visual novel character sprite, 3/4 body, centered, "
        "large readable face, standing pose, on a pure bright green chroma key background "
        "(solid #00ff00 only, no patterns, no shadows on background). "
        "Young Korean civil servant colleague from the same recruitment class, hopeful "
        "but slightly anxious, formal office attire, semi-realistic anime style, "
        "no text, no watermark.",
    ),
]


def call_api(prompt: str) -> bytes:
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY is required.")

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    candidates = data.get("candidates", [])
    for candidate in candidates:
        parts = candidate.get("content", {}).get("parts", [])
        for part in parts:
            inline_data = part.get("inlineData")
            if inline_data and inline_data.get("data"):
                return base64.b64decode(inline_data["data"])

    raise RuntimeError(f"No image data returned: {json.dumps(data)[:600]}")


def generate_all(items):
    for out_path, prompt in items:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        if out_path.exists() and out_path.stat().st_size > 0:
            print(f"Skipping existing {out_path.name}", flush=True)
            continue
        print(f"Generating {out_path.name} ...", flush=True)
        last_error = None
        for attempt in range(3):
            try:
                image_bytes = call_api(prompt)
                break
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", "ignore")
                last_error = RuntimeError(f"HTTP {exc.code} for {out_path.name}: {detail}")
            except Exception as exc:  # pragma: no cover - transient network issues
                last_error = exc
            time.sleep(3)
        else:
            raise RuntimeError(f"Failed to generate {out_path.name}: {last_error}") from last_error
        out_path.write_bytes(image_bytes)
        print(f"Saved {out_path}", flush=True)
        time.sleep(2)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"

    if mode == "backgrounds":
        generate_all(BACKGROUNDS)
    elif mode == "characters":
        generate_all(CHARACTERS)
    elif mode == "all":
        generate_all(BACKGROUNDS)
        generate_all(CHARACTERS)
    else:
        raise SystemExit("Usage: python generate_gemini_images.py [backgrounds|characters|all]")


if __name__ == "__main__":
    main()
