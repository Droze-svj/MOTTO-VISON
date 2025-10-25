import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useMediaSearch from '../hooks/useMediaSearch';
import useMediaAnalytics from '../hooks/useMediaAnalytics';
import DraggableFlatList from 'react-native-draggable-flatlist';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Image as ExpoImage } from 'expo-image';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const ITEM_HEIGHT = ITEM_WIDTH * 0.6;

const MediaCollectionsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    searchResults,
    isLoading: isSearchLoading,
    searchMedia,
  } = useMediaSearch({
    pageSize: 20,
    enableCache: true,
  });

  const { trackEngagement } = useMediaAnalytics({
    mediaId: selectedCollection?.id,
  });

  const handleCreateCollection = useCallback(async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    try {
      setIsLoading(true);
      // API call to create collection
      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName,
        description: newCollectionDescription,
        media: [],
        createdAt: new Date().toISOString(),
      };

      setCollections([...collections, newCollection]);
      setShowCreateModal(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setIsLoading(false);
    }
  }, [newCollectionName, newCollectionDescription, collections]);

  const handleAddMedia = useCallback(async (media) => {
    if (!selectedCollection) return;

    try {
      setIsLoading(true);
      // API call to add media to collection
      const updatedCollection = {
        ...selectedCollection,
        media: [...selectedCollection.media, media],
      };

      setCollections(
        collections.map((c) =>
          c.id === selectedCollection.id ? updatedCollection : c
        )
      );
      setShowAddMediaModal(false);
      await trackEngagement('add_to_collection', { mediaId: media.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to add media to collection');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollection, collections, trackEngagement]);

  const handleRemoveMedia = useCallback(async (mediaId) => {
    if (!selectedCollection) return;

    try {
      setIsLoading(true);
      // API call to remove media from collection
      const updatedCollection = {
        ...selectedCollection,
        media: selectedCollection.media.filter((m) => m.id !== mediaId),
      };

      setCollections(
        collections.map((c) =>
          c.id === selectedCollection.id ? updatedCollection : c
        )
      );
      await trackEngagement('remove_from_collection', { mediaId });
    } catch (error) {
      Alert.alert('Error', 'Failed to remove media from collection');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollection, collections, trackEngagement]);

  const handleReorderMedia = useCallback(async ({ data }) => {
    if (!selectedCollection) return;

    try {
      setIsLoading(true);
      // API call to reorder media in collection
      const updatedCollection = {
        ...selectedCollection,
        media: data,
      };

      setCollections(
        collections.map((c) =>
          c.id === selectedCollection.id ? updatedCollection : c
        )
      );
      await trackEngagement('reorder_collection', {
        collectionId: selectedCollection.id,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to reorder media in collection');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollection, collections, trackEngagement]);

  const renderCollectionItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.collectionItem, { backgroundColor: colors.card }]}
      onPress={() => setSelectedCollection(item)}
    >
      <View style={styles.collectionPreview}>
        {item.media.length > 0 ? (
          <ExpoImage
            source={{ uri: item.media[0].preview }}
            style={styles.collectionImage}
            contentFit='cover'
            transition={300}
            cachePolicy='memory-disk'
          />
        ) : (
          <View style={[styles.emptyCollection, { backgroundColor: colors.border }]}>
            <Ionicons name="images-outline" size={40} color={colors.text} />
          </View>
        )}
        {item.media.length > 1 && (
          <View style={styles.mediaCount}>
            <Text style={styles.mediaCountText}>+{item.media.length - 1}</Text>
          </View>
        )}
      </View>
      <View style={styles.collectionInfo}>
        <Text style={[styles.collectionName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.collectionDescription, { color: colors.text }]}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  ), [colors]);

  const renderMediaItem = useCallback(({ item, drag, isActive }) => (
    <TouchableOpacity
      style={[
        styles.mediaItem,
        { backgroundColor: isActive ? colors.primary : colors.card },
      ]}
      onLongPress={drag}
    >
      <ExpoImage
        source={{ uri: item.preview }}
        style={styles.mediaImage}
        contentFit='cover'
        transition={300}
        cachePolicy='memory-disk'
      />
      <View style={styles.mediaInfo}>
        <Text
          style={[
            styles.mediaName,
            { color: isActive ? '#fff' : colors.text },
          ]}
        >
          {item.filename}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveMedia(item.id)}
        >
          <Ionicons
            name="close-circle"
            size={24}
            color={isActive ? '#fff' : colors.error}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [colors, handleRemoveMedia]);

  if (isLoading && (!collections.length || (selectedCollection && !selectedCollection.media.length))) {
    return (
      <View style={styles.container}>
        <SkeletonLoader rows={selectedCollection ? 6 : 4} height={selectedCollection ? 60 : 40} style={{ marginBottom: 12 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!selectedCollection ? (
        <>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              My Collections
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={collections}
            renderItem={renderCollectionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.collectionsList}
          />
        </>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedCollection(null)}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {selectedCollection.name}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddMediaModal(true)}
            >
              <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <DraggableFlatList
            data={selectedCollection.media}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.id}
            onDragEnd={handleReorderMedia}
            contentContainerStyle={styles.mediaList}
          />
        </>
      )}

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create New Collection
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Collection Name"
              placeholderTextColor={colors.text}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.text}
              value={newCollectionDescription}
              onChangeText={setNewCollectionDescription}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateCollection}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddMediaModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMediaModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Media to Collection
            </Text>
            <FlatList
              data={searchResults}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.searchItem, { backgroundColor: colors.background }]}
                  onPress={() => handleAddMedia(item)}
                >
                  <ExpoImage
                    source={{ uri: item.preview }}
                    style={styles.searchItemImage}
                    contentFit='cover'
                    transition={300}
                    cachePolicy='memory-disk'
                  />
                  <Text style={[styles.searchItemText, { color: colors.text }]}>
                    {item.filename}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.searchList}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddMediaModal(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  createButton: {
    padding: 8,
    borderRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  collectionsList: {
    padding: 15,
  },
  collectionItem: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  collectionPreview: {
    width: '100%',
    height: ITEM_HEIGHT * 0.7,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  emptyCollection: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaCount: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 5,
    borderRadius: 15,
  },
  mediaCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  collectionInfo: {
    padding: 10,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  collectionDescription: {
    fontSize: 14,
  },
  mediaList: {
    padding: 15,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mediaImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  mediaInfo: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mediaName: {
    fontSize: 16,
    flex: 1,
  },
  removeButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchList: {
    maxHeight: 400,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  searchItemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  searchItemText: {
    fontSize: 16,
    flex: 1,
  },
});

export default MediaCollectionsScreen; 