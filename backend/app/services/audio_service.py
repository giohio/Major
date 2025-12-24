import os
import torch
import librosa
import whisper
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
from pathlib import Path

class AudioService:
    """
    Service for audio processing:
    - Speech-to-Text (Whisper)
    - Emotion detection from audio (your trained model)
    """
    
    def __init__(self, audio_model_path=None):
        # Initialize Whisper for STT
        print("Loading Whisper model...")
        self.whisper_model = whisper.load_model("base")  # ~140MB
        print("✓ Whisper loaded")
        
        # Initialize your audio emotion model
        self.audio_model = None
        self.feature_extractor = None
        
        if audio_model_path and os.path.exists(audio_model_path):
            try:
                print(f"Loading audio emotion model from {audio_model_path}...")
                self.audio_model = AutoModelForAudioClassification.from_pretrained(
                    audio_model_path
                ).to("cuda" if torch.cuda.is_available() else "cpu").eval()
                
                self.feature_extractor = AutoFeatureExtractor.from_pretrained(
                    "facebook/wav2vec2-base"
                )
                print("✓ Audio emotion model loaded")
            except Exception as e:
                print(f"⚠ Could not load audio model: {e}")
        else:
            print("⚠ Audio emotion model path not provided or doesn't exist")
    
    def transcribe(self, audio_path: str) -> dict:
        """
        Convert audio to text using Whisper
        
        Args:
            audio_path: Path to audio file (.webm, .mp3, .wav, etc.)
            
        Returns:
            {
                'text': str,
                'language': str,
                'confidence': float
            }
        """
        try:
            result = self.whisper_model.transcribe(
                audio_path,
                language="vi",  # Vietnamese
                fp16=False  # Use CPU-friendly mode
            )
            
            return {
                'text': result['text'].strip(),
                'language': result.get('language', 'vi'),
                'confidence': 0.9
            }
        except Exception as e:
            print(f"Transcription error: {e}")
            return {
                'text': '',
                'language': 'vi',
                'confidence': 0.0,
                'error': str(e)
            }
    
    def detect_emotion_from_audio(self, audio_path: str) -> dict:
        """
        Detect emotion from audio using your trained model
        """
        if not self.audio_model:
            return {
                'emotion': 'neutral',
                'confidence': 0.0,
                'error': 'Audio model not loaded'
            }
        
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=16000, mono=True)
            
            # Extract features
            inputs = self.feature_extractor(
                audio,
                sampling_rate=16000,
                return_tensors="pt",
                padding=True
            )
            
            # Move to device
            device = next(self.audio_model.parameters()).device
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            # Predict
            with torch.no_grad():
                logits = self.audio_model(**inputs).logits
                probs = torch.nn.functional.softmax(logits, dim=-1)[0]
                
                # Get top emotion
                confidence, idx = torch.max(probs, dim=-1)
                
                # Emotion labels
                emotions = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]
                emotion = emotions[idx.item()]
                
                # Get all scores
                all_scores = {emotions[i]: float(probs[i]) for i in range(len(emotions))}
            
            return {
                'emotion': emotion,
                'confidence': float(confidence),
                'all_scores': all_scores
            }
            
        except Exception as e:
            print(f"Emotion detection error: {e}")
            return {
                'emotion': 'neutral',
                'confidence': 0.0,
                'error': str(e)
            }
    
    def process_audio_message(self, audio_path: str) -> dict:
        """
        Complete audio processing pipeline
        """
        # Step 1: Transcribe
        transcription = self.transcribe(audio_path)
        
        # Step 2: Detect emotion
        emotion_result = self.detect_emotion_from_audio(audio_path)
        
        return {
            'text': transcription['text'],
            'emotion': emotion_result['emotion'],
            'text_confidence': transcription['confidence'],
            'emotion_confidence': emotion_result['confidence'],
            'all_emotion_scores': emotion_result.get('all_scores', {}),
            'language': transcription.get('language', 'vi')
        }


# Singleton instance
_audio_service = None

def get_audio_service(audio_model_path=None):
    """Get or create AudioService instance"""
    global _audio_service
    if _audio_service is None:
        _audio_service = AudioService(audio_model_path)
    return _audio_service
