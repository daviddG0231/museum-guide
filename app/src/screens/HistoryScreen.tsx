import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/appStore';

export function HistoryScreen() {
  const navigation = useNavigation();
  const { viewedArtifacts, clearHistory } = useAppStore();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Journey</Text>
        <TouchableOpacity onPress={clearHistory}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{viewedArtifacts.length}</Text>
          <Text style={styles.statLabel}>Artifacts Seen</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.round(viewedArtifacts.length * 1.5)}
          </Text>
          <Text style={styles.statLabel}>Minutes Explored</Text>
        </View>
      </View>

      {/* List */}
      {viewedArtifacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🏛️</Text>
          <Text style={styles.emptyText}>
            Your journey begins when you scan your first artifact
          </Text>
        </View>
      ) : (
        <FlatList
          data={viewedArtifacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.historyItem}>
              <View style={styles.historyNumber}>
                <Text style={styles.historyNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>{item.name}</Text>
                <Text style={styles.historyMeta}>
                  {item.category} • {item.dynasty}
                </Text>
              </View>
              <TouchableOpacity style={styles.replayButton}>
                <Text style={styles.replayIcon}>🔄</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    color: '#c9a227',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    color: '#888',
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#252542',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#444',
  },
  statNumber: {
    color: '#c9a227',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  list: {
    padding: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252542',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  historyNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3d3d6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyNumberText: {
    color: '#c9a227',
    fontWeight: 'bold',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  historyMeta: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  replayButton: {
    padding: 10,
  },
  replayIcon: {
    fontSize: 20,
  },
});
