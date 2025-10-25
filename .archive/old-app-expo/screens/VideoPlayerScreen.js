import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import useMediaProcessing from '../hooks/useMediaProcessing';
import { colors } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { videoUri } = route.params;
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [selectedQuality, setSelectedQuality] = useState('auto');

  const videoRef = useRef(null);
  const controlsTimeout = useRef(null);

  const {
    processing,
    error,
    generateVideoThumbnail,
    extractMediaMetadata,
  } = useMediaProcessing();

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const handleLoad = (data) => {
    setDuration(data.duration);
  };

  const handleBuffer = (data) => {
    setIsBuffering(data.isBuffering);
  };

  const handleSeek = (value) => {
    videoRef.current?.seek(value);
    setCurrentTime(value);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePlaybackRate = () => {
    const rates = [0.5, 1.0, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const handleQuality = () => {
    const qualities = ['auto', '1080p', '720p', '480p', '360p'];
    const currentIndex = qualities.indexOf(selectedQuality);
    const nextIndex = (currentIndex + 1) % qualities.length;
    setSelectedQuality(qualities[nextIndex]);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s]
      .map((v) => (v < 10 ? '0' + v : v))
      .filter((v, i) => v !== '00' || i > 0)
      .join(':');
  };

  const renderControls = () => {
    if (!showControls) return null;

    return (
      <View style={styles.controls}>
        <View style={styles.progressContainer}>
          <Text style={[styles.timeText, { color: theme.text }]}>
            {formatTime(currentTime)}
          </Text>
          <Slider
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onValueChange={handleSeek}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.border}
            thumbTintColor={theme.primary}
          />
          <Text style={[styles.timeText, { color: theme.text }]}>
            {formatTime(duration)}
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}
          >
            <Icon
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={32}
              color={theme.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlaybackRate}
          >
            <Text style={[styles.rateText, { color: theme.text }]}>
              {playbackRate}x
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleQuality}
          >
            <Text style={[styles.qualityText, { color: theme.text }]}>
              {selectedQuality}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleFullscreen}
          >
            <Icon
              name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => {
          setShowControls(!showControls);
          if (showControls) {
            controlsTimeout.current = setTimeout(() => {
              setShowControls(false);
            }, 3000);
          } else if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
          }
        }}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={[styles.video, isFullscreen && styles.fullscreenVideo]}
          resizeMode="contain"
          paused={!isPlaying}
          rate={playbackRate}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onBuffer={handleBuffer}
          repeat={false}
          controls={false}
        />

        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}

        {renderControls()}
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (9 / 16),
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  controls: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  timeText: {
    fontSize: 12,
    width: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  controlButton: {
    padding: 10,
  },
  rateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  qualityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    margin: 10,
  },
});

export default VideoPlayerScreen; 