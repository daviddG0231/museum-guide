import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/appStore';

export function SettingsScreen() {
  const navigation = useNavigation();
  const { settings, updateSettings } = useAppStore();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Story Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Story Mode</Text>
          <StoryModeOption
            title="Quick"
            description="15-30 seconds, just the highlights"
            selected={settings.storyMode === 'quick'}
            onPress={() => updateSettings({ storyMode: 'quick' })}
          />
          <StoryModeOption
            title="Standard"
            description="1-2 minutes, the full story"
            selected={settings.storyMode === 'standard'}
            onPress={() => updateSettings({ storyMode: 'standard' })}
          />
          <StoryModeOption
            title="Deep Dive"
            description="3-5 minutes, all the details"
            selected={settings.storyMode === 'deep'}
            onPress={() => updateSettings({ storyMode: 'deep' })}
          />
          <StoryModeOption
            title="Kids Mode"
            description="Fun and simple explanations"
            selected={settings.storyMode === 'kids'}
            onPress={() => updateSettings({ storyMode: 'kids' })}
          />
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <LanguageOption
            title="English"
            selected={settings.language === 'en'}
            onPress={() => updateSettings({ language: 'en' })}
          />
          <LanguageOption
            title="العربية"
            selected={settings.language === 'ar'}
            onPress={() => updateSettings({ language: 'ar' })}
          />
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingRow
            title="Auto-play narration"
            value={settings.autoPlay}
            onToggle={(v) => updateSettings({ autoPlay: v })}
          />
          <SettingRow
            title="Vibrate on detection"
            value={settings.hapticFeedback}
            onToggle={(v) => updateSettings({ hapticFeedback: v })}
          />
          <SettingRow
            title="Offline mode"
            value={settings.offlineMode}
            onToggle={(v) => updateSettings({ offlineMode: v })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function StoryModeOption({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
    >
      <View>
        <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
          {title}
        </Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

function LanguageOption({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
    >
      <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
        {title}
      </Text>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

function SettingRow({
  title,
  value,
  onToggle,
}: {
  title: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#444', true: '#c9a227' }}
        thumbColor="#fff"
      />
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
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#c9a227',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#252542',
    borderRadius: 10,
    marginBottom: 10,
  },
  optionSelected: {
    backgroundColor: '#3d3d6b',
    borderColor: '#c9a227',
    borderWidth: 1,
  },
  optionTitle: {
    color: '#fff',
    fontSize: 16,
  },
  optionTitleSelected: {
    color: '#c9a227',
  },
  optionDescription: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  checkmark: {
    color: '#c9a227',
    fontSize: 18,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
  },
});
