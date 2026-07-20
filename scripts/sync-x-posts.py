import urllib.request
import json
import datetime

project_id = "studio-7482167027-804c1"
base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"

def test_sync_execution(content_text, platform="X", media_urls=None):
    if not content_text:
        raise ValueError("Missing content_text parameter")
        
    if media_urls is None:
        media_urls = []

    now_str = datetime.datetime.utcnow().isoformat() + "Z"
    
    media_list_value = [{"stringValue": url} for url in media_urls]

    fields = {
        "content_text": {"stringValue": content_text},
        "source_platform": {"stringValue": platform},
        "media_urls": {"arrayValue": {"values": media_list_value}},
        "timestamp": {"stringValue": now_str}
    }
    
    url = f"{base_url}/subscriber_posts"
    data = json.dumps({"fields": fields}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode("utf-8"))
            doc_id = res.get("name", "").split("/")[-1]
            print(f"[X Sync Pipeline] Post successfully synced! Doc ID: {doc_id}")
            return doc_id
    except Exception as e:
        print(f"[X Sync Pipeline] Error syncing post: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        raise e

if __name__ == "__main__":
    sample_payload = {
        "content_text": "🦆 Exclusive Sanctuary Update: Our duck flock just enjoyed a fresh delivery of watermelons and warm evening pond swims! Thank you Guardians for supporting sanctuary operations.",
        "platform": "X"
    }
    test_sync_execution(sample_payload["content_text"], sample_payload["platform"])
