import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { router } from 'expo-router';

const GroupHeader = ({ group }) => {
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/tabs'); // Replace with your fallback route
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Icon name="arrow-left" size={20} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Group Details</Text>
      {group?.isAdmin && (
        <TouchableOpacity style={styles.editButton}>
          <Icon name="edit" size={20} color="#007bff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
};

export default GroupHeader;