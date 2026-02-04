import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { RootStackParamList } from '../../App';
import { NarrationOverlay } from '../components/NarrationOverlay';
import { DetectionIndicator } from '../components/DetectionIndicator';
import { ChatInput } from '../components/ChatInput';
import { useDetection } from '../hooks/useDetection';
import { useNarration } from '../hooks/useNarration';
import { useAppStore } from '../store/appStore';
import { DetectionService } from '../services/DetectionService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

export function CameraScreen() {
  const navigation = useNavigation<NavigationProp>();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isListening, setIsListening] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const { isDetecting, detectedArtifact, boundingBox } = useDetection(cameraRef);
  const { isPlaying, isLoading, currentNarration, progress, startNarration, togglePlayback, requestMore } = useNarration();
  const { addToHistory } = useAppStore();

  // Initialize and check demo mode
  useEffect(() => {
    DetectionService.initialize().then(() => {
      setIsDemoMode(DetectionService.isDemoMode());
    });
  }, []);

  // Auto-start narration when artifact is detected
  useEffect(() => {
    if (detectedArtifact && !isLoading) {
      startNarration(detectedArtifact);
      addToHistory(
        detectedArtifact.id,
        detectedArtifact.name,
        detectedArtifact.category,
        detectedArtifact.dynasty
      );
    }
  }, [detectedArtifact?.id]);

  // Handle text/voice query
  const handleQuery = useCallback(async (text: string) => {
    console.log('User query:', text);
    // Search for artifact by name
    const artifact = await DetectionService.searchByQuery(text);
    if (artifact) {
      startNarration(artifact);
      addToHistory(artifact.id, artifact.name, artifact.category, artifact.dynasty);
    }
  }, [startNarration, addToHistory]);

  const handleVoiceStart = useCallback(() => {
    setIsListening(true);
    // TODO: Start speech recognition
  }, []);

  const handleVoiceEnd = useCallback(() => {
    setIsListening(false);
    // TODO: Stop speech recognition and process
  }, []);

  // Permission handling
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={['#0f0f1a', '#1a1a2e', '#16213e']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.permissionContent}>
          <Text style={styles.permissionEmoji}>📸</Text>
          <Text style={styles.permissionTitle}>Camera Access</Text>
          <Text style={styles.permissionText}>
            We need camera access to recognize artifacts and bring them to life
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <LinearGradient
              colors={['#c9a227', '#daa520', '#c9a227']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.permissionButtonGradient}
            >
              <Text style={styles.permissionButtonText}>Enable Camera</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Top Gradient Overlay */}
        <LinearGradient
          colors={['rgba(15,15,26,0.8)', 'transparent']}
          style={styles.topGradient}
        />

        {/* Bottom Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(15,15,26,0.95)']}
          style={styles.bottomGradient}
        />

        {/* Detection Indicator */}
        <DetectionIndicator
          isDetecting={isDetecting}
          boundingBox={boundingBox}
          artifactName={detectedArtifact?.name}
        />
      </CameraView>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('History')}
        >
          <BlurView intensity={40} tint="dark" style={styles.iconButtonBlur}>
            <Text style={styles.iconText}>📜</Text>
          </BlurView>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Museum Guide</Text>
          <Text style={styles.subtitleText}>
            {isDemoMode ? '🎭 Demo Mode' : 'Grand Egyptian Museum'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <BlurView intensity={40} tint="dark" style={styles.iconButtonBlur}>
            <Text style={styles.iconText}>⚙️</Text>
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Narration Overlay */}
        <NarrationOverlay
          artifact={detectedArtifact}
          narration={currentNarration}
          isPlaying={isPlaying}
          progress={progress}
          onTogglePlayback={togglePlayback}
          onRequestMore={requestMore}
        />

        {/* Chat Input */}
        <ChatInput
          onSend={handleQuery}
          onVoiceStart={handleVoiceStart}
          onVoiceEnd={handleVoiceEnd}
          isListening={isListening}
          placeholder={
            detectedArtifact
              ? `Ask about ${detectedArtifact.name}...`
              : "Type artifact name or ask a question..."
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  camera: {
    flex: 1,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    padding: 40,
  },
  permissionEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  permissionTitle: {
    color: '#c9a227',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  permissionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  iconButtonBlur: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.2)',
  },
  iconText: {
    fontSize: 20,
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitleText: {
    color: '#c9a227',
    fontSize: 12,
    marginTop: 2,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
