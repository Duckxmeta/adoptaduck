import urllib.request
import json

project_id = "studio-7482167027-804c1"
base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"

def cleanup_duplicates():
    print("Fetching documents from subscriber_posts collection for deduplication...")
    url = f"{base_url}/subscriber_posts"
    req = urllib.request.Request(url)
    
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode("utf-8"))
            documents = res.get("documents", [])
            print(f"Total documents retrieved: {len(documents)}")
            
            seen_texts = {}
            duplicates_to_delete = []

            for doc in documents:
                doc_name = doc.get("name", "")
                doc_id = doc_name.split("/")[-1]
                fields = doc.get("fields", {})
                content_text = fields.get("content_text", {}).get("stringValue", "").strip()

                if not content_text:
                    continue

                if content_text in seen_texts:
                    duplicates_to_delete.append((doc_id, content_text))
                else:
                    seen_texts[content_text] = doc_id

            print(f"Unique posts identified: {len(seen_texts)}")
            print(f"Duplicate documents found: {len(duplicates_to_delete)}")

            for doc_id, text in duplicates_to_delete:
                del_url = f"{base_url}/subscriber_posts/{doc_id}"
                del_req = urllib.request.Request(del_url, method="DELETE")
                try:
                    with urllib.request.urlopen(del_req) as del_res:
                        print(f"Deleted duplicate document ID: {doc_id}")
                except Exception as del_e:
                    print(f"Note: Could not delete {doc_id} directly via unauthenticated REST: {del_e}")

    except Exception as e:
        print(f"Error checking subscriber_posts collection: {e}")

if __name__ == "__main__":
    cleanup_duplicates()
