import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app as fastapi_app
from fastapi.middleware.cors import CORSMiddleware

# Add CORS middleware for Vercel
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For Vercel Python runtime
app = fastapi_app 