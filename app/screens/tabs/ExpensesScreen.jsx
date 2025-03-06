import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHandshake } from '@fortawesome/free-regular-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { globalStyles } from '../../styles/GlobalStyles';

const API_URL = 'https://googlesingin.onrender.com/api';

const ExpensesScreen = () => {
  const [userData, setUserData] = useState({
    name: 'User',
    photoUrl: null,
    greeting: 'Hello',
  });
  const [totalAmount, setTotalAmount] = useState(0); // Total amount state
  const [expenses, setExpenses] = useState([]); // Transactions state
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchUserData();
    fetchExpensesAndBalance();
  }, []);

  // Fetch user data (name, photo, etc.)
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/');
        return;
      }

      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { user, greeting } = response.data;
      setUserData({
        name: user.name,
        photoUrl: user.photoUrl,
        greeting: greeting,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch expenses and total amount from the backend
  const fetchExpensesAndBalance = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/');
        return;
      }

      const response = await axios.get(`${API_URL}/dashboard/user/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setTotalAmount(response.data.totalAmount); // Set total amount
        setExpenses(response.data.expenses); // Set transactions
      }
    } catch (error) {
      console.error('Error fetching expenses and balance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while data is being fetched
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
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userData.name}</Text>
          </View>
          <Image
            source={
              userData.photoUrl
                ? { uri: userData.photoUrl }
                : require('../../../assets/images/profile-img.jpg')
            }
            style={styles.avatar}
          />
        </View>

        {/* Total Amount Section */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balance}>
            ${totalAmount.toFixed(2)} {/* Display total amount */}
          </Text>
          <Icon name="eye" size={24} color="#222" style={styles.eyeIcon} />
          <Text style={styles.balanceLabel}>Total Amount</Text>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesomeIcon icon={faHandshake} size={28} color="#222" />
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="arrow-down" size={24} color="#222" />
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="line-chart" size={24} color="#222" />
            <Text style={styles.actionText}>Invest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="plus" size={24} color="#222" />
            <Text style={styles.actionText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactions}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTitle}>Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {expenses.map((expense) => (
            <View key={expense._id} style={styles.transactionItem}>
              <Icon
                name={expense.amount >= 0 ? 'plus' : 'minus'}
                size={24}
                color={expense.amount >= 0 ? '#00bfff' : '#ff0000'}
              />
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>{expense.description}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(expense.date).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={
                  expense.amount >= 0
                    ? styles.transactionAmountPositive
                    : styles.transactionAmountNegative
                }
              >
                {expense.amount >= 0 ? '+' : '-'}${Math.abs(expense.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExpensesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  welcomeText: {
    color: '#222',
    fontSize: 16,
  },
  userName: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 20,
    color: '#222',
  },
  balance: {
    color: '#14A44D',
    fontSize: 32,
    fontWeight: 'bold',
  },
  eyeIcon: {
    marginVertical: 10,
  },
  balanceLabel: {
    color: '#222',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#222',
    marginTop: 8,
  },
  transactions: {
    color: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -20, // Overlap effect
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#007bff',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 10,
  },
  transactionName: {
    fontSize: 16,
  },
  transactionDate: {
    color: '#888',
    fontSize: 12,
  },
  transactionAmountNegative: {
    color: '#ff0000',
    fontSize: 16,
  },
  transactionAmountPositive: {
    color: '#00bfff',
    fontSize: 16,
  },
});