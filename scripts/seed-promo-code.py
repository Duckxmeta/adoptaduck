import urllib.request
import json
import datetime

project_id = "studio-7482167027-804c1"
base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"

def seed_promo_code():
    code_id = "DUCKSONXSUBS"
    url = f"{base_url}/promo_codes/{code_id}"
    
    payload = {
        "fields": {
            "code": {"stringValue": "DucksonxSUBS"},
            "targetRole": {"stringValue": "guardian"},
            "durationDays": {"integerValue": "365"},
            "isActive": {"booleanValue": True},
            "usageCount": {"integerValue": "0"},
            "type": {"stringValue": "bypass_upgrade"},
            "createdAt": {"stringValue": datetime.datetime.utcnow().isoformat() + "Z"}
        }
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="PATCH")

    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode("utf-8"))
            print(f"✅ Successfully created/updated promo_codes/{code_id} document in Firestore!")
            print(json.dumps(res, indent=2))
    except Exception as e:
        print(f"❌ Error seeding promo code: {e}")

if __name__ == "__main__":
    seed_promo_code()
