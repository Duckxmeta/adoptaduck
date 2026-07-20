import urllib.request
import json

api_url = "http://localhost:3000/api/content/sync"
prod_api_url = "https://adoptaduck.org/api/content/sync"
auth_token = "adopt-a-duck-sync-token-2026"

def test_sync_api(content_text, platform="X", media_urls=None):
    if media_urls is None:
        media_urls = []

    payload = {
        "content_text": content_text,
        "platform": platform,
        "media_urls": media_urls
    }

    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    }

    for target_url in [prod_api_url, api_url]:
        try:
            print(f"Attempting content sync to {target_url}...")
            req = urllib.request.Request(target_url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode("utf-8"))
                print(f"[X Sync API] Successfully synced post!")
                print(f"Response: {json.dumps(res, indent=2)}")
                return res
        except Exception as e:
            print(f"[X Sync API] Target {target_url} returned: {e}")
            if hasattr(e, 'read'):
                print(e.read().decode('utf-8'))

if __name__ == "__main__":
    sample_payload = {
        "content_text": "🦆 Exclusive Sanctuary Update (#Adoptaduck): Our duck flock just enjoyed a fresh delivery of watermelons and warm evening pond swims! Thank you Guardians for supporting sanctuary operations.",
        "platform": "X"
    }
    test_sync_api(sample_payload["content_text"], sample_payload["platform"])
