import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Share,
  Platform,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import useApi from '../hooks/useApi';
import useFileUpload from '../hooks/useFileUpload';
import useOfflineStorage from '../hooks/useOfflineStorage';
import { colors } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WebView from 'react-native-webview';
import SkeletonLoader from '../components/common/SkeletonLoader';

const CATEGORIES = [
  'All',
  'Documents',
  'Images',
  'Videos',
  'Audio',
  'Archives',
];

const DocumentManagementScreen = () => {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPreview, setShowPreview] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState(null);

  const { request } = useApi({
    baseUrl: 'https://your-api.com',
    enableCache: true,
  });

  const {
    isOnline,
    isSyncing,
    createOffline,
    updateOffline,
    deleteOffline,
    getAllOfflineData,
  } = useOfflineStorage({
    entityName: 'documents',
    syncEndpoint: '/documents',
    onSyncComplete: () => {
      loadDocuments();
    },
    onSyncError: (error) => {
      Alert.alert('Sync Error', error.message);
    },
  });

  const {
    uploading,
    progress,
    error: uploadError,
    pickDocument,
    uploadFile,
  } = useFileUpload({
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'application/msword', 'text/plain', 'image/*', 'video/*', 'audio/*'],
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors
      const response = await request({
        endpoint: '/documents',
        method: 'GET',
      });
      setDocuments(response.data);
    } catch (error) {
      setError(error.message || 'Failed to load documents.');
      // Load offline data if request fails
      const offlineDocs = getAllOfflineData();
      setDocuments(offlineDocs);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const document = await pickDocument();
      if (document) {
        if (!isOnline) {
          // Store document locally if offline
          await createOffline({
            id: Date.now().toString(),
            filename: document.name,
            size: document.size,
            type: document.type,
            category: selectedCategory,
            isOffline: true,
          });
          return;
        }

        const result = await uploadFile(document, 'https://your-api.com/upload');
        
        await request({
          endpoint: '/documents',
          method: 'POST',
          body: {
            filename: document.name,
            size: document.size,
            type: document.type,
            url: result.url,
            category: selectedCategory,
          },
        });

        loadDocuments();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (document) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!isOnline) {
                await deleteOffline(document.id);
                return;
              }

              await request({
                endpoint: `/documents/${document.id}`,
                method: 'DELETE',
              });
              loadDocuments();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const handleShare = async (document) => {
    try {
      await Share.share({
        url: document.url,
        title: document.filename,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const handleDownload = async (document) => {
    try {
      // Implement download logic here
      Alert.alert('Success', 'Document downloaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to download document');
    }
  };

  const handleCategoryChange = async (document, newCategory) => {
    try {
      if (!isOnline) {
        await updateOffline({
          ...document,
          category: newCategory,
        });
        return;
      }

      await request({
        endpoint: `/documents/${document.id}`,
        method: 'PUT',
        body: {
          ...document,
          category: newCategory,
        },
      });
      loadDocuments();
    } catch (error) {
      Alert.alert('Error', 'Failed to update category');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDocumentIcon = (type) => {
    if (type.includes('pdf')) return 'picture-as-pdf';
    if (type.includes('word')) return 'description';
    if (type.includes('image')) return 'image';
    if (type.includes('video')) return 'videocam';
    if (type.includes('audio')) return 'audiotrack';
    return 'insert-drive-file';
  };

  // 1. Memoized DocumentItem component
  const DocumentItem = React.memo(function DocumentItem({ item, theme, styles, setSelectedDocument, setShowPreview, handleShare, handleDownload, handleDelete, setShowCategoryModal, getDocumentIcon }) {
    return (
      <TouchableOpacity
        style={[styles.documentItem, { backgroundColor: theme.card }]}
        onPress={() => {
          setSelectedDocument(item);
          setShowPreview(true);
        }}
      >
        <View style={styles.documentInfo}>
          <Icon
            name={getDocumentIcon(item.type)}
            size={24}
            color={theme.text}
            style={styles.documentIcon}
          />
          <View style={styles.documentDetails}>
            <Text style={[styles.documentName, { color: theme.text }]} numberOfLines={1}>
              {item.filename}
            </Text>
            <Text style={[styles.documentSize, { color: theme.textSecondary }]}> {(item.size / 1024).toFixed(2)} KB </Text>
            <View style={styles.categoryContainer}>
              <TouchableOpacity
                style={[styles.categoryButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.categoryText}>{item.category || 'Uncategorized'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.documentActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
            <Icon name="share" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDownload(item)}>
            <Icon name="download" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
            <Icon name="delete" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  });

  // 2. Memoize renderDocumentItem with useCallback
  const renderDocumentItem = React.useCallback(
    ({ item }) => (
      <DocumentItem
        item={item}
        theme={theme}
        styles={styles}
        setSelectedDocument={setSelectedDocument}
        setShowPreview={setShowPreview}
        handleShare={handleShare}
        handleDownload={handleDownload}
        handleDelete={handleDelete}
        setShowCategoryModal={setShowCategoryModal}
        getDocumentIcon={getDocumentIcon}
      />
    ),
    [theme, styles, setSelectedDocument, setShowPreview, handleShare, handleDownload, handleDelete, setShowCategoryModal, getDocumentIcon]
  );

  // 3. Add getItemLayout and FlatList performance props
  const getItemLayout = React.useCallback((data, index) => (
    { length: 85, offset: 85 * index, index } // 85 is an estimated row height
  ), []);

  const renderPreview = () => {
    if (!selectedDocument) return null;

    return (
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={[styles.previewContainer, { backgroundColor: theme.background }]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, { color: theme.text }]}>
              {selectedDocument.filename}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPreview(false)}
            >
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: selectedDocument.url }}
            style={styles.webview}
          />
        </View>
      </Modal>
    );
  };

  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Select Category
          </Text>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryOption,
                { backgroundColor: theme.background },
              ]}
              onPress={() => {
                handleCategoryChange(selectedDocument, category);
                setShowCategoryModal(false);
              }}
            >
              <Text style={[styles.categoryOptionText, { color: theme.text }]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.newCategoryContainer}>
            <TextInput
              style={[styles.newCategoryInput, { color: theme.text }]}
              placeholder="New category..."
              placeholderTextColor={theme.textSecondary}
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TouchableOpacity
              style={[styles.addCategoryButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                if (newCategory.trim()) {
                  handleCategoryChange(selectedDocument, newCategory.trim());
                  setNewCategory('');
                  setShowCategoryModal(false);
                }
              }}
            >
              <Text style={styles.addCategoryButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {error || 'Unable to load documents. Please check your connection.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadDocuments}
        accessibilityRole="button"
        accessibilityLabel="Retry loading documents"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Documents</Text>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: theme.primary }]}
          onPress={handleUpload}
          disabled={uploading}
        >
          <Icon name="upload" size={20} color={colors.white} />
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search documents..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && { backgroundColor: theme.primary },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === category ? colors.white : theme.text },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: theme.warning }]}>
          <Icon name="wifi-off" size={20} color={colors.white} />
          <Text style={styles.offlineText}>Working offline</Text>
        </View>
      )}

      {uploading && (
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: theme.text }]}>
            Uploading... {Math.round(progress * 100)}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>
        </View>
      )}

      {error && renderError()}

      <FlatList
        data={filteredDocuments}
        renderItem={renderDocumentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonLoader rows={8} height={60} style={{ marginTop: 16 }} />
          ) : (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No documents found</Text>
          )
        }
        getItemLayout={getItemLayout}
        initialNumToRender={12}
        windowSize={15}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
      />

      {renderPreview()}
      {renderCategoryModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  categoryFilter: {
    padding: 10,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: colors.gray,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
  },
  offlineText: {
    color: colors.white,
    marginLeft: 5,
    fontSize: 14,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: colors.white,
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 10,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  listContainer: {
    padding: 10,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    marginRight: 10,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
  },
  documentSize: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryContainer: {
    marginTop: 5,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: colors.white,
    fontSize: 12,
  },
  documentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  previewContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  webview: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  categoryOption: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryOptionText: {
    fontSize: 16,
  },
  newCategoryContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  newCategoryInput: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  addCategoryButton: {
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addCategoryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: colors.lightRed,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.red,
  },
  retryButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.blue,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DocumentManagementScreen; 