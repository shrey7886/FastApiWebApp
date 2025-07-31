#!/usr/bin/env python3
"""
Setup script for Llama3 integration with Ollama
"""

import os
import sys
import subprocess
import requests
import time
from dotenv import load_dotenv

def check_ollama_installed():
    """Check if Ollama is installed"""
    try:
        result = subprocess.run(['ollama', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Ollama is installed: {result.stdout.strip()}")
            return True
        else:
            print("❌ Ollama is not properly installed")
            return False
    except FileNotFoundError:
        print("❌ Ollama is not installed")
        return False

def install_ollama():
    """Install Ollama"""
    print("📦 Installing Ollama...")
    
    system = sys.platform
    if system == "win32":
        print("🪟 Windows detected")
        print("Please download and install Ollama from: https://ollama.ai/download")
        print("After installation, restart your terminal and run this script again.")
        return False
    elif system == "darwin":
        print("🍎 macOS detected")
        try:
            subprocess.run(['curl', '-fsSL', 'https://ollama.ai/install.sh', '|', 'sh'], shell=True, check=True)
            print("✅ Ollama installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install Ollama")
            return False
    else:
        print("🐧 Linux detected")
        try:
            subprocess.run(['curl', '-fsSL', 'https://ollama.ai/install.sh', '|', 'sh'], shell=True, check=True)
            print("✅ Ollama installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install Ollama")
            return False

def start_ollama_service():
    """Start Ollama service"""
    print("🚀 Starting Ollama service...")
    
    try:
        # Check if Ollama is already running
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama service is already running")
            return True
    except requests.exceptions.RequestException:
        pass
    
    try:
        # Start Ollama in background
        subprocess.Popen(['ollama', 'serve'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("⏳ Starting Ollama service...")
        
        # Wait for service to start
        for i in range(30):
            try:
                response = requests.get("http://localhost:11434/api/tags", timeout=5)
                if response.status_code == 200:
                    print("✅ Ollama service started successfully")
                    return True
            except requests.exceptions.RequestException:
                pass
            time.sleep(1)
        
        print("❌ Ollama service failed to start")
        return False
        
    except Exception as e:
        print(f"❌ Failed to start Ollama service: {e}")
        return False

def download_llama3_model():
    """Download Llama3 model"""
    print("📥 Downloading Llama3 model...")
    
    try:
        # Pull the model
        result = subprocess.run(['ollama', 'pull', 'llama3.2:3b'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Llama3 model downloaded successfully")
            return True
        else:
            print(f"❌ Failed to download model: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error downloading model: {e}")
        return False

def test_llama3_connection():
    """Test Llama3 connection"""
    print("🔍 Testing Llama3 connection...")
    
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2:3b",
                "prompt": "Hello, how are you?",
                "stream": False
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("response"):
                print("✅ Llama3 connection successful!")
                return True
            else:
                print("❌ Llama3 returned empty response")
                return False
        else:
            print(f"❌ Llama3 API error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Llama3 connection failed: {e}")
        return False

def create_env_file():
    """Create or update .env file with Llama3 configuration"""
    print("📝 Creating .env file with Llama3 configuration...")
    
    env_content = """# Llama3 Configuration
LLAMA3_API_URL=http://localhost:11434/api/generate
LLAMA3_MODEL=llama3.2:3b
LLAMA3_MAX_TOKENS=2000
LLAMA3_TEMPERATURE=0.7

# OpenAI Configuration (fallback)
OPENAI_API_KEY=your-openai-api-key-here

# Database Configuration
DATABASE_URL=sqlite:///./quiziac.db

# Security
SECRET_KEY=your-secret-key-here
"""
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ .env file created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Llama3 Setup for Quiz App")
    print("=" * 50)
    
    # Step 1: Check if Ollama is installed
    if not check_ollama_installed():
        print("\n📦 Ollama installation required...")
        if not install_ollama():
            print("❌ Setup failed at Ollama installation")
            return
        print("✅ Ollama installed, please restart your terminal and run this script again")
        return
    
    # Step 2: Start Ollama service
    if not start_ollama_service():
        print("❌ Setup failed at starting Ollama service")
        return
    
    # Step 3: Download Llama3 model
    if not download_llama3_model():
        print("❌ Setup failed at downloading Llama3 model")
        return
    
    # Step 4: Test connection
    if not test_llama3_connection():
        print("❌ Setup failed at testing Llama3 connection")
        return
    
    # Step 5: Create .env file
    if not create_env_file():
        print("❌ Setup failed at creating .env file")
        return
    
    print("\n🎉 Llama3 setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Install Python dependencies: pip install -r requirements.txt")
    print("2. Run the test script: python test_llama3.py")
    print("3. Start the FastAPI server: python main.py")
    print("\n🔧 Configuration:")
    print("- Llama3 API: http://localhost:11434")
    print("- Model: llama3.2:3b")
    print("- Environment variables saved in .env file")

if __name__ == "__main__":
    main() 