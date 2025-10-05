import os
import csv
import json
import base64
from dotenv import load_dotenv
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Load environment variables
load_dotenv()

# Gmail API scope (read-only access)
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

def get_client_config():
    """Build client configuration from environment variables."""
    return {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "project_id": os.getenv("GOOGLE_PROJECT_ID"),
            "auth_uri": os.getenv("GOOGLE_AUTH_URI"),
            "token_uri": os.getenv("GOOGLE_TOKEN_URI"),
            "auth_provider_x509_cert_url": os.getenv("GOOGLE_AUTH_PROVIDER_X509_CERT_URL"),
            "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URIS")]
        }
    }

def create_credentials_file():
    """Create temporary credentials file from environment variables."""
    client_config = get_client_config()
    with open("temp_credentials.json", "w") as f:
        json.dump(client_config, f)
    return "temp_credentials.json"

def gmail_authenticate():
    """Authenticate and return Gmail API service."""
    creds = None
    if os.path.exists("token.json"):
        try:
            creds = Credentials.from_authorized_user_file("token.json", SCOPES)
        except ValueError as e:
            print(f"⚠️ Token file is corrupted: {e}")
            print("🔄 Removing corrupted token file...")
            os.remove("token.json")
            creds = None
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"⚠️ Failed to refresh token: {e}")
                print("🔄 Starting new authentication flow...")
                creds = None
        
        if not creds:
            # Create temporary credentials file from environment variables
            credentials_file = create_credentials_file()
            try:
                flow = InstalledAppFlow.from_client_secrets_file(credentials_file, SCOPES)
                creds = flow.run_local_server(port=3000, access_type='offline')
            finally:
                # Clean up temporary file
                if os.path.exists(credentials_file):
                    os.remove(credentials_file)
        
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    
    return build("gmail", "v1", credentials=creds)

def search_messages(service, query):
    """Search messages matching the query."""
    results = service.users().messages().list(
        userId='me',
        labelIds=['INBOX'],
        includeSpamTrash=False,
        maxResults=10           
    ).execute()

    messages = results.get("messages", [])
    return messages

def get_message_details(service, msg_id):
    """Get details of a specific message (with payload)."""
    msg = service.users().messages().get(userId="me", id=msg_id, format="full").execute()
    headers = msg["payload"]["headers"]
    details = {h["name"]: h["value"] for h in headers}
    snippet = msg.get("snippet", "")
    payload = msg.get("payload", {})
    return {
        "Subject": details.get("Subject", ""),
        "From": details.get("From", ""),
        "Date": details.get("Date", ""),
        "Snippet": snippet,
        "Payload": payload
    }
def save_eml(service, msg_id, save_dir="emails_raw"):
    """Download the full raw email (.eml) and save it locally."""
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    # Get the full raw content
    msg = service.users().messages().get(userId="me", id=msg_id, format="raw").execute()
    raw_data = msg["raw"]

    # Decode the base64url-encoded message
    eml_data = base64.urlsafe_b64decode(raw_data.encode("UTF-8"))

    # Build filename (use message id for uniqueness)
    filename = os.path.join(save_dir, f"{msg_id}.eml")

    with open(filename, "wb") as f:
        f.write(eml_data)

    print(f"📩 Saved full email: {filename}")
    return filename  # Return the filename


def get_profile_email(service):
    profile = service.users().getProfile(userId="me").execute()
    return profile.get("emailAddress")

def main():
    service = gmail_authenticate()
    email = get_profile_email(service)
    print(f"✅ Authenticated as: {email}")

    # Broader query to catch more receipt-related emails
    query = 'subject:(receipt OR order OR invoice OR purchase)'
    print(f" Searching with query: {query}")
    messages = search_messages(service, query)
    
    print(f" Found {len(messages)} emails matching the query")
    
    if not messages:
        print("No messages found.")
        return

    os.makedirs("emails_raw", exist_ok=True)

    summary = []
    processed_count = 0

    for msg in messages:
        msg_id = msg["id"]
        try:
            eml_path = save_eml(service, msg_id)
            print(f"✅ Processed {msg_id} → {eml_path}")
            processed_count += 1
            
            summary.append({
                "id": msg_id,
                "eml_file": eml_path,
                "status": "saved"
            })
        except Exception as e:
            print(f"⚠️ Error processing {msg_id}: {e}")
            summary.append({
                "id": msg_id,
                "eml_file": "",
                "status": "error"
            })

    with open("emails_summary.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "eml_file", "status"])
        writer.writeheader()
        writer.writerows(summary)
    
    print(f"📦 Successfully processed: {processed_count}")
    print(f"📁 Total emails: {len(messages)}")
    print("📦 emails_summary.csv saved")

if __name__ == "__main__":
    main()
