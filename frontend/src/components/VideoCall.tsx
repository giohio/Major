import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { API_CONFIG } from '../config/api.config';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PhoneOff, Mic, MicOff, Video, VideoOff, CheckCircle } from 'lucide-react';
import { apiClient } from '../services/api.client';
import { toast } from 'sonner';

interface VideoCallProps {
    roomId: string;
    userId: string;
    userName: string;
    isDoctor: boolean;
    onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId, userId, isDoctor, onEndCall }) => {
    const [callAccepted, setCallAccepted] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...');
    const [isCompletingAppointment, setIsCompletingAppointment] = useState(false);

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer.Instance | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isProcessingOffer = useRef<boolean>(false);

    useEffect(() => {
        console.log('🎥 VideoCall: Mounting with room:', roomId, 'userId:', userId, 'isDoctor:', isDoctor);
        
        // Initialize Socket.IO
        socketRef.current = io(API_CONFIG.BASE_URL, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Socket connected:', socketRef.current?.id);
            setConnectionStatus('Connected to server');
            
            // Join room after connection
            socketRef.current?.emit('join-room', { roomId, userId });
            console.log('📍 Joined room:', roomId);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            setConnectionStatus('Connection error: ' + error.message);
        });

        // Get user media with optimized constraints
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                frameRate: { ideal: 30, max: 30 },
                facingMode: 'user'
            }, 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        })
        .then((currentStream) => {
            console.log('🎬 Got media stream');
            streamRef.current = currentStream;
            
            // Ensure tracks are enabled on local stream
            currentStream.getVideoTracks().forEach(track => {
                console.log('📹 Local video track:', track.label, 'enabled:', track.enabled, 'muted:', track.muted, 'readyState:', track.readyState);
                track.enabled = true; // Always enable video
            });
            
            currentStream.getAudioTracks().forEach(track => {
                console.log('🎤 Local audio track:', track.label, 'enabled:', track.enabled, 'muted:', track.muted, 'readyState:', track.readyState);
                track.enabled = true; // Always enable audio
            });
            
            // Set local video and ensure it plays
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
                myVideo.current.play().catch(err => {
                    console.warn('⚠️ Local video autoplay warning:', err);
                });
            }
            
            // Ensure video state matches reality
            setIsVideoOff(false);
            setIsMuted(false);
            setConnectionStatus('Ready - Waiting for peer...');
        })
        .catch((error) => {
            console.error('❌ Media error:', error);
            setConnectionStatus('Camera/Mic error: ' + error.message);
        });

        // Listen for other user joining
        socketRef.current.on('user-connected', (data: { userId: string; socketId: string }) => {
            console.log('👤 User connected:', data);
            setConnectionStatus('User joined, establishing connection...');
            
            // Destroy old peer if exists to avoid conflicts
            if (peerRef.current) {
                console.log('⚠️ Destroying old peer before creating new one');
                peerRef.current.destroy();
                peerRef.current = null;
            }
            
            // If I'm the doctor, I initiate the call
            if (isDoctor) {
                // Check if stream exists immediately
                if (streamRef.current) {
                    const videoTracks = streamRef.current.getVideoTracks();
                    const audioTracks = streamRef.current.getAudioTracks();
                    console.log('🎬 Doctor stream check:', {
                        hasStream: !!streamRef.current,
                        videoTracks: videoTracks.length,
                        audioTracks: audioTracks.length,
                        videoMuted: videoTracks.map(t => t.muted),
                        audioMuted: audioTracks.map(t => t.muted)
                    });
                    
                    // Proceed immediately if stream exists (don't wait for unmute)
                    console.log('👨‍⚕️ Doctor initiating call to:', data.socketId);
                    createPeer(data.socketId, true);
                } else {
                    // Wait for stream if not ready yet
                    console.log('⏳ Waiting for doctor stream...');
                    const waitInterval = setInterval(() => {
                        if (streamRef.current) {
                            clearInterval(waitInterval);
                            console.log('✅ Doctor stream ready, initiating call');
                            createPeer(data.socketId, true);
                        }
                    }, 100);
                    
                    // Timeout after 3 seconds
                    setTimeout(() => {
                        clearInterval(waitInterval);
                        if (!streamRef.current) {
                            console.error('❌ Doctor stream timeout');
                            setConnectionStatus('Failed to get media stream');
                        }
                    }, 3000);
                }
            }
        });

        // Listen for offer (I'm the patient receiving doctor's call)
        socketRef.current.on('offer', (data: { sdp: Peer.SignalData; callerId: string; callerSocketId: string }) => {
            const sdpType = data.sdp?.type;
            
            // Distinguish between actual offer and ICE candidates sent via offer event
            if (sdpType === 'offer') {
                console.log('📞 Received SDP OFFER from:', data.callerSocketId);
                
                // Ignore if already processing
                if (isProcessingOffer.current) {
                    console.warn('⚠️ Already processing offer, ignoring duplicate');
                    return;
                }
                
                setConnectionStatus('Receiving call...');
                isProcessingOffer.current = true;
                
                // Destroy old peer if exists
                if (peerRef.current) {
                    console.log('⚠️ Destroying old peer before answering');
                    peerRef.current.destroy();
                    peerRef.current = null;
                }
                
                if (!isDoctor && streamRef.current) {
                    console.log('🤝 Patient answering call');
                    createPeer(data.callerSocketId, false, data.sdp);
                    // Reset flag after peer is created
                    setTimeout(() => {
                        isProcessingOffer.current = false;
                    }, 1000);
                } else if (!streamRef.current) {
                    console.error('❌ No stream available to answer');
                    setConnectionStatus('Failed to get media stream');
                    isProcessingOffer.current = false;
                }
            } else if (sdpType === 'candidate' || !sdpType) {
                // ICE candidate sent via offer event (from backend relay)
                console.log('🧊 Received ICE candidate via offer event');
                if (peerRef.current && !peerRef.current.destroyed) {
                    try {
                        peerRef.current.signal(data.sdp);
                    } catch (err) {
                        console.error('❌ Error signaling candidate from offer:', err);
                    }
                }
            } else {
                console.warn('⚠️ Unknown offer type:', sdpType);
            }
        });

        // Listen for answer (I'm the doctor, patient answered)
        socketRef.current.on('answer', (data: { sdp: Peer.SignalData }) => {
            const sdpType = data.sdp?.type;
            
            if (sdpType === 'answer') {
                console.log('✅ Received SDP ANSWER');
                if (peerRef.current && !peerRef.current.destroyed) {
                    try {
                        peerRef.current.signal(data.sdp);
                        setConnectionStatus('Connected!');
                    } catch (err) {
                        console.error('❌ Error signaling answer:', err);
                    }
                } else {
                    console.warn('⚠️ Cannot signal answer - peer destroyed or not exists');
                }
            } else if (sdpType === 'candidate' || !sdpType) {
                // ICE candidate sent via answer event
                console.log('🧊 Received ICE candidate via answer event');
                if (peerRef.current && !peerRef.current.destroyed) {
                    try {
                        peerRef.current.signal(data.sdp);
                    } catch (err) {
                        console.error('❌ Error signaling candidate from answer:', err);
                    }
                }
            } else {
                console.warn('⚠️ Unknown answer type:', sdpType);
            }
        });

        // Listen for ICE candidates (trickle ICE)
        socketRef.current.on('ice-candidate', (data: { candidate: Peer.SignalData }) => {
            console.log('🧊 Received ICE candidate');
            if (peerRef.current && !peerRef.current.destroyed && data.candidate) {
                try {
                    peerRef.current.signal(data.candidate);
                } catch (err) {
                    console.error('❌ Error adding ICE candidate:', err);
                }
            } else if (peerRef.current?.destroyed) {
                console.warn('⚠️ Cannot add ICE candidate - peer destroyed');
            }
        });

        // Listen for user disconnect to reset state
        socketRef.current.on('user-disconnected', (data: { userId: string }) => {
            console.log('👋 User disconnected:', data.userId);
            setConnectionStatus('Peer disconnected');
            setCallAccepted(false);
            
            // Reset state for reconnection
            isProcessingOffer.current = false;
            
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
            
            if (userVideo.current) {
                userVideo.current.srcObject = null;
            }
        });

        // Cleanup
        return () => {
            console.log('🧹 Cleaning up video call');
            
            // Notify others that we're leaving
            socketRef.current?.emit('leave-room', { roomId, userId });
            
            // Reset state
            isProcessingOffer.current = false;
            
            // Remove all socket listeners to prevent duplicates
            socketRef.current?.off('user-connected');
            socketRef.current?.off('offer');
            socketRef.current?.off('answer');
            socketRef.current?.off('ice-candidate');
            socketRef.current?.off('user-disconnected');
            socketRef.current?.disconnect();
            
            peerRef.current?.destroy();
            streamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, [roomId, userId, isDoctor]);

    const createPeer = (remoteSocketId: string, initiator: boolean, initialSignal?: Peer.SignalData) => {
        // Prevent duplicate peer creation
        if (peerRef.current) {
            console.warn('⚠️ Peer already exists, destroying before creating new one');
            peerRef.current.destroy();
            peerRef.current = null;
        }
        
        if (!streamRef.current) {
            console.error('❌ No stream available in createPeer');
            setConnectionStatus('Error: No media stream');
            return;
        }

        // Validate and unmute all tracks before creating peer
        const videoTracks = streamRef.current.getVideoTracks();
        const audioTracks = streamRef.current.getAudioTracks();
        
        console.log('🔗 Creating peer:', { 
            initiator, 
            remoteSocketId, 
            hasStream: !!streamRef.current,
            videoTracks: videoTracks.length,
            audioTracks: audioTracks.length,
            streamActive: streamRef.current.active
        });
        
        if (videoTracks.length === 0 && audioTracks.length === 0) {
            console.error('❌ Stream has no tracks');
            setConnectionStatus('Error: Stream has no media tracks');
            return;
        }

        // IMPORTANT: Ensure all tracks are enabled
        videoTracks.forEach(track => {
            track.enabled = true;
            console.log('📹 Video track before peer:', track.label, 'enabled:', track.enabled, 'muted:', track.muted, 'readyState:', track.readyState);
        });
        
        audioTracks.forEach(track => {
            track.enabled = true;
            console.log('🎤 Audio track before peer:', track.label, 'enabled:', track.enabled, 'muted:', track.muted, 'readyState:', track.readyState);
        });

        // Note: Tracks may be temporarily muted, but will unmute automatically
        // Browser handles this internally, so we proceed with peer creation
        createPeerInstance(remoteSocketId, initiator, initialSignal);
    };
    
    const createPeerInstance = (remoteSocketId: string, initiator: boolean, initialSignal?: Peer.SignalData) => {
        if (!streamRef.current) {
            console.error('❌ No stream in createPeerInstance');
            return;
        }
        
        try {
            // Add polyfill check
            if (typeof window.RTCPeerConnection === 'undefined') {
                console.error('❌ WebRTC not supported');
                setConnectionStatus('WebRTC not supported in this browser');
                return;
            }

            console.log('Creating Peer instance...');
            const peer = new Peer({
                initiator,
                trickle: true, // Enable trickle ICE for faster connection
                stream: streamRef.current,
                config: {
                    iceServers: [
                        // Google STUN servers
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:stun3.l.google.com:19302' },
                        { urls: 'stun:stun4.l.google.com:19302' },
                    ],
                    // Optimize for better connection
                    iceTransportPolicy: 'all',
                    bundlePolicy: 'max-bundle',
                    rtcpMuxPolicy: 'require',
                },
                offerOptions: {
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                },
                answerOptions: {
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                },
                // Optimize for media streaming
                sdpTransform: (sdp) => {
                    // Prefer VP8 codec for better compatibility
                    return sdp;
                }
            });
            
            console.log('✅ Peer instance created successfully');

            peerRef.current = peer;

            // If initialSignal is provided (patient receiving offer), signal it IMMEDIATELY
            if (initialSignal && !initiator) {
                console.log('📥 Patient signaling initial offer to generate answer');
                try {
                    peer.signal(initialSignal);
                } catch (err) {
                    console.error('❌ Error signaling initial offer:', err);
                }
            }

            peer.on('signal', (signal) => {
                console.log('📡 Sending signal:', signal.type || 'candidate', {
                    initiator,
                    hasType: !!signal.type,
                    isOffer: signal.type === 'offer',
                    isAnswer: signal.type === 'answer'
                });
                
                if (initiator) {
                    // Send offer or ICE candidate
                    socketRef.current?.emit('offer', {
                        sdp: signal,
                        targetSocketId: remoteSocketId,
                        userId: userId
                    });
                } else {
                    // Send answer or ICE candidate
                    socketRef.current?.emit('answer', {
                        sdp: signal,
                        targetSocketId: remoteSocketId,
                        userId: userId
                    });
                }
            });
            
            peer.on('connect', () => {
                console.log('🔗 Peer data channel connected');
                setConnectionStatus('Connected');
            });
            
            peer.on('data', (data) => {
                console.log('📨 Received data:', data.toString());
            });

            peer.on('stream', (remoteStream) => {
                console.log('🎥 Received remote stream', {
                    videoTracks: remoteStream.getVideoTracks().length,
                    audioTracks: remoteStream.getAudioTracks().length,
                    active: remoteStream.active,
                    id: remoteStream.id
                });
                
                // Check remote track states
                remoteStream.getVideoTracks().forEach(track => {
                    console.log('📺 REMOTE Video track:', track.label, 'enabled:', track.enabled, 'muted:', track.muted, 'readyState:', track.readyState);
                    
                    // Try to unmute if muted
                    if (track.muted) {
                        console.warn('⚠️ Remote video track is muted - this is usually a sender issue');
                    }
                    
                    track.onended = () => console.log('❌ Remote video track ended');
                    track.onmute = () => {
                        console.log('🔇 Remote video track muted');
                    };
                    track.onunmute = () => {
                        console.log('🔊 Remote video track unmuted - forcing video refresh');
                        // Force refresh by reassigning srcObject
                        setTimeout(() => {
                            if (userVideo.current) {
                                console.log('🔄 Refreshing video element');
                                const currentStream = userVideo.current.srcObject as MediaStream;
                                if (currentStream) {
                                    userVideo.current.srcObject = null;
                                    requestAnimationFrame(() => {
                                        if (userVideo.current) {
                                            userVideo.current.srcObject = currentStream;
                                            userVideo.current.play().catch(e => console.error('❌ Play after unmute error:', e));
                                        }
                                    });
                                }
                            }
                        }, 100);
                    };
                });
                
                remoteStream.getAudioTracks().forEach(track => {
                    console.log('🔊 REMOTE Audio track:', track.label, 'enabled:', track.enabled, 'muted:', track.muted, 'readyState:', track.readyState);
                    
                    if (track.muted) {
                        console.warn('⚠️ Remote audio track is muted - this is usually a sender issue');
                    }
                    
                    track.onended = () => console.log('❌ Remote audio track ended');
                });
                
                if (userVideo.current) {
                    // Only set srcObject if it's different to avoid play interruption
                    if (userVideo.current.srcObject !== remoteStream) {
                        console.log('📺 Setting remote video srcObject');
                        userVideo.current.srcObject = remoteStream;
                        // Force video to play with retry
                        userVideo.current.play().catch(e => {
                            console.error('❌ Play error:', e);
                            // Retry after short delay
                            setTimeout(() => {
                                userVideo.current?.play().catch(e2 => console.error('❌ Play retry failed:', e2));
                            }, 100);
                        });
                    } else {
                        console.log('📺 Remote video already set, skipping');
                    }
                }
                setCallAccepted(true);
                setConnectionStatus('Call active - Video streaming');
            });

            peer.on('error', (err) => {
                console.error('❌ Peer error:', err);
                setConnectionStatus('Connection error: ' + err.message);
            });

            peerRef.current = peer;
        } catch (error) {
            console.error('❌ Error creating peer:', error);
            setConnectionStatus('Peer creation error: ' + (error instanceof Error ? error.message : 'Unknown'));
        }
    };

    const leaveCall = () => {
        console.log('📴 Ending call');
        try {
            // Destroy peer connection
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
            
            // Stop all media tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log('⏹️ Stopped track:', track.kind);
                });
            }
            
            // Notify server
            socketRef.current?.emit('leave-room', { roomId, userId });
            
            toast.info('Call ended');
            onEndCall();
        } catch (error) {
            console.error('❌ Error leaving call:', error);
            onEndCall(); // Still call onEndCall even if error
        }
    };

    const handleCompleteAppointment = async () => {
        try {
            setIsCompletingAppointment(true);
            await apiClient.put(`/doctor/appointments/${roomId}`, {
                status: 'completed'
            });
            toast.success('Consultation completed');
            setTimeout(() => leaveCall(), 1000);
        } catch (error: unknown) {
            console.error('Failed to complete appointment:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error('Unable to complete: ' + errorMessage);
            setIsCompletingAppointment(false);
        }
    };

    const toggleMute = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
                console.log('🔇 Audio:', audioTrack.enabled ? 'on' : 'off');
                toast.success(audioTrack.enabled ? 'Microphone on' : 'Microphone muted');
            } else {
                console.warn('⚠️ No audio track available');
                toast.error('No audio track found');
            }
        } else {
            console.warn('⚠️ No stream available');
            toast.error('No audio stream available');
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
                console.log('📹 Video:', videoTrack.enabled ? 'on' : 'off');
                toast.success(videoTrack.enabled ? 'Camera on' : 'Camera off');
            } else {
                console.warn('⚠️ No video track available');
                toast.error('No video track found');
            }
        } else {
            console.warn('⚠️ No stream available');
            toast.error('No video stream available');
        }
    };

    return (
        <div className="flex flex-col items-center p-6 pt-20 bg-gray-950 min-h-screen">
            {/* Status Banner - Minimalist */}
            <div className="mb-4 px-6 py-2.5 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${callAccepted ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <p className="text-xs font-medium text-gray-300">
                        {connectionStatus}
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full max-w-6xl mb-4">
                {/* My Video */}
                <Card className="flex-1 bg-gray-900 border-gray-800 relative overflow-hidden">
                    <div className="relative min-h-[300px] h-full">
                        <video 
                            playsInline 
                            muted 
                            ref={myVideo} 
                            autoPlay 
                            className="w-full h-full rounded-lg bg-black aspect-video object-cover" 
                        />
                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-gray-950/80 rounded-md border border-gray-700">
                            <p className="text-xs font-semibold flex items-center gap-1.5">
                                <span className="text-gray-300">You</span>
                                {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                                {isVideoOff && <VideoOff className="w-3 h-3 text-red-400" />}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Remote Video */}
                <Card className="flex-1 bg-gray-900 border-gray-800 relative overflow-hidden">
                    <div className="relative h-full">
                        {callAccepted ? (
                            <video 
                                playsInline 
                                ref={userVideo} 
                                autoPlay 
                                controls={false}
                                className="w-full h-full rounded-lg bg-black aspect-video object-cover" 
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gray-950">
                                <div className="text-center">
                                    <div className="relative w-20 h-20 mx-auto mb-4">
                                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                                            <Video className="w-10 h-10 text-gray-500" />
                                        </div>
                                    </div>
                                    <p className="text-gray-400 font-medium text-sm">Waiting for {isDoctor ? 'patient' : 'doctor'}...</p>
                                </div>
                            </div>
                        )}
                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-gray-950/80 rounded-md border border-gray-700">
                            <p className="text-xs font-semibold text-gray-300">
                                {isDoctor ? 'Patient' : 'Doctor'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Controls - Minimal Design */}
            <div className="flex gap-4 w-full max-w-6xl justify-center">
                <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full w-14 h-14 border transition-all ${
                        isMuted 
                            ? 'bg-red-600 hover:bg-red-700 border-red-500 text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300'
                    }`}
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full w-14 h-14 border transition-all ${
                        isVideoOff 
                            ? 'bg-red-600 hover:bg-red-700 border-red-500 text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300'
                    }`}
                    onClick={toggleVideo}
                    title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>

                {isDoctor && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 border-2 border-green-400 text-white transition-all shadow-lg shadow-green-500/50"
                        onClick={handleCompleteAppointment}
                        disabled={isCompletingAppointment}
                        title="Hoàn thành cuộc tư vấn"
                    >
                        <CheckCircle className="h-5 w-5" />
                    </Button>
                )}

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 border-2 border-red-500 text-white transition-all"
                    onClick={leaveCall}
                    title="End call"
                >
                    <PhoneOff className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default VideoCall;
