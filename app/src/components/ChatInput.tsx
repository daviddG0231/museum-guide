import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface Props {
  onSend: (text: string) => void;
  onVoiceStart: () => void;
  onVoiceEnd: () => void;
  isListening: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onVoiceStart,
  onVoiceEnd,
  isListening,
  placeholder = "Ask about this artifact...",
}: Props) {
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      Keyboard.dismiss();
      setIsExpanded(false);
    }
  };

  const handleMicPress = () => {
    if (isListening) {
      onVoiceEnd();
    } else {
      onVoiceStart();
    }
  };

  return (
    <View style={styles.wrapper}>
      <BlurView intensity={80} tint="dark" style={styles.container}>
        {/* Text Input */}
        <TouchableOpacity
          style={styles.inputWrapper}
          activeOpacity={0.9}
          onPress={() => {
            setIsExpanded(true);
            inputRef.current?.focus();
          }}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.4)"
            onFocus={() => setIsExpanded(true)}
            onBlur={() => !text && setIsExpanded(false)}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
        </TouchableOpacity>

        {/* Voice / Send Button */}
        {text.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <View style={styles.sendIcon}>
              <View style={styles.sendArrow} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={handleMicPress}
          >
            <Animated.View
              style={[
                styles.micIcon,
                { transform: [{ scale: pulseAnim }] },
                isListening && styles.micIconActive,
              ]}
            >
              <View style={styles.micHead} />
              <View style={styles.micBody} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.3)',
  },
  inputWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    padding: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#c9a227',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  sendIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1a1a2e',
    transform: [{ rotate: '90deg' }],
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  micButtonActive: {
    backgroundColor: '#c9a227',
  },
  micIcon: {
    alignItems: 'center',
  },
  micIconActive: {
    // Active state styling
  },
  micHead: {
    width: 10,
    height: 14,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  micBody: {
    width: 16,
    height: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#fff',
    marginTop: -2,
  },
});
