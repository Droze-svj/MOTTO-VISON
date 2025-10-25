"""
WebSocket Real-Time Communication
Add to main_improved.py for real-time features
"""

import socketio
from fastapi import FastAPI
from typing import Dict, Set
import logging

logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',  # Configure based on your needs
    logger=True,
    engineio_logger=True
)

# Track connected users
connected_users: Dict[str, str] = {}  # socket_id -> user_id
user_rooms: Dict[str, Set[str]] = {}  # user_id -> set of room_ids


# ============================================
# Connection Events
# ============================================

@sio.event
async def connect(sid, environ):
    """Client connected"""
    logger.info(f"🔌 Client connected: {sid}")
    await sio.emit('connected', {'socket_id': sid}, room=sid)


@sio.event
async def disconnect(sid):
    """Client disconnected"""
    logger.info(f"🔌 Client disconnected: {sid}")
    
    # Clean up user tracking
    if sid in connected_users:
        user_id = connected_users[sid]
        del connected_users[sid]
        
        # Leave all rooms
        if user_id in user_rooms:
            for room in user_rooms[user_id]:
                await sio.leave_room(sid, room)
            del user_rooms[user_id]


# ============================================
# Authentication
# ============================================

@sio.event
async def authenticate(sid, data):
    """Authenticate user"""
    user_id = data.get('user_id')
    token = data.get('token')
    
    # TODO: Validate JWT token
    # For now, simple registration
    if user_id:
        connected_users[sid] = user_id
        logger.info(f"✅ User authenticated: {user_id} ({sid})")
        await sio.emit('authenticated', {'user_id': user_id}, room=sid)
    else:
        await sio.emit('auth_error', {'error': 'Invalid credentials'}, room=sid)


# ============================================
# Messaging
# ============================================

@sio.event
async def message(sid, data):
    """Handle incoming message"""
    user_id = connected_users.get(sid)
    if not user_id:
        await sio.emit('error', {'error': 'Not authenticated'}, room=sid)
        return
    
    content = data.get('content')
    to_user = data.get('to')
    room_id = data.get('room')
    
    message_data = {
        'id': f'msg_{sid}_{data.get("timestamp", 0)}',
        'from': user_id,
        'content': content,
        'timestamp': data.get('timestamp'),
    }
    
    if room_id:
        # Send to room
        await sio.emit('message', message_data, room=room_id, skip_sid=sid)
    elif to_user:
        # Direct message
        # Find recipient socket
        recipient_sid = next((s for s, u in connected_users.items() if u == to_user), None)
        if recipient_sid:
            await sio.emit('message', message_data, room=recipient_sid)
    else:
        # Broadcast to all
        await sio.emit('message', message_data, skip_sid=sid)
    
    logger.info(f"📨 Message from {user_id}: {content[:50]}...")


@sio.event
async def typing(sid, data):
    """Handle typing indicator"""
    user_id = connected_users.get(sid)
    if not user_id:
        return
    
    is_typing = data.get('isTyping', False)
    room_id = data.get('room')
    
    typing_data = {
        'userId': user_id,
        'isTyping': is_typing
    }
    
    if room_id:
        await sio.emit('typing', typing_data, room=room_id, skip_sid=sid)
    else:
        await sio.emit('typing', typing_data, skip_sid=sid)


# ============================================
# Room Management
# ============================================

@sio.event
async def join_room(sid, data):
    """Join a chat room"""
    user_id = connected_users.get(sid)
    if not user_id:
        await sio.emit('error', {'error': 'Not authenticated'}, room=sid)
        return
    
    room_id = data.get('roomId')
    if not room_id:
        await sio.emit('error', {'error': 'Room ID required'}, room=sid)
        return
    
    await sio.enter_room(sid, room_id)
    
    # Track user rooms
    if user_id not in user_rooms:
        user_rooms[user_id] = set()
    user_rooms[user_id].add(room_id)
    
    logger.info(f"📥 User {user_id} joined room {room_id}")
    
    # Notify room
    await sio.emit('user_joined', {'userId': user_id}, room=room_id, skip_sid=sid)


@sio.event
async def leave_room(sid, data):
    """Leave a chat room"""
    user_id = connected_users.get(sid)
    if not user_id:
        return
    
    room_id = data.get('roomId')
    if not room_id:
        return
    
    await sio.leave_room(sid, room_id)
    
    # Update tracking
    if user_id in user_rooms:
        user_rooms[user_id].discard(room_id)
    
    logger.info(f"📤 User {user_id} left room {room_id}")
    
    # Notify room
    await sio.emit('user_left', {'userId': user_id}, room=room_id)


# ============================================
# Utility Events
# ============================================

@sio.event
async def ping(sid, data):
    """Ping/pong for latency measurement"""
    await sio.emit('pong', {'timestamp': data.get('timestamp')}, room=sid)


@sio.event
async def get_online_users(sid):
    """Get list of online users"""
    await sio.emit('online_users', {
        'users': list(connected_users.values()),
        'count': len(connected_users)
    }, room=sid)


# ============================================
# Integration with FastAPI
# ============================================

def add_socketio_to_app(app: FastAPI):
    """
    Add Socket.IO to FastAPI application
    
    Usage:
        from realtime import add_socketio_to_app, sio
        
        add_socketio_to_app(app)
    """
    app.mount('/', socketio.ASGIApp(sio))
    logger.info("✅ Socket.IO integrated with FastAPI")


# Export for main_improved.py
__all__ = ['sio', 'add_socketio_to_app']

