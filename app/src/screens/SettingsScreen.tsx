import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store/appStore';
import { StoryMode, Language } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const STORY_MODES: { value: StoryMode; label: string; desc: string; emoji: string }[] = [
  { value: 'quick', label: 'Quick', desc: '15-30 seconds', emoji: '⚡' },
  { value: 'standard', label: 'Standard', desc: '1-2 minutes', emoji: '📖' },
  { value: 'deep', label: 'Deep Dive', desc: '3-5 minutes', emoji: '🔬' },
  { value: 'kids', label: 'Kids Mode', desc: 'Simple & fun', emoji: '🧒' },
];

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ar', label: 'العربية', flag: '🇪🇬' },
];

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { settings, updateSettings } = useAppStore();

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
          
          <Text style={styles.title}>Settings</Text>
          
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Story Mode */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Story Mode</Text>
            <Text style={styles.sectionDesc}>
              Choose how detailed you want the narrations
            </Text>
            
            <View style={styles.modeGrid}>
              {STORY_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.value}
                  style={[
                    styles.modeCard,
                    settings.storyMode === mode.value && styles.modeCardActive,
                  ]}
                  onPress={() => updateSettings({ storyMode: mode.value })}
                >
                  <BlurView
                    intensity={settings.storyMode === mode.value ? 60 : 30}
                    tint="dark"
                    style={[
                      styles.modeCardBlur,
                      settings.storyMode === mode.value && styles.modeCardBlurActive,
                    ]}
                  >
                    <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                    <Text style={styles.modeLabel}>{mode.label}</Text>
                    <Text style={styles.modeDesc}>{mode.desc}</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Language */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language</Text>
            
            <View style={styles.languageRow}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  style={[
                    styles.languageButton,
                    settings.language === lang.value && styles.languageButtonActive,
                  ]}
                  onPress={() => updateSettings({ language: lang.value })}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[
                    styles.languageLabel,
                    settings.language === lang.value && styles.languageLabelActive,
                  ]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Toggles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Auto-play narration</Text>
                <Text style={styles.toggleDesc}>Start speaking automatically</Text>
              </View>
              <Switch
                value={settings.autoPlay}
                onValueChange={(value) => updateSettings({ autoPlay: value })}
                trackColor={{ false: '#333', true: '#c9a227' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Haptic feedback</Text>
                <Text style={styles.toggleDesc}>Vibrate on detection</Text>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(value) => updateSettings({ hapticFeedback: value })}
                trackColor={{ false: '#333', true: '#c9a227' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Offline mode</Text>
                <Text style={styles.toggleDesc}>Use downloaded data only</Text>
              </View>
              <Switch
                value={settings.offlineMode}
                onValueChange={(value) => updateSettings({ offlineMode: value })}
                trackColor={{ false: '#333', true: '#c9a227' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.aboutCard}>
              <BlurView intensity={30} tint="dark" style={styles.aboutBlur}>
                <Text style={styles.aboutLogo}>🏛️</Text>
                <Text style={styles.aboutName}>Museum Guide</Text>
                <Text style={styles.aboutVersion}>Version 0.1.0</Text>
                <Text style={styles.aboutCredit}>Built by David</Text>
              </BlurView>
            </View>
          </View>
        </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#c9a227',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginBottom: 16,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modeCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modeCardActive: {},
  modeCardBlur: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  modeCardBlurActive: {
    borderColor: '#c9a227',
  },
  modeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  modeLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modeDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  languageButtonActive: {
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    borderColor: '#c9a227',
  },
  languageFlag: {
    fontSize: 24,
  },
  languageLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  languageLabelActive: {
    color: '#c9a227',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  toggleDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  aboutCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  aboutBlur: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  aboutLogo: {
    fontSize: 48,
    marginBottom: 12,
  },
  aboutName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aboutVersion: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginBottom: 8,
  },
  aboutCredit: {
    color: '#c9a227',
    fontSize: 14,
  },
});
