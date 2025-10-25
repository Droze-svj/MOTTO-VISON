// Document Uploader Component - UI for uploading and managing documents
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import DocumentManagementService from '../../services/DocumentManagementService';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

const DocumentUploader = ({ onDocumentUploaded, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [documentSettings, setDocumentSettings] = useState({
    category: 'general',
    tags: [],
    autoAnalyze: true,
    compress: true,
    encrypt: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [newTag, setNewTag] = useState('');

  const supportedFormats = [
    'txt', 'md', 'rtf', 'pdf', 'doc', 'docx',
    'html', 'htm', 'xml', 'json', 'csv', 'xlsx',
    'js', 'ts', 'py', 'java', 'cpp', 'c', 'h',
    'yaml', 'yml', 'ini', 'conf', 'cfg'
  ];

  const categories = [
    'general', 'work', 'personal', 'education', 'research',
    'code', 'notes', 'documents', 'data', 'config'
  ];

  const handleDocumentPicker = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map(asset => ({
          id: Date.now() + Math.random(),
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
          type: asset.mimeType,
          extension: asset.name.split('.').pop().toLowerCase(),
          selected: true
        }));

        // Filter supported formats
        const supportedFiles = newFiles.filter(file => 
          supportedFormats.includes(file.extension)
        );

        if (supportedFiles.length !== newFiles.length) {
          Alert.alert(
            'Unsupported Files',
            'Some files were not selected because they are not in supported formats.'
          );
        }

        setSelectedFiles(prev => [...prev, ...supportedFiles]);
      }
    } catch (error) {
      console.error('Error picking documents:', error);
      Alert.alert('Error', 'Failed to pick documents');
    }
  }, []);

  const handleFileToggle = useCallback((fileId) => {
    setSelectedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, selected: !file.selected } : file
      )
    );
  }, []);

  const handleRemoveFile = useCallback((fileId) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !documentSettings.tags.includes(newTag.trim())) {
      setDocumentSettings(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag, documentSettings.tags]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    setDocumentSettings(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleUpload = useCallback(async () => {
    const filesToUpload = selectedFiles.filter(file => file.selected);
    
    if (filesToUpload.length === 0) {
      Alert.alert('No Files', 'Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress({});

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        try {
          // Read file content
          const fileContent = await FileSystem.readAsStringAsync(file.uri);
          
          // Prepare document data
          const documentData = {
            name: file.name,
            content: fileContent,
            size: file.size,
            type: file.extension,
            category: documentSettings.category,
            tags: documentSettings.tags,
            metadata: {
              originalUri: file.uri,
              mimeType: file.type,
              uploadTimestamp: Date.now()
            }
          };

          // Upload document
          const uploadedDocument = await DocumentManagementService.uploadDocument(
            documentData,
            {
              autoAnalyze: documentSettings.autoAnalyze,
              compress: documentSettings.compress,
              encrypt: documentSettings.encrypt
            }
          );

          setUploadProgress(prev => ({
            ...prev,
            [file.id]: { status: 'completed', document: uploadedDocument }
          }));

          if (onDocumentUploaded) {
            onDocumentUploaded(uploadedDocument);
          }

        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          setUploadProgress(prev => ({
            ...prev,
            [file.id]: { status: 'failed', error: error.message }
          }));
        }
      }

      Alert.alert(
        'Upload Complete',
        `${filesToUpload.length} document(s) uploaded successfully`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedFiles([]);
              setUploadProgress({});
              if (onClose) onClose();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Error', 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, documentSettings, onDocumentUploaded, onClose]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (extension) => {
    const iconMap = {
      txt: 'document-text',
      md: 'document-text',
      pdf: 'document',
      doc: 'document',
      docx: 'document',
      html: 'code-slash',
      js: 'logo-javascript',
      ts: 'logo-javascript',
      py: 'logo-python',
      java: 'code-slash',
      json: 'code-slash',
      csv: 'table',
      yaml: 'code-slash',
      yml: 'code-slash'
    };
    return iconMap[extension] || 'document';
  };

  const renderFileItem = (file) => {
    const progress = uploadProgress[file.id];
    const isUploading = uploading && file.selected;
    const isCompleted = progress?.status === 'completed';
    const isFailed = progress?.status === 'failed';

    return (
      <View key={file.id} style={styles.fileItem}>
        <View style={styles.fileInfo}>
          <View style={styles.fileHeader}>
            <Ionicons 
              name={getFileIcon(file.extension)} 
              size={24} 
              color={colors.primary} 
            />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={styles.fileSize}>
                {formatFileSize(file.size)} • {file.extension.toUpperCase()}
              </Text>
            </View>
          </View>
          
          {isUploading && (
            <View style={styles.uploadProgress}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.uploadText}>Uploading...</Text>
            </View>
          )}
          
          {isCompleted && (
            <View style={styles.uploadStatus}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.statusText}>Uploaded</Text>
            </View>
          )}
          
          {isFailed && (
            <View style={styles.uploadStatus}>
              <Ionicons name="close-circle" size={20} color={colors.error} />
              <Text style={styles.statusText}>Failed</Text>
            </View>
          )}
        </View>
        
        <View style={styles.fileActions}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: file.selected ? colors.primary : colors.border }
            ]}
            onPress={() => handleFileToggle(file.id)}
          >
            <Ionicons 
              name={file.selected ? "checkmark" : "close"} 
              size={16} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFile(file.id)}
          >
            <Ionicons name="trash" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSettings = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.settingsContainer}>
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>Document Settings</Text>
          <TouchableOpacity onPress={() => setShowSettings(false)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.settingsContent}>
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    documentSettings.category === category && styles.categoryButtonActive
                  ]}
                  onPress={() => setDocumentSettings(prev => ({ ...prev, category }))}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    documentSettings.category === category && styles.categoryButtonTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Tags</Text>
            <View style={styles.tagsContainer}>
              {documentSettings.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <Ionicons name="close" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addTagContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add tag..."
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Processing Options</Text>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Auto-analyze content</Text>
              <Switch
                value={documentSettings.autoAnalyze}
                onValueChange={(value) => setDocumentSettings(prev => ({ ...prev, autoAnalyze: value }))}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Compress files</Text>
              <Switch
                value={documentSettings.compress}
                onValueChange={(value) => setDocumentSettings(prev => ({ ...prev, compress: value }))}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Encrypt files</Text>
              <Switch
                value={documentSettings.encrypt}
                onValueChange={(value) => setDocumentSettings(prev => ({ ...prev, encrypt: value }))}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Documents</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.pickerButton} onPress={handleDocumentPicker}>
          <Ionicons name="cloud-upload" size={32} color={colors.primary} />
          <Text style={styles.pickerButtonText}>Select Documents</Text>
          <Text style={styles.pickerButtonSubtext}>
            Choose files to upload and analyze
          </Text>
        </TouchableOpacity>
        
        {selectedFiles.length > 0 && (
          <View style={styles.filesContainer}>
            <View style={styles.filesHeader}>
              <Text style={styles.filesTitle}>
                Selected Files ({selectedFiles.length})
              </Text>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => setShowSettings(true)}
              >
                <Ionicons name="settings" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {selectedFiles.map(renderFileItem)}
          </View>
        )}
      </ScrollView>
      
      {selectedFiles.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="cloud-upload" size={20} color="white" />
            )}
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : 'Upload Documents'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {renderSettings()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pickerButton: {
    alignItems: 'center',
    padding: 40,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  pickerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 12,
  },
  pickerButtonSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  filesContainer: {
    marginTop: 20,
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingsButton: {
    padding: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileInfo: {
    flex: 1,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  fileSize: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 8,
  },
  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  settingsContent: {
    flex: 1,
    padding: 20,
  },
  settingGroup: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    marginRight: 4,
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  addTagButton: {
    marginLeft: 8,
    padding: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.text,
  },
});

export default DocumentUploader;
