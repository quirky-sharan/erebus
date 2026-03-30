"""
Firebase JWT authentication middleware for FastAPI.
Supports production mode (Firebase Admin SDK) and development mode (bypass for local testing).
"""
import os
from fastapi import Request, HTTPException
from dotenv import load_dotenv

load_dotenv()

# Check if we should use dev mode. Defaults to True if no service account is found for easier local development.
_dev_env = os.getenv("DEV_MODE", "").lower()
if _dev_env:
    DEV_MODE = _dev_env in ("true", "1", "yes")
else:
    # Fail-safe: if no credentials and no explicit DEV_MODE=false, enable it.
    DEV_MODE = not os.getenv("FIREBASE_SERVICE_ACCOUNT")

_firebase_initialized = False

def init_firebase():
    """Initialize Firebase Admin SDK. Only called once."""
    global _firebase_initialized
    if _firebase_initialized:
        return
    
    if DEV_MODE:
        print("[AUTH] Running in DEV_MODE — Firebase JWT verification is BYPASSED")
        _firebase_initialized = True
        return
    
    try:
        import firebase_admin
        from firebase_admin import credentials
        import base64
        import json
        
        if not firebase_admin._apps:
            service_account_b64 = os.getenv("FIREBASE_SERVICE_ACCOUNT")
            if service_account_b64:
                service_account_json = base64.b64decode(service_account_b64).decode('utf-8')
                cred_dict = json.loads(service_account_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                print("[AUTH] Firebase Admin initialized with service account")
            else:
                print("[AUTH] Warning: FIREBASE_SERVICE_ACCOUNT not set. Trying default credentials...")
                try:
                    firebase_admin.initialize_app()
                    print("[AUTH] Firebase Admin initialized with default credentials")
                except ValueError:
                    print("[AUTH] Warning: Could not initialize Firebase Admin. Auth will fail.")
                    print("[AUTH] Set DEV_MODE=true in .env for local development without Firebase.")
        
        _firebase_initialized = True
    except ImportError:
        print("[AUTH] firebase-admin not installed. Set DEV_MODE=true for local development.")
        _firebase_initialized = True


# Initialize on import
init_firebase()


async def verify_token(request: Request):
    """
    Verify Firebase JWT token from Authorization header.
    In DEV_MODE, returns a mock user object for testing.
    """
    if DEV_MODE:
        # Return mock user for development
        return {
            "uid": "dev-user-001",
            "name": "Dev User",
            "email": "dev@orbitlex.local",
        }
    
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    
    try:
        from firebase_admin import auth
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"[AUTH] Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
