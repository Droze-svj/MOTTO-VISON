import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useStorage } from '../hooks/useStorage';
import { useCamera } from '../hooks/useCamera';
import { useTheme } from '../hooks/useTheme';
import { useForm } from '../hooks/useForm';
import { validateForm } from '../utils/validation';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Avatar from '../components/common/Avatar';
import { colors } from '../constants/colors';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { setItem } = useStorage();
  const { takePhoto, pickImage } = useCamera();
  const { isDark, toggleTheme } = useTheme();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const { values, errors, handleChange, handleSubmit } = useForm(
    {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
    {
      name: { required: true, minLength: 2 },
      email: { required: true, email: true },
      phone: { phone: true },
    }
  );

  const handleUpdateProfile = async (formValues) => {
    try {
      await setItem('user_profile', {
        ...user,
        ...formValues,
        profileImage,
      });
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await takePhoto();
      if (result) {
        setProfileImage(result.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await pickImage();
      if (result) {
        setProfileImage(result.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      onClose={() => setIsEditModalVisible(false)}
    >
      <Text style={styles.modalTitle}>Edit Profile</Text>
      <View style={styles.avatarContainer}>
        <Avatar
          source={profileImage ? { uri: profileImage } : null}
          name={values.name}
          size={100}
        />
        <View style={styles.avatarActions}>
          <Button
            title="Take Photo"
            onPress={handleTakePhoto}
            variant="outline"
            style={styles.avatarButton}
          />
          <Button
            title="Pick Image"
            onPress={handlePickImage}
            variant="outline"
            style={styles.avatarButton}
          />
        </View>
      </View>
      <Input
        label="Name"
        value={values.name}
        onChangeText={(text) => handleChange('name', text)}
        error={errors.name}
      />
      <Input
        label="Email"
        value={values.email}
        onChangeText={(text) => handleChange('email', text)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Phone"
        value={values.phone}
        onChangeText={(text) => handleChange('phone', text)}
        error={errors.phone}
        keyboardType="phone-pad"
      />
      <Button
        title="Save Changes"
        onPress={() => handleSubmit(handleUpdateProfile)}
        style={styles.saveButton}
      />
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.header}>
          <Avatar
            source={profileImage ? { uri: profileImage } : null}
            name={user?.name}
            size={120}
          />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <View style={styles.actions}>
          <Button
            title="Edit Profile"
            onPress={() => setIsEditModalVisible(true)}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title={isDark ? 'Light Mode' : 'Dark Mode'}
            onPress={toggleTheme}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Logout"
            onPress={logout}
            variant="outline"
            style={[styles.actionButton, styles.logoutButton]}
          />
        </View>
      </Card>
      {renderEditModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  email: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 4,
  },
  actions: {
    marginTop: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
  logoutButton: {
    borderColor: colors.error,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  avatarButton: {
    marginHorizontal: 8,
  },
  saveButton: {
    marginTop: 20,
  },
});

export default ProfileScreen; 