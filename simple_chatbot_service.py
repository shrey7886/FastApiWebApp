#!/usr/bin/env python3
"""
Simplified Chatbot Service for Quiz Application
Provides intelligent responses based on question context and knowledge base
"""

import json
import uuid
import re
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

class SimpleChatbotService:
    def __init__(self, db_session, tenant_id: str = "default"):
        self.db_session = db_session
        self.tenant_id = tenant_id
        self.embeddings = SentenceTransformer('all-MiniLM-L6-v2')
        self.vector_store = None
        self.knowledge_base = []
        self.session_id = str(uuid.uuid4())
        
        # Initialize ChromaDB with new configuration
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        
    def initialize_knowledge_base(self):
        """Initialize the knowledge base with quiz questions and explanations"""
        print("🧠 Initializing simplified knowledge base...")
        
        # Get all questions and their explanations from the database
        from models import Question, Quiz, Topic
        
        questions = self.db_session.query(Question).join(Quiz).join(Topic).filter(
            Topic.tenant_id == self.tenant_id
        ).all()
        
        documents = []
        metadatas = []
        ids = []
        
        for i, question in enumerate(questions):
            # Create comprehensive document for each question
            doc_text = f"""
            Question: {question.question_text}
            Correct Answer: {question.correct_answer}
            Options: A) {question.option_a}, B) {question.option_b}, C) {question.option_c}, D) {question.option_d}
            Explanation: {question.explanation or 'No explanation provided'}
            Difficulty: {question.difficulty_level}
            Category: {question.category or 'General'}
            """
            
            documents.append(doc_text)
            metadatas.append({
                'question_id': question.id,
                'quiz_id': question.quiz_id,
                'difficulty': question.difficulty_level,
                'category': question.category,
                'type': 'question'
            })
            ids.append(f"question_{question.id}")
        
        # Add general knowledge documents
        general_docs = self._get_general_knowledge_docs()
        documents.extend(general_docs['texts'])
        metadatas.extend(general_docs['metadatas'])
        ids.extend(general_docs['ids'])
        
        # Create vector store
        if documents:
            collection_name = f"quiz_knowledge_{self.tenant_id}"
            
            # Create or get collection
            try:
                self.collection = self.chroma_client.get_collection(collection_name)
                print(f"✅ Using existing collection: {collection_name}")
            except:
                self.collection = self.chroma_client.create_collection(
                    name=collection_name,
                    metadata={"description": f"Knowledge base for {self.tenant_id}"}
                )
                print(f"✅ Created new collection: {collection_name}")
            
            # Add documents to collection
            if documents:
                self.collection.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                print(f"✅ Knowledge base initialized with {len(documents)} documents")
        else:
            print("⚠️  No documents found for knowledge base")
    
    def _get_general_knowledge_docs(self) -> Dict[str, List]:
        """Get general knowledge documents for the chatbot"""
        general_docs = [
            {
                "text": """
                Quiz Taking Tips:
                1. Read each question carefully before answering
                2. Eliminate obviously wrong answers first
                3. Use the process of elimination
                4. Don't spend too much time on any single question
                5. Review your answers if time permits
                """,
                "metadata": {'type': 'tips', 'category': 'study_tips'},
                "id": "tips_1"
            },
            {
                "text": """
                How to Improve Your Quiz Performance:
                1. Practice regularly with different topics
                2. Review your mistakes and understand why you got them wrong
                3. Focus on your weakest areas
                4. Use the analytics to track your progress
                5. Take breaks between study sessions
                """,
                "metadata": {'type': 'improvement', 'category': 'study_tips'},
                "id": "tips_2"
            },
            {
                "text": """
                Understanding Quiz Results:
                - 90-100%: Excellent performance
                - 80-89%: Good performance
                - 70-79%: Average performance
                - 60-69%: Below average
                - Below 60%: Needs improvement
                """,
                "metadata": {'type': 'results', 'category': 'interpretation'},
                "id": "results_1"
            }
        ]
        
        return {
            "texts": [doc["text"] for doc in general_docs],
            "metadatas": [doc["metadata"] for doc in general_docs],
            "ids": [doc["id"] for doc in general_docs]
        }
    
    def get_response(self, user_message: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Get chatbot response based on user message and context"""
        try:
            start_time = datetime.now()
            
            # Classify intent
            intent = self._classify_intent(user_message)
            
            # Get relevant documents
            docs = self._get_relevant_documents(user_message, intent)
            
            # Generate response
            response = self._generate_response(user_message, intent, docs, context)
            
            # Calculate response time
            response_time = (datetime.now() - start_time).total_seconds()
            
            # Store interaction
            self._store_interaction(user_message, response.get('answer', ''), context, intent, response_time)
            
            return response
            
        except Exception as e:
            print(f"❌ Chatbot error: {e}")
            return self._get_fallback_response(user_message)
    
    def _classify_intent(self, message: str) -> str:
        """Classify user intent from message"""
        message_lower = message.lower()
        
        # Intent classification patterns
        if any(word in message_lower for word in ['explain', 'what is', 'how does', 'why', 'meaning']):
            return 'question_explanation'
        elif any(word in message_lower for word in ['tip', 'advice', 'help', 'improve', 'better']):
            return 'study_tips'
        elif any(word in message_lower for word in ['score', 'result', 'performance', 'grade', 'percentage']):
            return 'results_interpretation'
        elif any(word in message_lower for word in ['how to', 'use', 'platform', 'app', 'system']):
            return 'general_help'
        else:
            return 'general_help'
    
    def _get_relevant_documents(self, query: str, intent: str, limit: int = 3) -> List[Dict]:
        """Get relevant documents from knowledge base"""
        try:
            if not hasattr(self, 'collection'):
                return []
            
            # Query the collection
            results = self.collection.query(
                query_texts=[query],
                n_results=limit
            )
            
            documents = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    documents.append({
                        'content': doc,
                        'metadata': results['metadatas'][0][i] if results['metadatas'] and results['metadatas'][0] else {},
                        'distance': results['distances'][0][i] if results['distances'] and results['distances'][0] else 0
                    })
            
            return documents
            
        except Exception as e:
            print(f"❌ Document retrieval error: {e}")
            return []
    
    def _generate_response(self, query: str, intent: str, docs: List[Dict], context: Optional[Dict]) -> Dict[str, Any]:
        """Generate response based on intent and documents"""
        if intent == 'question_explanation':
            return self._generate_question_explanation(query, docs, context)
        elif intent == 'study_tips':
            return self._generate_study_tips(query, docs)
        elif intent == 'results_interpretation':
            return self._generate_results_interpretation(query, docs, context)
        else:
            return self._generate_general_response(query, docs)
    
    def _generate_question_explanation(self, query: str, docs: List[Dict], context: Optional[Dict]) -> Dict[str, Any]:
        """Generate explanation for a question"""
        if not docs:
            return {
                'answer': 'I don\'t have enough information to explain that question. Please try asking about a specific topic or question.',
                'confidence': 0.3,
                'intent': 'question_explanation',
                'sources': []
            }
        
        # Use the most relevant document
        best_doc = docs[0]
        confidence = 1.0 - best_doc.get('distance', 0)
        
        answer = f"Based on the available information: {best_doc['content'][:200]}..."
        
        return {
            'answer': answer,
            'confidence': confidence,
            'intent': 'question_explanation',
            'sources': [best_doc['metadata']]
        }
    
    def _generate_study_tips(self, query: str, docs: List[Dict]) -> Dict[str, Any]:
        """Generate study tips"""
        tips = [
            "Practice regularly with different topics to build a strong foundation.",
            "Review your mistakes and understand why you got them wrong.",
            "Focus on your weakest areas identified in the analytics.",
            "Take breaks between study sessions to maintain focus.",
            "Use the quiz history to track your progress over time."
        ]
        
        answer = "Here are some study tips to improve your performance:\n\n" + "\n".join(f"• {tip}" for tip in tips[:3])
        
        return {
            'answer': answer,
            'confidence': 0.9,
            'intent': 'study_tips',
            'sources': []
        }
    
    def _generate_results_interpretation(self, query: str, docs: List[Dict], context: Optional[Dict]) -> Dict[str, Any]:
        """Generate results interpretation"""
        answer = """
        Here's how to interpret your quiz results:
        
        • 90-100%: Excellent performance - Keep up the great work!
        • 80-89%: Good performance - You're on the right track
        • 70-79%: Average performance - Focus on weak areas
        • 60-69%: Below average - Need more practice
        • Below 60%: Needs improvement - Review fundamentals
        
        Use the analytics dashboard to identify specific areas for improvement.
        """
        
        return {
            'answer': answer,
            'confidence': 0.9,
            'intent': 'results_interpretation',
            'sources': []
        }
    
    def _generate_general_response(self, query: str, docs: List[Dict]) -> Dict[str, Any]:
        """Generate general help response"""
        answer = """
        Welcome to the Quiz Platform! Here's how to use it effectively:
        
        • Create quizzes on any topic you want to study
        • Take quizzes with timers to simulate real exam conditions
        • Review your results and analytics to track progress
        • Use the history feature to see your past performance
        • Ask me questions about topics or for study tips!
        
        How can I help you today?
        """
        
        return {
            'answer': answer,
            'confidence': 0.8,
            'intent': 'general_help',
            'sources': []
        }
    
    def _get_fallback_response(self, message: str) -> Dict[str, Any]:
        """Get fallback response when other methods fail"""
        return {
            'answer': 'I\'m having trouble processing your request right now. Please try asking about quiz topics, study tips, or how to use the platform.',
            'confidence': 0.5,
            'intent': 'fallback',
            'sources': []
        }
    
    def _store_interaction(self, user_message: str, bot_response: str, context: Optional[Dict], 
                          intent: str, response_time: float):
        """Store chatbot interaction for analytics"""
        try:
            # Store in database if you have a table for it
            # For now, just log it
            print(f"💬 Chatbot interaction: {intent} - {response_time:.2f}s")
        except Exception as e:
            print(f"❌ Failed to store interaction: {e}")
    
    def get_chat_history(self, user_id: int, limit: int = 10) -> List[Dict]:
        """Get chatbot conversation history"""
        # This would query a database table for chat history
        # For now, return empty list
        return []
    
    def update_satisfaction(self, interaction_id: int, satisfaction: int, was_helpful: bool):
        """Update user satisfaction with chatbot response"""
        # This would update a database record
        print(f"👍 Satisfaction update: {satisfaction}/5, helpful: {was_helpful}") 