import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Artifact, Narration } from '../types';

interface Props {
  artifact: Artifact | null;
  narration: Narration | null;
  isPlaying: boolean;
  progress: number;
  onTogglePlayback: () => void;
  onRequestMore: () => void;
}

export function NarrationOverlay({
  artifact,
  narration,
  isPlaying,
  progress,
  onTogglePlayback,
  onRequestMore,
}: Props) {
  if (!artifact) {
    return (
      <View style={styles.scanPrompt}>
        <BlurView intensity={60} tint="dark" style={styles.scanPromptBlur}>
          <View style={styles.scanDot} />
          <Text style={styles.scanPromptText}>Point at an artifact to begin</Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Artifact Info Card */}
      <BlurView intensity={80} tint="dark" style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryEmoji(artifact.category)} {formatCategory(artifact.category)}
            </Text>
          </View>
          {artifact.dynasty && (
            <Text style={styles.dynastyText}>{artifact.dynasty}</Text>
          )}
        </View>

        <Text style={styles.artifactName}>{artifact.name}</Text>
        
        {artifact.period && (
          <Text style={styles.artifactPeriod}>{artifact.period}</Text>
        )}

        {/* Progress Bar */}
        {narration && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#c9a227', '#daa520']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.progressText}>
                {formatTime(narration.currentTime)}
              </Text>
              <Text style={styles.progressText}>
                {formatTime(narration.duration)}
              </Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonIcon}>⏮️</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.playButton} 
            onPress={onTogglePlayback}
          >
            <LinearGradient
              colors={['#c9a227', '#daa520', '#c9a227']}
              style={styles.playButtonGradient}
            >
              <Text style={styles.playButtonIcon}>
                {isPlaying ? '⏸️' : '▶️'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onRequestMore}>
            <Text style={styles.secondaryButtonIcon}>🔄</Text>
            <Text style={styles.secondaryButtonLabel}>More</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonIcon}>⭐</Text>
            <Text style={styles.secondaryButtonLabel}>Save</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    funerary_mask: '🎭',
    statue: '🗿',
    sarcophagus: '⚰️',
    canopic: '🏺',
    jewelry: '💎',
    papyrus: '📜',
    stele: '🪨',
    mummy: '🧟',
    amulet: '🔮',
    scarab: '🪲',
    ushabti: '👤',
    vessel: '🫖',
    weapon: '⚔️',
    furniture: '🪑',
    relief: '🖼️',
  };
  return emojis[category] || '🏛️';
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scanPrompt: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  scanPromptBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.2)',
  },
  scanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c9a227',
    marginRight: 10,
  },
  scanPromptText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
  },
  infoCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.2)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#c9a227',
    fontSize: 12,
    fontWeight: '600',
  },
  dynastyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  artifactName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artifactPeriod: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonIcon: {
    fontSize: 24,
  },
  secondaryButton: {
    alignItems: 'center',
    padding: 8,
  },
  secondaryButtonIcon: {
    fontSize: 20,
  },
  secondaryButtonLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 4,
  },
});
