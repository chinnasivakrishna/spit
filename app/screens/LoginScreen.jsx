import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/GlobalStyles';
import { router } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Complete any auth session in progress
WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = 'https://googlesingin.onrender.com/api/auth';

const LoginScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  // Add iOS client ID to make it work across all platforms
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '671394807556-i4ke2ovb1ghtm7f5n3mkrmhnhvbbsa8f.apps.googleusercontent.com',
    // Add these for web and iOS compatibility
    iosClientId: '671394807556-i4ke2ovb1ghtm7f5n3mkrmhnhvbbsa8f.apps.googleusercontent.com', 
    webClientId: '671394807556-bimjas4iosakeeni40ajv9ps885prso9.apps.googleusercontent.com', 
    redirectUri: Platform.select({
      web: 'http://localhost:8082',
      default: 'com.chinnasivakrishna.learning:/oauth2redirect'
    }),
    scopes: ['profile', 'email']
  });

  useEffect(() => {
    checkExistingToken();
  }, []);

  useEffect(() => {
    if (response) {
      handleSignInResponse();
    }
  }, [response]);

  const checkExistingToken = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const response = await axios.get(`${API_BASE_URL}/user`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            timeout: 10000 // 10 second timeout
          });
          
          if (response.status === 200) {
            setUserInfo(JSON.parse(userData));
            router.replace('/screens/tabs');
          } else {
            await clearAuthData();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          
          // Handle network errors specifically
          if (!error.response) {
            setNetworkError('Network error. Please check your connection and try again.');
            setTimeout(() => setNetworkError(null), 5000);
          }
          
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const handleSignInResponse = async () => {
    if (response?.type === 'success') {
      setLoading(true);
      const { authentication } = response;
      
      try {
        // Get user info from Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/userinfo/v2/me',
          {
            headers: { Authorization: `Bearer ${authentication.accessToken}` },
          }
        );
        
        if (!userInfoResponse.ok) {
          throw new Error(`Google API error: ${userInfoResponse.status}`);
        }
        
        const googleUserInfo = await userInfoResponse.json();
        
        // Send to your backend
        const backendResponse = await axios.post(`${API_BASE_URL}/google`, {
          googleId: googleUserInfo.id,
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          photoUrl: googleUserInfo.picture,
          accessToken: authentication.accessToken,
          idToken: authentication.idToken 
        });
        
        const { token, user } = backendResponse.data;
        
        // Store token and user data
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        setUserInfo(user);
        router.replace('/screens/tabs');
      } catch (error) {
        console.error('Error in Google sign-in process:', error);
        
        // Better error handling with more specific messages
        let errorMessage = 'Unable to sign in with Google. Please try again.';
        
        if (!error.response && error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.response && error.response.status === 401) {
          errorMessage = 'Authentication failed. Please try again.';
        } else if (error.response && error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        Alert.alert('Sign-in Failed', errorMessage, [{ text: 'OK' }]);
      } finally {
        setLoading(false);
      }
    } else if (response?.type === 'error') {
      console.error('Google sign-in error:', response.error);
      Alert.alert('Sign-in Error', 'An error occurred during Google sign-in. Please try again.', [{ text: 'OK' }]);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await promptAsync({ showInRecents: true });
    } catch (error) {
      console.error('Error initiating Google sign-in:', error);
      Alert.alert('Error', 'Failed to start Google sign-in', [{ text: 'OK' }]);
      setLoading(false);
    }
  };

  // Show loading indicator until initial token check is complete
  if (!initialCheckDone && loading) {
    return (
      <View style={[globalStyles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Checking login status...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={globalStyles.loginView}>
        <Image 
          source={require('../../assets/images/intro.jpg')} 
          style={globalStyles.introImg} 
          resizeMode="contain"
        />
        
        {networkError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{networkError}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            globalStyles.signButton, 
            loading && { opacity: 0.7 }
          ]} 
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.buttonText, { marginLeft: 10 }]}>Signing in...</Text>
            </View>
          ) : (
            <>
              <View style={styles.buttonContent}>
                
                <Text style={styles.buttonText}>Sign In with Google</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  register: {
    marginTop: 15,
    textAlign: 'center',
    color: '#555',
    textDecorationLine: 'underline'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%'
  },
  errorText: {
    color: 'red',
    textAlign: 'center'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10
  }
});