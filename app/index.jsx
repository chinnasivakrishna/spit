import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ActivityIndicator, View, Text } from 'react-native';

const API_BASE_URL = 'https://googlesingin.onrender.com/api/auth';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const checkTokenAndRedirect = async () => {
      try {
        console.log("Checking authentication token...");
        const token = await AsyncStorage.getItem('userToken');
        
        if (!token) {
          console.log("No token found, redirecting to login");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        console.log("Token found, verifying with backend");
        try {
          // Add a short delay before making the request to ensure AsyncStorage is fully initialized
          // This helps with token retrieval issues on some devices
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const response = await axios.get(`${API_BASE_URL}/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000, // 10 second timeout - fixed from 100000
          });

          if (response.status === 200 && response.data) {
            console.log("Token valid, user is authenticated");
            // Store the refreshed user data if returned from backend
            if (response.data.user) {
              await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
            }
            setIsAuthenticated(true);
          } else {
            console.log("Token verification failed with status:", response.status);
            await clearAuthData();
            setIsAuthenticated(false);
          }
        } catch (apiError) {
          console.error('API error during token verification:', apiError);
          // Check if it's a network error or server issue
          if (apiError.code === 'ECONNABORTED') {
            setError('Connection timeout. Please check your internet connection.');
          } else if (!apiError.response) {
            setError('Network error. Please check your internet connection.');
          } else if (apiError.response && apiError.response.status === 401) {
            console.log("Token expired or invalid");
            setError('Session expired. Please sign in again.');
          } else {
            setError('Server error. Please try again later.');
          }
          
          await clearAuthData();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Unexpected error during authentication check:', error);
        await clearAuthData();
        setIsAuthenticated(false);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkTokenAndRedirect();
  }, []);

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    // Show error briefly before redirecting to login
    setTimeout(() => {
      setError(null);
    }, 3000);
    
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 15 }}>{error}</Text>
        <Text>Redirecting to login...</Text>
        <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10 }} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/screens/tabs" />;
  } else {
    return <Redirect href="/screens/LoginScreen" />;
  }
};

export default Index;