"""
Database Models
Improved with better security, proper types, and relationships
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Index, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional

Base = declarative_base()


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps"""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class User(Base, TimestampMixin):
    """User model with OAuth integrations and security"""
    __tablename__ = "users"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(255), unique=True, index=True, nullable=False)
    
    # Authentication
    email = Column(String(255), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=True)  # For username/password auth
    refresh_token = Column(Text, nullable=True)  # JWT refresh token
    
    # OAuth Tokens (encrypted in production)
    google_access_token = Column(Text, nullable=True)
    google_refresh_token = Column(Text, nullable=True)
    ms_access_token = Column(Text, nullable=True)
    ms_refresh_token = Column(Text, nullable=True)
    notion_access_token = Column(Text, nullable=True)
    
    # Firebase Cloud Messaging
    fcm_token = Column(String(255), nullable=True, index=True)
    
    # User Profile
    preferences = Column(Text, nullable=True)  # JSON string
    last_interaction = Column(Text, nullable=True)
    onboarded = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('ix_users_email_active', 'email', 'is_active'),
        Index('ix_users_user_id_active', 'user_id', 'is_active'),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, user_id='{self.user_id}', email='{self.email}')>"


class Document(Base, TimestampMixin):
    """Document model for user-created content"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(255), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False, index=True)
    
    title = Column(String(500), nullable=False, index=True)
    content = Column(Text, nullable=True)
    status = Column(String(50), default='active', nullable=False, index=True)  # active, archived, deleted
    
    # Metadata
    word_count = Column(Integer, default=0)
    language = Column(String(10), default='en')
    
    # Relationships
    user = relationship("User", back_populates="documents")
    
    __table_args__ = (
        Index('ix_documents_user_status', 'user_id', 'status'),
        Index('ix_documents_user_created', 'user_id', 'created_at'),
    )
    
    def __repr__(self):
        return f"<Document(id={self.id}, title='{self.title}', status='{self.status}')>"


class Conversation(Base, TimestampMixin):
    """Conversation history model"""
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(255), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Conversation data
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    message = Column(Text, nullable=False)
    
    # Metadata
    intent = Column(String(100), nullable=True)  # Detected intent
    confidence = Column(Integer, nullable=True)  # Confidence score 0-100
    language = Column(String(10), default='en')
    
    # Context
    session_id = Column(String(255), nullable=True, index=True)
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    
    __table_args__ = (
        Index('ix_conversations_user_created', 'user_id', 'created_at'),
        Index('ix_conversations_session', 'session_id', 'created_at'),
    )
    
    def __repr__(self):
        return f"<Conversation(id={self.id}, role='{self.role}', intent='{self.intent}')>"


class ApiKey(Base, TimestampMixin):
    """API Keys for programmatic access"""
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(255), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False, index=True)
    
    key_hash = Column(String(255), unique=True, nullable=False, index=True)  # Hashed API key
    name = Column(String(255), nullable=False)  # User-friendly name
    
    # Permissions
    scopes = Column(Text, nullable=True)  # JSON array of allowed scopes
    
    # Usage tracking
    last_used = Column(DateTime(timezone=True), nullable=True)
    usage_count = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    __table_args__ = (
        Index('ix_api_keys_user_active', 'user_id', 'is_active'),
    )
    
    def __repr__(self):
        return f"<ApiKey(id={self.id}, name='{self.name}', is_active={self.is_active})>"


class AuditLog(Base):
    """Audit log for security and compliance"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Who
    user_id = Column(String(255), nullable=True, index=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 max length
    
    # What
    action = Column(String(100), nullable=False, index=True)  # login, logout, api_call, etc.
    resource = Column(String(255), nullable=True)  # Resource affected
    
    # Details
    status = Column(String(20), nullable=False)  # success, failure, error
    details = Column(Text, nullable=True)  # JSON with additional info
    
    __table_args__ = (
        Index('ix_audit_logs_user_action', 'user_id', 'action', 'timestamp'),
        Index('ix_audit_logs_timestamp', 'timestamp'),
    )
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', status='{self.status}')>"
