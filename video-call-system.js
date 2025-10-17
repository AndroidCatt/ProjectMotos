// Video Call System - Sistema de Video Llamadas v11.0
// WebRTC, Screen Sharing, Video Support

class VideoCallSystem {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        this.callState = 'idle'; // idle, calling, in-call, ended
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.isScreenSharing = false;

        console.log('[VideoCall] System initialized');
    }

    // ============================================
    // MEDIA ACCESS
    // ============================================

    async requestMediaAccess(constraints = { video: true, audio: true }) {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('[VideoCall] Media access granted');
            return { success: true, stream: this.localStream };
        } catch (error) {
            console.error('[VideoCall] Media access denied:', error);
            return { success: false, error: error.message };
        }
    }

    async startScreenSharing() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });

            // Reemplazar track de video con la pantalla
            if (this.peerConnection) {
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = this.peerConnection
                    .getSenders()
                    .find(s => s.track && s.track.kind === 'video');

                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            }

            this.isScreenSharing = true;
            console.log('[VideoCall] Screen sharing started');

            // Detectar cuando se detenga
            screenStream.getVideoTracks()[0].onended = () => {
                this.stopScreenSharing();
            };

            return { success: true, stream: screenStream };
        } catch (error) {
            console.error('[VideoCall] Screen sharing failed:', error);
            return { success: false, error: error.message };
        }
    }

    async stopScreenSharing() {
        if (!this.isScreenSharing) return;

        // Volver a la cámara
        if (this.localStream && this.peerConnection) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            const sender = this.peerConnection
                .getSenders()
                .find(s => s.track && s.track.kind === 'video');

            if (sender && videoTrack) {
                await sender.replaceTrack(videoTrack);
            }
        }

        this.isScreenSharing = false;
        console.log('[VideoCall] Screen sharing stopped');
    }

    toggleVideo() {
        if (!this.localStream) return;

        this.isVideoEnabled = !this.isVideoEnabled;
        this.localStream.getVideoTracks().forEach(track => {
            track.enabled = this.isVideoEnabled;
        });

        console.log('[VideoCall] Video', this.isVideoEnabled ? 'enabled' : 'disabled');
        return this.isVideoEnabled;
    }

    toggleAudio() {
        if (!this.localStream) return;

        this.isAudioEnabled = !this.isAudioEnabled;
        this.localStream.getAudioTracks().forEach(track => {
            track.enabled = this.isAudioEnabled;
        });

        console.log('[VideoCall] Audio', this.isAudioEnabled ? 'enabled' : 'disabled');
        return this.isAudioEnabled;
    }

    // ============================================
    // PEER CONNECTION
    // ============================================

    async initiateCall(targetUserId) {
        try {
            // Obtener acceso a media
            const mediaResult = await this.requestMediaAccess();
            if (!mediaResult.success) {
                return { success: false, error: 'Media access denied' };
            }

            // Crear peer connection
            this.peerConnection = new RTCPeerConnection(this.configuration);

            // Agregar tracks locales
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            // Configurar event handlers
            this.setupPeerConnectionHandlers();

            // Crear oferta
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            this.callState = 'calling';

            // En producción, enviar oferta al otro peer via signaling server
            console.log('[VideoCall] Call initiated to:', targetUserId);

            return {
                success: true,
                offer: offer,
                targetUserId: targetUserId
            };
        } catch (error) {
            console.error('[VideoCall] Failed to initiate call:', error);
            return { success: false, error: error.message };
        }
    }

    async answerCall(offer) {
        try {
            // Obtener acceso a media
            const mediaResult = await this.requestMediaAccess();
            if (!mediaResult.success) {
                return { success: false, error: 'Media access denied' };
            }

            // Crear peer connection
            this.peerConnection = new RTCPeerConnection(this.configuration);

            // Agregar tracks locales
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            // Configurar event handlers
            this.setupPeerConnectionHandlers();

            // Establecer descripción remota (oferta)
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            // Crear respuesta
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            this.callState = 'in-call';

            console.log('[VideoCall] Call answered');

            return {
                success: true,
                answer: answer
            };
        } catch (error) {
            console.error('[VideoCall] Failed to answer call:', error);
            return { success: false, error: error.message };
        }
    }

    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            this.callState = 'in-call';
            console.log('[VideoCall] Answer received');
            return { success: true };
        } catch (error) {
            console.error('[VideoCall] Failed to handle answer:', error);
            return { success: false, error: error.message };
        }
    }

    async handleICECandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('[VideoCall] ICE candidate added');
            return { success: true };
        } catch (error) {
            console.error('[VideoCall] Failed to add ICE candidate:', error);
            return { success: false, error: error.message };
        }
    }

    setupPeerConnectionHandlers() {
        // ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // En producción, enviar candidate al otro peer via signaling server
                console.log('[VideoCall] ICE candidate:', event.candidate);
                this.emit('ice_candidate', event.candidate);
            }
        };

        // Remote stream
        this.peerConnection.ontrack = (event) => {
            console.log('[VideoCall] Remote track received');
            this.remoteStream = event.streams[0];
            this.emit('remote_stream', this.remoteStream);
        };

        // Connection state
        this.peerConnection.onconnectionstatechange = () => {
            console.log('[VideoCall] Connection state:', this.peerConnection.connectionState);
            this.emit('connection_state', this.peerConnection.connectionState);

            if (this.peerConnection.connectionState === 'disconnected') {
                this.endCall();
            }
        };

        // ICE connection state
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('[VideoCall] ICE state:', this.peerConnection.iceConnectionState);
        };
    }

    // ============================================
    // CALL MANAGEMENT
    // ============================================

    endCall() {
        // Detener tracks locales
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Cerrar peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.remoteStream = null;
        this.callState = 'ended';
        this.isScreenSharing = false;

        console.log('[VideoCall] Call ended');
        this.emit('call_ended');
    }

    getCallDuration() {
        // Implementar tracking de duración
        return 0;
    }

    // ============================================
    // RECORDING (Opcional)
    // ============================================

    startRecording() {
        if (!this.localStream) {
            return { success: false, error: 'No active stream' };
        }

        try {
            this.mediaRecorder = new MediaRecorder(this.localStream);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                this.emit('recording_available', { blob, url });
            };

            this.mediaRecorder.start();
            console.log('[VideoCall] Recording started');

            return { success: true };
        } catch (error) {
            console.error('[VideoCall] Recording failed:', error);
            return { success: false, error: error.message };
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            console.log('[VideoCall] Recording stopped');
            return { success: true };
        }
        return { success: false, error: 'No active recording' };
    }

    // ============================================
    // CALL HISTORY
    // ============================================

    saveCallToHistory(callData) {
        const history = this.loadCallHistory();
        const call = {
            id: 'call_' + Date.now(),
            targetUserId: callData.targetUserId,
            duration: callData.duration || 0,
            startTime: callData.startTime || Date.now(),
            endTime: Date.now(),
            type: callData.type || 'video', // video, audio
            status: callData.status || 'completed'
        };

        history.push(call);
        localStorage.setItem('call_history', JSON.stringify(history));

        return call;
    }

    loadCallHistory() {
        const saved = localStorage.getItem('call_history');
        return saved ? JSON.parse(saved) : [];
    }

    getCallHistory(limit = 50) {
        return this.loadCallHistory().slice(-limit).reverse();
    }

    // ============================================
    // QUALITY MONITORING
    // ============================================

    async getConnectionStats() {
        if (!this.peerConnection) {
            return null;
        }

        const stats = await this.peerConnection.getStats();
        const result = {
            video: { bitrate: 0, packetsLost: 0, fps: 0 },
            audio: { bitrate: 0, packetsLost: 0 }
        };

        stats.forEach(report => {
            if (report.type === 'inbound-rtp') {
                if (report.mediaType === 'video') {
                    result.video.bitrate = report.bytesReceived;
                    result.video.packetsLost = report.packetsLost;
                    result.video.fps = report.framesPerSecond || 0;
                } else if (report.mediaType === 'audio') {
                    result.audio.bitrate = report.bytesReceived;
                    result.audio.packetsLost = report.packetsLost;
                }
            }
        });

        return result;
    }

    // ============================================
    // EVENT EMITTER
    // ============================================

    emit(event, data) {
        window.dispatchEvent(new CustomEvent('videocall_' + event, { detail: data }));
    }

    on(event, callback) {
        window.addEventListener('videocall_' + event, (e) => callback(e.detail));
    }

    // ============================================
    // UTILITIES
    // ============================================

    async checkMediaDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return {
                cameras: devices.filter(d => d.kind === 'videoinput'),
                microphones: devices.filter(d => d.kind === 'audioinput'),
                speakers: devices.filter(d => d.kind === 'audiooutput')
            };
        } catch (error) {
            console.error('[VideoCall] Failed to enumerate devices:', error);
            return { cameras: [], microphones: [], speakers: [] };
        }
    }

    async switchCamera(deviceId) {
        if (!this.localStream) return { success: false };

        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } },
                audio: true
            });

            const videoTrack = newStream.getVideoTracks()[0];
            const sender = this.peerConnection
                .getSenders()
                .find(s => s.track && s.track.kind === 'video');

            if (sender) {
                await sender.replaceTrack(videoTrack);
            }

            // Detener track anterior
            this.localStream.getVideoTracks()[0].stop();

            // Actualizar stream
            this.localStream.removeTrack(this.localStream.getVideoTracks()[0]);
            this.localStream.addTrack(videoTrack);

            console.log('[VideoCall] Camera switched');
            return { success: true };
        } catch (error) {
            console.error('[VideoCall] Failed to switch camera:', error);
            return { success: false, error: error.message };
        }
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.VideoCallSystem = VideoCallSystem;
    window.videoCallSystem = new VideoCallSystem();
}
