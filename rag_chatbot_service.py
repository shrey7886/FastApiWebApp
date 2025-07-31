#!/usr/bin/env python3
"""
RAG-powered Chatbot Service for Quiz Application
Provides intelligent responses based on question context and knowledge base
"""

import json
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
import requests
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain.chains import RetrievalQA
# Removed langchain_openai import - using direct OpenAI library instead
import chromadb
from sentence_transformers import SentenceTransformer
import numpy as np

class RAGChatbotService:
    def __init__(self, db_session, tenant_id: str = "default"):
        self.db_session = db_session
        self.tenant_id = tenant_id
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )
        self.vector_store = None
        self.knowledge_base = []
        self.session_id = str(uuid.uuid4())
        
    def initialize_knowledge_base(self):
        """Initialize the knowledge base with quiz questions and explanations"""
        print("🧠 Initializing RAG knowledge base...")
        
        # Get all questions and their explanations from the database
        from models import Question, Quiz, Topic
        
        questions = self.db_session.query(Question).join(Quiz).join(Topic).filter(
            Topic.tenant_id == self.tenant_id
        ).all()
        
        documents = []
        
        for question in questions:
            # Create comprehensive document for each question
            doc_text = f"""
            Question: {question.question_text}
            Correct Answer: {question.correct_answer}
            Options: A) {question.option_a}, B) {question.option_b}, C) {question.option_c}, D) {question.option_d}
            Explanation: {question.explanation or 'No explanation provided'}
            Difficulty: {question.difficulty_level}
            Category: {question.category or 'General'}
            """
            
            documents.append(Document(
                page_content=doc_text,
                metadata={
                    'question_id': question.id,
                    'quiz_id': question.quiz_id,
                    'difficulty': question.difficulty_level,
                    'category': question.category,
                    'type': 'question'
                }
            ))
        
        # Add general knowledge documents
        general_knowledge = self._get_general_knowledge_docs()
        documents.extend(general_knowledge)
        
        # Create vector store
        if documents:
            self.vector_store = Chroma.from_documents(
                documents=documents,
                embedding=self.embeddings,
                collection_name=f"quiz_knowledge_{self.tenant_id}"
            )
            print(f"✅ Knowledge base initialized with {len(documents)} documents")
        else:
            print("⚠️  No documents found for knowledge base")
    
    def _get_general_knowledge_docs(self) -> List[Document]:
        """Get general knowledge documents for the chatbot"""
        general_docs = [
            Document(
                page_content="""
                Quiz Taking Tips:
                1. Read each question carefully before answering
                2. Eliminate obviously wrong answers first
                3. Use the process of elimination
                4. Don't spend too much time on any single question
                5. Review your answers if time permits
                """,
                metadata={'type': 'tips', 'category': 'study_tips'}
            ),
            Document(
                page_content="""
                How to Improve Your Quiz Performance:
                1. Practice regularly with different topics
                2. Review your mistakes and understand why you got them wrong
                3. Focus on your weak areas
                4. Take timed practice quizzes to improve speed
                5. Use the chatbot to get explanations for difficult questions
                """,
                metadata={'type': 'improvement', 'category': 'study_tips'}
            ),
            Document(
                page_content="""
                Understanding Quiz Results:
                - Your score shows how many questions you answered correctly
                - The percentage indicates your overall performance
                - Review incorrect answers to learn from mistakes
                - Track your progress over time to see improvement
                - Use analytics to identify your strengths and weaknesses
                """,
                metadata={'type': 'results', 'category': 'analytics'}
            )
        ]
        return general_docs
    
    def get_response(self, user_message: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Get intelligent response from the RAG chatbot"""
        start_time = datetime.now()
        
        try:
            # Initialize knowledge base if not already done
            if not self.vector_store:
                self.initialize_knowledge_base()
            
            if not self.vector_store:
                return self._get_fallback_response(user_message)
            
            # Determine intent
            intent = self._classify_intent(user_message)
            
            # Get relevant context
            relevant_docs = self._get_relevant_documents(user_message, intent)
            
            # Generate response based on intent and context
            response = self._generate_response(user_message, intent, relevant_docs, context)
            
            # Calculate response time
            response_time = (datetime.now() - start_time).total_seconds()
            
            # Store interaction
            self._store_interaction(user_message, response['answer'], context, intent, response_time)
            
            return {
                'answer': response['answer'],
                'confidence': response['confidence'],
                'sources': response['sources'],
                'intent': intent,
                'response_time': response_time,
                'session_id': self.session_id
            }
            
        except Exception as e:
            print(f"❌ Error in RAG chatbot: {e}")
            return self._get_fallback_response(user_message)
    
    def _classify_intent(self, message: str) -> str:
        """Classify user intent from message"""
        message_lower = message.lower()
        
        # Question explanation intent
        if any(word in message_lower for word in ['explain', 'why', 'how', 'what', 'question', 'answer']):
            return 'question_explanation'
        
        # Study tips intent
        if any(word in message_lower for word in ['tip', 'help', 'improve', 'better', 'study']):
            return 'study_tips'
        
        # General help intent
        if any(word in message_lower for word in ['help', 'how to', 'what is', 'guide']):
            return 'general_help'
        
        # Results interpretation intent
        if any(word in message_lower for word in ['score', 'result', 'grade', 'performance']):
            return 'results_interpretation'
        
        return 'general_help'
    
    def _get_relevant_documents(self, query: str, intent: str, limit: int = 3) -> List[Document]:
        """Get relevant documents from vector store"""
        try:
            if not self.vector_store:
                return []
            
            # Adjust search based on intent
            if intent == 'question_explanation':
                # Search for specific question explanations
                docs = self.vector_store.similarity_search(
                    query, 
                    k=limit,
                    filter={'type': 'question'}
                )
            else:
                # Search for general knowledge
                docs = self.vector_store.similarity_search(query, k=limit)
            
            return docs
        except Exception as e:
            print(f"❌ Error retrieving documents: {e}")
            return []
    
    def _generate_response(self, query: str, intent: str, docs: List[Document], context: Optional[Dict]) -> Dict[str, Any]:
        """Generate response based on intent and relevant documents"""
        
        if intent == 'question_explanation':
            return self._generate_question_explanation(query, docs, context)
        elif intent == 'study_tips':
            return self._generate_study_tips(query, docs)
        elif intent == 'results_interpretation':
            return self._generate_results_interpretation(query, docs, context)
        else:
            return self._generate_general_response(query, docs)
    
    def _generate_question_explanation(self, query: str, docs: List[Document], context: Optional[Dict]) -> Dict[str, Any]:
        """Generate explanation for a specific question"""
        if not docs:
            return {
                'answer': "I don't have enough information to explain this question. Please try rephrasing your question or ask about a specific topic.",
                'confidence': 0.3,
                'sources': []
            }
        
        # Extract question information from documents
        explanations = []
        sources = []
        
        for doc in docs:
            content = doc.page_content
            if 'Question:' in content and 'Correct Answer:' in content:
                explanations.append(content)
                sources.append({
                    'question_id': doc.metadata.get('question_id'),
                    'difficulty': doc.metadata.get('difficulty'),
                    'category': doc.metadata.get('category')
                })
        
        if explanations:
            # Combine explanations
            combined_explanation = "\n\n".join(explanations[:2])  # Limit to 2 explanations
            
            answer = f"""
            Based on the information I have, here's what I can tell you:

            {combined_explanation}

            If you need more specific help, please provide the exact question you're asking about.
            """
            
            return {
                'answer': answer.strip(),
                'confidence': 0.8,
                'sources': sources
            }
        else:
            return {
                'answer': "I couldn't find a specific explanation for your question. Could you please provide more details about the question you're asking about?",
                'confidence': 0.4,
                'sources': []
            }
    
    def _generate_study_tips(self, query: str, docs: List[Document]) -> Dict[str, Any]:
        """Generate study tips and advice"""
        tips_docs = [doc for doc in docs if doc.metadata.get('type') in ['tips', 'improvement']]
        
        if tips_docs:
            tips_content = "\n\n".join([doc.page_content for doc in tips_docs])
            answer = f"""
            Here are some helpful study tips:

            {tips_content}

            Remember to practice regularly and review your mistakes to improve your performance!
            """
        else:
            answer = """
            Here are some general study tips:
            
            1. **Practice Regularly**: Take quizzes on different topics to build your knowledge
            2. **Review Mistakes**: Always go back and understand why you got questions wrong
            3. **Focus on Weak Areas**: Use your analytics to identify topics you need to improve
            4. **Time Management**: Practice with timed quizzes to improve your speed
            5. **Use Resources**: Don't hesitate to ask for explanations when you're stuck
            
            Keep practicing and you'll see improvement over time!
            """
        
        return {
            'answer': answer.strip(),
            'confidence': 0.9,
            'sources': [{'type': 'study_tips'}]
        }
    
    def _generate_results_interpretation(self, query: str, docs: List[Document], context: Optional[Dict]) -> Dict[str, Any]:
        """Generate interpretation of quiz results"""
        answer = """
        Understanding your quiz results:
        
        **Score & Percentage**: Shows how many questions you answered correctly out of the total
        **Grade**: A (90-100%), B (80-89%), C (70-79%), D (60-69%), F (below 60%)
        **Time Taken**: How long you spent on the quiz - helps identify if you need to work on speed
        **Question Analysis**: Review which questions you got wrong and why
        
        **Tips for Improvement**:
        - Focus on topics where you scored lower
        - Review explanations for incorrect answers
        - Practice similar questions to reinforce learning
        - Track your progress over time to see improvement
        
        Use the analytics dashboard to get detailed insights into your performance!
        """
        
        return {
            'answer': answer.strip(),
            'confidence': 0.9,
            'sources': [{'type': 'results_interpretation'}]
        }
    
    def _generate_general_response(self, query: str, docs: List[Document]) -> Dict[str, Any]:
        """Generate general response"""
        if docs:
            # Use the most relevant document
            most_relevant = docs[0].page_content
            answer = f"""
            Based on your question, here's what I can help you with:

            {most_relevant}

            Is there anything specific you'd like to know about quiz taking or learning?
            """
        else:
            answer = """
            I'm here to help you with your quiz learning journey! I can:
            
            - Explain questions and answers
            - Provide study tips and strategies
            - Help interpret your quiz results
            - Answer general questions about learning
            
            What would you like to know more about?
            """
        
        return {
            'answer': answer.strip(),
            'confidence': 0.7,
            'sources': []
        }
    
    def _get_fallback_response(self, message: str) -> Dict[str, Any]:
        """Get fallback response when RAG system fails"""
        return {
            'answer': """
            I'm having trouble accessing my knowledge base right now. Here are some general tips:
            
            - Read questions carefully before answering
            - Use the process of elimination
            - Review your mistakes to learn from them
            - Practice regularly to improve your skills
            
            Please try asking your question again, or contact support if the issue persists.
            """,
            'confidence': 0.5,
            'sources': [],
            'intent': 'fallback',
            'response_time': 0.1,
            'session_id': self.session_id
        }
    
    def _store_interaction(self, user_message: str, bot_response: str, context: Optional[Dict], 
                          intent: str, response_time: float):
        """Store chatbot interaction in database"""
        try:
            from models import ChatbotInteraction
            
            interaction = ChatbotInteraction(
                user_id=context.get('user_id') if context else None,
                quiz_id=context.get('quiz_id') if context else None,
                question_id=context.get('question_id') if context else None,
                session_id=self.session_id,
                user_message=user_message,
                bot_response=bot_response,
                context=context,
                intent=intent,
                response_time=response_time
            )
            
            self.db_session.add(interaction)
            self.db_session.commit()
            
        except Exception as e:
            print(f"❌ Error storing chatbot interaction: {e}")
            self.db_session.rollback()
    
    def get_chat_history(self, user_id: int, limit: int = 10) -> List[Dict]:
        """Get chat history for a user"""
        try:
            from models import ChatbotInteraction
            
            interactions = self.db_session.query(ChatbotInteraction).filter(
                ChatbotInteraction.user_id == user_id
            ).order_by(ChatbotInteraction.created_at.desc()).limit(limit).all()
            
            return [
                {
                    'id': interaction.id,
                    'user_message': interaction.user_message,
                    'bot_response': interaction.bot_response,
                    'intent': interaction.intent,
                    'created_at': interaction.created_at.isoformat(),
                    'was_helpful': interaction.was_helpful
                }
                for interaction in interactions
            ]
        except Exception as e:
            print(f"❌ Error retrieving chat history: {e}")
            return []
    
    def update_satisfaction(self, interaction_id: int, satisfaction: int, was_helpful: bool):
        """Update user satisfaction for an interaction"""
        try:
            from models import ChatbotInteraction
            
            interaction = self.db_session.query(ChatbotInteraction).filter(
                ChatbotInteraction.id == interaction_id
            ).first()
            
            if interaction:
                interaction.user_satisfaction = satisfaction
                interaction.was_helpful = was_helpful
                self.db_session.commit()
                
        except Exception as e:
            print(f"❌ Error updating satisfaction: {e}")
            self.db_session.rollback() 