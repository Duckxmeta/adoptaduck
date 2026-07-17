import urllib.request
import json
import datetime

project_id = "studio-7482167027-804c1"
base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"

legacy_donations = [
    # Fiat (USD)
    {"amount": 100.00, "designation": "Legacy Support"},
    {"amount": 75.00, "designation": "Legacy Support"},
    {"amount": 50.00, "designation": "Legacy Support"},
    {"amount": 40.00, "designation": "Legacy Support"},
    {"amount": 1.00, "designation": "Legacy Support"},
    # Solana (converted at $76/SOL)
    {"amount": 38.00, "designation": "Legacy SOL Support"}, # 0.5 SOL
    {"amount": 38.00, "designation": "Legacy SOL Support"}, # 0.5 SOL
    {"amount": 3.80, "designation": "Legacy SOL Support"}   # 0.05 SOL
]

def post_document(collection_id, fields):
    url = f"{base_url}/{collection_id}"
    data = json.dumps({"fields": fields}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"Error posting to {collection_id}: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        raise e

def patch_totals(total_count, total_usd):
    url = f"{base_url}/transparency/totals?updateMask.fieldPaths=total_donations_count&updateMask.fieldPaths=total_usd_value_received"
    fields = {
        "total_donations_count": {"integerValue": str(total_count)},
        "total_usd_value_received": {"doubleValue": total_usd}
    }
    data = json.dumps({"fields": fields}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="PATCH")
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"Error patching totals: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        raise e

def main():
    print("Starting database seeding via Firestore REST API...")
    total_usd = 0.0
    now_str = datetime.datetime.utcnow().isoformat() + "Z"
    
    for donation in legacy_donations:
        amount = donation["amount"]
        designation = donation["designation"]
        
        fields = {
            "amount": {"doubleValue": amount},
            "designation": {"stringValue": designation},
            "allocation": {"stringValue": "General Operations"},
            "isAnonymous": {"booleanValue": True},
            "status": {"stringValue": "completed"},
            "timestamp": {"stringValue": now_str},
            "donorDisplayName": {"stringValue": "Anonymous"},
            "uid": {"nullValue": None},
            "metadata": {"stringValue": "Legacy REST Backpopulation"}
        }
        
        res = post_document("donations", fields)
        name = res.get("name", "").split("/")[-1]
        print(f"Seeded donation document ID: {name} for ${amount:.2f}")
        total_usd += amount
        
    print(f"Updating transparency aggregates totals... count={len(legacy_donations)}, USD={total_usd:.2f}")
    patch_totals(len(legacy_donations), total_usd)
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    main()
