import json
import subprocess
import sys
import urllib.error
import urllib.request

REGION = "eu-central-1"
ENDPOINT = f"https://bedrock-runtime.{REGION}.amazonaws.com/model/{{model_id}}/invoke"


def get_api_key() -> str:
    result = subprocess.run(["vw", "get", "AWS_BEDROCK_API_KEY"], capture_output=True, text=True, check=True)
    return result.stdout.strip()


def check_model(model_id: str, api_key: str) -> str:
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 8,
        "messages": [{"role": "user", "content": "ping"}],
    }).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT.format(model_id=model_id),
        data=body,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp.read()
            return "OK"
    except urllib.error.HTTPError as e:
        payload = e.read().decode("utf-8", errors="replace")
        if e.code == 403 or "AccessDenied" in payload:
            return "KEIN ZUGRIFF (Model access in der Bedrock-Console freischalten)"
        if e.code == 404 or "ResourceNotFound" in payload:
            return "MODELL-ID NICHT GEFUNDEN (ID pruefen)"
        return f"FEHLER {e.code}: {payload[:200]}"
    except Exception as e:
        return f"FEHLER: {e}"


def main():
    if len(sys.argv) < 2:
        print("Nutzung: python3 scripts/check_bedrock_access.py <haiku-4.5-model-id> [<fallback-model-id>]")
        sys.exit(1)

    api_key = get_api_key()
    try:
        candidates = sys.argv[1:]
        for model_id in candidates:
            status = check_model(model_id, api_key)
            print(f"{model_id}: {status}")
    finally:
        del api_key


if __name__ == "__main__":
    main()
