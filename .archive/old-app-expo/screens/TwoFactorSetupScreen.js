import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Clipboard,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import useSecurity from '../hooks/useSecurity';
import useMediaAnalytics from '../hooks/useMediaAnalytics';
import QRCode from 'react-native-qrcode-svg';

const TwoFactorSetupScreen = ({ navigation }) => {
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const { secureStore } = useSecurity({
    enableBiometrics: true,
    enableEncryption: true,
  });

  const { trackEngagement } = useMediaAnalytics({
    enableRealTime: true,
  });

  useEffect(() => {
    generateSecret();
  }, []);

  const generateSecret = useCallback(async () => {
    try {
      setIsLoading(true);
      // Implement secret generation logic here
      const generatedSecret = 'JBSWY3DPEHPK3PXP'; // This should come from your backend
      setSecret(generatedSecret);
      setQrCodeData(`otpauth://totp/YourApp:user@example.com?secret=${generatedSecret}&issuer=YourApp`);
      
      // Generate backup codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      
      await trackEngagement({
        type: '2fa_secret_generated',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate 2FA secret');
    } finally {
      setIsLoading(false);
    }
  }, [trackEngagement]);

  const handleVerifyCode = useCallback(async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      // Implement verification logic here
      await trackEngagement({
        type: '2fa_code_verified',
      });
      setStep(3);
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, trackEngagement]);

  const handleComplete = useCallback(async () => {
    try {
      setIsLoading(true);
      await secureStore.setItem('twoFactorEnabled', true);
      await secureStore.setItem('twoFactorSecret', secret);
      await secureStore.setItem('backupCodes', JSON.stringify(backupCodes));
      if (recoveryEmail) {
        await secureStore.setItem('recoveryEmail', recoveryEmail);
      }
      await trackEngagement({
        type: '2fa_setup_completed',
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete 2FA setup');
    } finally {
      setIsLoading(false);
    }
  }, [secret, backupCodes, recoveryEmail, secureStore, navigation, trackEngagement]);

  const handleCopyBackupCodes = useCallback(async () => {
    try {
      await Clipboard.setString(backupCodes.join('\n'));
      Alert.alert('Success', 'Backup codes copied to clipboard');
      await trackEngagement({
        type: '2fa_backup_codes_copied',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to copy backup codes');
    }
  }, [backupCodes, trackEngagement]);

  const handleShareBackupCodes = useCallback(async () => {
    try {
      await Share.share({
        message: `My 2FA backup codes:\n${backupCodes.join('\n')}`,
      });
      await trackEngagement({
        type: '2fa_backup_codes_shared',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share backup codes');
    }
  }, [backupCodes, trackEngagement]);

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Scan QR Code
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.text + '80' }]}>
        Scan this QR code with your authenticator app
      </Text>
      <View style={styles.qrContainer}>
        {qrCodeData ? (
          <QRCode
            value={qrCodeData}
            size={200}
            backgroundColor="white"
            color="black"
          />
        ) : (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        )}
      </View>
      <Text style={[styles.secretText, { color: theme.colors.text + '80' }]}>
        Or enter this code manually:
      </Text>
      <Text style={[styles.secretCode, { color: theme.colors.primary }]}>
        {secret}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => setStep(2)}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Verify Code
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.text + '80' }]}>
        Enter the 6-digit code from your authenticator app
      </Text>
      <TextInput
        style={[
          styles.codeInput,
          {
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="000000"
        placeholderTextColor={theme.colors.text + '40'}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleVerifyCode}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Ionicons
        name="checkmark-circle"
        size={64}
        color={theme.colors.primary}
        style={styles.successIcon}
      />
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Setup Complete
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.text + '80' }]}>
        Two-factor authentication has been successfully enabled for your account
      </Text>

      <View style={styles.backupCodesContainer}>
        <Text style={[styles.backupCodesTitle, { color: theme.colors.text }]}>
          Backup Codes
        </Text>
        <Text style={[styles.backupCodesDescription, { color: theme.colors.text + '80' }]}>
          Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
        </Text>
        {showBackupCodes ? (
          <View style={styles.backupCodesList}>
            {backupCodes.map((code, index) => (
              <Text key={index} style={[styles.backupCode, { color: theme.colors.primary }]}>
                {code}
              </Text>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowBackupCodes(true)}
          >
            <Text style={styles.buttonText}>Show Backup Codes</Text>
          </TouchableOpacity>
        )}
        {showBackupCodes && (
          <View style={styles.backupCodesActions}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
              onPress={handleCopyBackupCodes}
            >
              <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                Copy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
              onPress={handleShareBackupCodes}
            >
              <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.recoveryEmailContainer}>
        <Text style={[styles.recoveryEmailTitle, { color: theme.colors.text }]}>
          Recovery Email (Optional)
        </Text>
        <TextInput
          style={[
            styles.emailInput,
            {
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          value={recoveryEmail}
          onChangeText={setRecoveryEmail}
          placeholder="Enter recovery email"
          placeholderTextColor={theme.colors.text + '40'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleComplete}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Done</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Two-Factor Setup
        </Text>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  stepContainer: {
    padding: 24,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  secretText: {
    fontSize: 14,
    marginBottom: 8,
  },
  secretCode: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  codeInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successIcon: {
    marginBottom: 24,
  },
  backupCodesContainer: {
    width: '100%',
    marginBottom: 24,
  },
  backupCodesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  backupCodesDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  backupCodesList: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  backupCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  backupCodesActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  secondaryButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  recoveryEmailContainer: {
    width: '100%',
    marginBottom: 24,
  },
  recoveryEmailTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emailInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});

export default TwoFactorSetupScreen; 