#!/usr/bin/env python3
"""
Simplified server startup script to avoid file watching issues
"""

import uvicorn
import os
import sys

def main():
    """Start the FastAPI server without file watching"""
    print("🚀 Starting FastAPI Server...")
    print("📝 Server will run without auto-reload to avoid conflicts")
    print("📍 Server will be available at: http://127.0.0.1:8001")
    print("📋 API Documentation at: http://127.0.0.1:8001/docs")
    print("🛑 Press Ctrl+C to stop the server")
    print()
    
    # Start server without reload to avoid file watching issues
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8001,
        reload=False,  # Disable auto-reload to avoid conflicts
        log_level="info"
    )

if __name__ == "__main__":
    main() 