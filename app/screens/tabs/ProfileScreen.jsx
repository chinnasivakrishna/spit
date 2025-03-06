import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';
import { globalStyles } from '../../styles/GlobalStyles';

const API_URL = 'https://googlesingin.onrender.com/api';


const ProfileScreen = () => {
  const [userData, setUserData] = useState({
    name: 'User',
    photoUrl: null,
    greeting: 'Hello'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/'); 
        return;
      }
      
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const { user, greeting } = response.data;
      console.log(response.data)
      
      setUserData({
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
        greeting: greeting
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.safeArea, globalStyles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.header}>
          <Image source={
            userData.photoUrl 
              ? { uri: userData.photoUrl } 
              : require('../../../assets/images/profile-img.jpg')
          }  style={styles.avatar} />
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <TouchableOpacity style={styles.sectionItem}>
            <Icon name="link" size={24} color="#007bff" />
            <Text style={styles.sectionText}>Linked Accounts</Text>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem}>
            <Icon name="bullseye" size={24} color="#007bff" />
            <Text style={styles.sectionText}>Push Notifications</Text>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem}>
            <Icon name="gift" size={24} color="#007bff" />
            <Text style={styles.sectionText}>Cashback</Text>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionItem} onPress={handleLogout}>
            <Icon name="sign-out" size={24} color="#007bff" />
            <Text style={styles.sectionText}>Logout</Text>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  accountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
});