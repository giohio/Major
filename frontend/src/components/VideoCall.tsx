import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoCallProps {
    roomId: string; // usually appointmentId
    userId: string;
    userName: string;
    isDoctor: boolean;
    onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId, userId, isDoctor, onEndCall }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState('');
    const [callerSignal, setCallerSignal] = useState<any>();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const searchParams = new URLSearchParams(window.location.search);
    const room = searchParams.get('id') || roomId;

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<Peer.Instance>();
    const socket = useRef<Socket>();

    useEffect(() => {
        // Initialize Socket
        socket.current = io(API_CONFIG.BASE_URL, {
            path: '/socket.io', // Standard Flask-SocketIO path
            transports: ['websocket', 'polling']
        });

        // Get User Media
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
        });

        // Join Room
        socket.current.emit('join-room', { roomId: room, userId });

        // Listen for users joining
        socket.current.on('user-connected', (data: any) => {
            console.log("User connected:", data);
            // If we are the doctor (initiator), we might wait or call? 
            // For simplicity in mesh, usually the new joiner calls the existing ones, 
            // or the existing one calls the new joiner.
            // Here: Let's assume Doctor is Host. If Patient joins, Patient Calls Doctor?
            // Or simpler: Standard 'callUser' flow.
        });

        socket.current.on('offer', (data: any) => {
            setReceivingCall(true);
            setCaller(data.callerId);
            setCallerSignal(data.sdp);

            // Auto answer if we are already in the room expecting a call?
            // Or show accept button? 
            // For tele-health, usually auto-connect or explicit button.
            // Let's go with explicit button for safety, or auto if configured.
        });

        socket.current.on('answer', (data: any) => {
            // We received an answer
            if (connectionRef.current) {
                connectionRef.current.signal(data.sdp);
            }
        });

        socket.current.on('ice-candidate', (data: any) => {
            if (connectionRef.current) {
                connectionRef.current.signal(data.candidate);
            }
        });

        // Cleanup
        return () => {
            socket.current?.disconnect();
            connectionRef.current?.destroy();
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [room, userId]);

    // Function to call the other person (Assuming 1-on-1 for now)
    const callUser = (idToCall: string) => { // In a real app we'd map userId to socketId or just broadcast to room
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream!,
        });

        peer.on('signal', (data) => {
            // Broadcast offer to room (or specific user if we knew socketId)
            // Since we emit to room, we might need to handle 'targetSocketId' in backend better
            // For simplicity: We emit 'offer' to the room, backend sends to everyone else
            // But our backend expects targetSocketId. 
            // Workaround: We need to know who is in the room.
            // Let's rely on 'user-connected' event giving us the socketId.
        });

        // Actually, simple-peer logic is tricky with rooms if we don't track socketIds.
        // Simplified Logic 2:
        // Just broadcast "I am here" (join-room). 
        // If I am Doctor, I wait for Patient.
        // Patient joins -> "user-connected" event with socketId.
        // Doctor calls Patient using that socketId.
    };

    // Revised Init Logic based on 'user-connected'
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on('user-connected', ({ userId: remoteUserId, socketId }) => {
            console.log("Peer found:", remoteUserId);
            // If we are Doctor, we initiate call to Patient
            if (isDoctor) {
                initiateCall(socketId);
            }
        });
    }, [isDoctor, stream]);

    const initiateCall = (remoteSocketId: string) => {
        const peer = new Peer({
            initiator: true,
            trickle: false, // Simple peer standard
            stream: stream!
        });

        peer.on('signal', (data) => {
            socket.current?.emit('offer', {
                sdp: data,
                targetSocketId: remoteSocketId,
                userId: userId
            });
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        socket.current?.on('answer', (data: any) => {
            peer.signal(data.sdp);
        });

        connectionRef.current = peer;
        setCallAccepted(true);
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream!
        });

        peer.on('signal', (data) => {
            socket.current?.emit('answer', {
                sdp: data,
                targetSocketId: caller, // We need caller's socketId. 
                // Wait, caller sends us offer. The offer event typically contains socketId.
                // Let's ensure access to callerSocketId.
                // 'caller' state currently holds callerId not socketId.
                // We need to fix the backend/frontend contract.
            });
            // Note: In handle_offer backend, it sends 'callerSocketId'.
            // We should store that.
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    // Fixed Offer Handler to capture socketID
    useEffect(() => {
        if (!socket.current) return;
        socket.current.on('offer', (data: any) => {
            setReceivingCall(true);
            setCaller(data.callerSocketId); // Store SocketID to reply
            setCallerSignal(data.sdp);
        });
    }, []);


    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current?.destroy();
        socket.current?.emit('leave-room', { roomId: room, userId });
        onEndCall();
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-900 min-h-screen text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                {/* My Video */}
                <Card className="p-2 bg-gray-800 border-gray-700">
                    <video playsInline muted ref={myVideo} autoPlay className="w-full rounded-lg bg-black" />
                    <p className="text-center mt-2 font-semibold">Me {isMuted && '(Muted)'}</p>
                </Card>

                {/* User Video */}
                <Card className="p-2 bg-gray-800 border-gray-700">
                    {callAccepted && !callEnded ? (
                        <video playsInline ref={userVideo} autoPlay className="w-full rounded-lg bg-black" />
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-black rounded-lg">
                            <p>Waiting for connection...</p>
                        </div>
                    )}
                    <p className="text-center mt-2 font-semibold">Remote User</p>
                </Card>
            </div>

            {/* Call Notification */}
            {receivingCall && !callAccepted && (
                <div className="mt-4 p-4 bg-blue-600 rounded-lg flex items-center gap-4 animate-bounce">
                    <p>Incoming Call...</p>
                    <Button onClick={answerCall} className="bg-green-500 hover:bg-green-600">Answer</Button>
                </div>
            )}

            {/* Controls */}
            <div className="mt-8 flex gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full w-12 h-12 ${isMuted ? 'bg-red-500 hover:bg-red-600 border-none' : 'bg-gray-700'}`}
                    onClick={toggleMute}
                >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full w-12 h-12 ${isVideoOff ? 'bg-red-500 hover:bg-red-600 border-none' : 'bg-gray-700'}`}
                    onClick={toggleVideo}
                >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
                    onClick={leaveCall}
                >
                    <PhoneOff className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
};

export default VideoCall;
