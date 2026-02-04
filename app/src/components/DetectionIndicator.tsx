import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  isDetecting: boolean;
  boundingBox: BoundingBox | null;
  artifactName?: string;
}

export function DetectionIndicator({ isDetecting, boundingBox, artifactName }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation when detecting
  useEffect(() => {
    if (isDetecting && !boundingBox) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Slow rotation for scanning effect
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [isDetecting, boundingBox]);

  // Fade in/out bounding box
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: boundingBox ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [boundingBox]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      {/* Scanning frame in center when no detection */}
      {!boundingBox && (
        <View style={styles.centerIndicator}>
          <Animated.View
            style={[
              styles.scanFrame,
              {
                transform: [{ scale: pulseAnim }],
                opacity: isDetecting ? 1 : 0.6,
              },
            ]}
          >
            {/* Corner brackets */}
            <View style={[styles.corner, styles.topLeft]}>
              <LinearGradient
                colors={['#c9a227', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cornerH}
              />
              <LinearGradient
                colors={['#c9a227', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cornerV}
              />
            </View>
            <View style={[styles.corner, styles.topRight]}>
              <LinearGradient
                colors={['transparent', '#c9a227']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cornerH}
              />
              <LinearGradient
                colors={['#c9a227', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.cornerV, { right: 0 }]}
              />
            </View>
            <View style={[styles.corner, styles.bottomLeft]}>
              <LinearGradient
                colors={['#c9a227', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cornerH}
              />
              <LinearGradient
                colors={['transparent', '#c9a227']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cornerV}
              />
            </View>
            <View style={[styles.corner, styles.bottomRight]}>
              <LinearGradient
                colors={['transparent', '#c9a227']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cornerH}
              />
              <LinearGradient
                colors={['transparent', '#c9a227']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.cornerV, { right: 0 }]}
              />
            </View>

            {/* Center crosshair */}
            <Animated.View 
              style={[
                styles.crosshairContainer,
                { transform: [{ rotate }] }
              ]}
            >
              <View style={styles.crosshairH} />
              <View style={styles.crosshairV} />
            </Animated.View>
          </Animated.View>
        </View>
      )}

      {/* Bounding box around detected artifact */}
      {boundingBox && (
        <Animated.View
          style={[
            styles.boundingBox,
            {
              left: boundingBox.x * SCREEN_WIDTH,
              top: boundingBox.y * SCREEN_HEIGHT,
              width: boundingBox.width * SCREEN_WIDTH,
              height: boundingBox.height * SCREEN_HEIGHT,
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Glowing border effect */}
          <View style={styles.glowBorder} />
          
          {/* Corner accents */}
          <View style={[styles.boxCorner, styles.boxTopLeft]} />
          <View style={[styles.boxCorner, styles.boxTopRight]} />
          <View style={[styles.boxCorner, styles.boxBottomLeft]} />
          <View style={[styles.boxCorner, styles.boxBottomRight]} />
          
          {/* Label */}
          {artifactName && (
            <View style={styles.labelContainer}>
              <LinearGradient
                colors={['#c9a227', '#daa520']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.labelGradient}
              >
                <Text style={styles.label} numberOfLines={1}>
                  {artifactName}
                </Text>
              </LinearGradient>
            </View>
          )}
        </Animated.View>
      )}

      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: boundingBox ? '#4CAF50' : isDetecting ? '#c9a227' : '#666' },
            ]}
          />
          <Text style={styles.statusText}>
            {boundingBox ? '✨ Artifact detected' : isDetecting ? 'Scanning...' : 'Ready'}
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  centerIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  cornerH: {
    position: 'absolute',
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  cornerV: {
    position: 'absolute',
    width: 3,
    height: 40,
    borderRadius: 2,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  crosshairContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
  },
  crosshairH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(201, 162, 39, 0.5)',
  },
  crosshairV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(201, 162, 39, 0.5)',
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#c9a227',
    borderRadius: 12,
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: 'rgba(201, 162, 39, 0.3)',
    borderRadius: 12,
    margin: -4,
  },
  boxCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#c9a227',
  },
  boxTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  boxTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  boxBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  boxBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  labelContainer: {
    position: 'absolute',
    top: -36,
    left: 0,
    right: 0,
    alignItems: 'flex-start',
  },
  labelGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  label: {
    color: '#1a1a2e',
    fontWeight: 'bold',
    fontSize: 13,
  },
  statusContainer: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
});
