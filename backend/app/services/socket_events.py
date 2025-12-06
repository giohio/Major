from app.extensions import socketio
from flask import request
from flask_socketio import emit, join_room, leave_room

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('join-room')
def handle_join_room(data):
    """
    User joins a call room (e.g. appointment_id).
    Notify others in the room that a new user has joined.
    """
    room_id = data.get('roomId')
    user_id = data.get('userId')
    
    if room_id:
        join_room(room_id)
        # Notify others in the room
        emit('user-connected', {'userId': user_id, 'socketId': request.sid}, to=room_id, include_self=False)
        print(f"User {user_id} ({request.sid}) joined room {room_id}")

@socketio.on('leave-room')
def handle_leave_room(data):
    room_id = data.get('roomId')
    user_id = data.get('userId')
    if room_id:
        leave_room(room_id)
        emit('user-disconnected', {'userId': user_id}, to=room_id)

@socketio.on('offer')
def handle_offer(data):
    """
    Caller sends an offer to a specific callee.
    """
    target_socket_id = data.get('targetSocketId')
    sdp = data.get('sdp')
    caller_id = data.get('userId')
    
    if target_socket_id:
        emit('offer', {
            'sdp': sdp,
            'callerId': caller_id,
            'callerSocketId': request.sid
        }, to=target_socket_id)

@socketio.on('answer')
def handle_answer(data):
    """
    Callee sends an answer back to the caller.
    """
    target_socket_id = data.get('targetSocketId')
    sdp = data.get('sdp')
    callee_id = data.get('userId')
    
    if target_socket_id:
        emit('answer', {
            'sdp': sdp,
            'calleeId': callee_id,
            'calleeSocketId': request.sid
        }, to=target_socket_id)

@socketio.on('ice-candidate')
def handle_candidate(data):
    """
    Exchange ICE candidates for network traversal.
    """
    target_socket_id = data.get('targetSocketId')
    candidate = data.get('candidate')
    
    if target_socket_id:
        emit('ice-candidate', {
            'candidate': candidate,
            'senderSocketId': request.sid
        }, to=target_socket_id)
