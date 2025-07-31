#!/usr/bin/env python3
"""
Local Hugging Face Model Server for Quiz Generation
Serves the Solidity-LLM model locally for quiz question generation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import json
import logging
import os
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables for model and tokenizer
model = None
tokenizer = None

def load_model():
    """Load the Hugging Face model and tokenizer"""
    global model, tokenizer
    
    try:
        logger.info("🔄 Loading Solidity-LLM model...")
        
        # Load model directly
        model_name = "Chain-GPT/Solidity-LLM"
        
        logger.info(f"📥 Downloading tokenizer for {model_name}...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        logger.info(f"📥 Downloading model for {model_name}...")
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,  # Use half precision to save memory
            device_map="auto",  # Automatically handle device placement
            trust_remote_code=True
        )
        
        # Set pad token if not present
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
            
        logger.info("✅ Model loaded successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
        return False

def generate_questions_with_model(prompt: str, max_length: int = 2000, temperature: float = 0.7) -> str:
    """Generate questions using the loaded model"""
    try:
        logger.info("🤖 Generating questions with local model...")
        
        # Tokenize the prompt
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
        
        # Move to same device as model
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate response
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=max_length,
                temperature=temperature,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
                eos_token_id=tokenizer.eos_token_id,
                num_return_sequences=1
            )
        
        # Decode the generated text
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the generated part (remove the prompt)
        response = generated_text[len(prompt):].strip()
        
        logger.info("✅ Questions generated successfully!")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error generating questions: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "model_name": "Chain-GPT/Solidity-LLM"
    })

@app.route('/generate', methods=['POST'])
def generate():
    """Generate quiz questions endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({"error": "Missing prompt in request"}), 400
        
        prompt = data['prompt']
        max_length = data.get('max_length', 2000)
        temperature = data.get('temperature', 0.7)
        
        logger.info(f"📝 Received generation request for prompt: {prompt[:100]}...")
        
        if model is None or tokenizer is None:
            return jsonify({"error": "Model not loaded"}), 503
        
        # Generate questions
        generated_text = generate_questions_with_model(prompt, max_length, temperature)
        
        return jsonify({
            "generated_text": generated_text,
            "model_used": "Chain-GPT/Solidity-LLM",
            "status": "success"
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available models endpoint"""
    return jsonify({
        "models": [
            {
                "name": "Chain-GPT/Solidity-LLM",
                "type": "causal_lm",
                "loaded": model is not None
            }
        ]
    })

@app.route('/reload', methods=['POST'])
def reload_model():
    """Reload the model endpoint"""
    try:
        logger.info("🔄 Reloading model...")
        success = load_model()
        
        if success:
            return jsonify({"status": "success", "message": "Model reloaded successfully"})
        else:
            return jsonify({"status": "error", "message": "Failed to reload model"}), 500
            
    except Exception as e:
        logger.error(f"❌ Error reloading model: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Load model on startup
    logger.info("🚀 Starting Local Hugging Face Model Server...")
    
    # Load the model
    if load_model():
        logger.info("✅ Server ready! Model loaded successfully.")
    else:
        logger.warning("⚠️ Server starting without model. Use /reload endpoint to load model.")
    
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 8000))
    
    logger.info(f"🌐 Server starting on port {port}")
    logger.info("📋 Available endpoints:")
    logger.info("  - GET  /health    - Health check")
    logger.info("  - POST /generate  - Generate quiz questions")
    logger.info("  - GET  /models    - List available models")
    logger.info("  - POST /reload    - Reload model")
    
    app.run(host='0.0.0.0', port=port, debug=False) 