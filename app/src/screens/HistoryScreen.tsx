import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store/appStore';
import { HistoryEntry } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

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
  };
  return emojis[category] || '🏛️';
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { viewedArtifacts, clearHistory } = useAppStore();

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <TouchableOpacity style={styles.historyItem}>
      <BlurView intensity={30} tint="dark" style={styles.itemBlur}>
        <Text style={styles.itemEmoji}>{getCategoryEmoji(item.category)}</Text>
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.itemMeta}>
            {item.dynasty && (
              <Text style={styles.itemDynasty}>{item.dynasty}</Text>
            )}
            <Text style={styles.itemTime}>{formatDate(item.viewedAt)}</Text>
          </View>
        </View>
        <Text style={styles.itemArrow}>›</Text>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f1a', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Your Journey</Text>
          
          {viewedArtifacts.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <BlurView intensity={40} tint="dark" style={styles.statsBlur}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{viewedArtifacts.length}</Text>
              <Text style={styles.statLabel}>Artifacts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {new Set(viewedArtifacts.map(a => a.category)).size}
              </Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.ceil(viewedArtifacts.reduce((sum, a) => sum + (a.duration || 60), 0) / 60)}
              </Text>
              <Text style={styles.statLabel}>Min Listened</Text>
            </View>
          </BlurView>
        </View>

        {/* History List */}
        {viewedArtifacts.length > 0 ? (
          <FlatList
            data={viewedArtifacts}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.id}-${item.viewedAt}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏛️</Text>
            <Text style={styles.emptyTitle}>No artifacts yet</Text>
            <Text style={styles.emptyText}>
              Point your camera at artifacts to start your journey through history
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={['#c9a227', '#daa520']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Start Exploring</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#c9a227',
    fontSize: 36,
    fontWeight: '300',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    color: '#c9a227',
    fontSize: 16,
  },
  statsBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsBlur: {
    flexDirection: 'row',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.2)',
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#c9a227',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  historyItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  itemEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemDynasty: {
    color: '#c9a227',
    fontSize: 12,
  },
  itemTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  itemArrow: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingHorizontal: 30,
    paddingVertical: 14,
  },
  startButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
