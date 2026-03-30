import os
from fastapi import Request, HTTPException
import firebase_admin
from firebase_admin import credentials, auth
import base64
import json
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin
def init_firebase():
    if not firebase_admin._apps:
        service_account_b64 = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if service_account_b64:
            service_account_json = base64.b64decode(service_account_b64).decode('utf-8')
            cred_dict = json.loads(service_account_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        else:
            # For development without service account (will fail full validation)
            print("Warning: FIREBASE_SERVICE_ACCOUNT env var not set")
            # You can initialize default app if running in GCP environment
            try:
                firebase_admin.initialize_app()
            except ValueError:
                pass

init_firebase()

async def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = auth_header.split(" ")[1]
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
