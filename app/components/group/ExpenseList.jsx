import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ExpenseList = ({ expenses, loadingExpenses, markExpensePaid }) => {
  if (loadingExpenses) {
    return <ActivityIndicator size="small" color="#007bff" style={styles.expensesLoading} />;
  }

  return (
    <FlatList
      data={expenses}
      renderItem={({ item }) => (
        <View style={styles.expenseItem}>
          <View style={styles.expenseHeader}>
            <Text style={styles.expenseDescription}>{item.description}</Text>
            <Text style={styles.expenseAmount}>${parseFloat(item.amount).toFixed(2)}</Text>
          </View>
          <View style={styles.expenseDetails}>
            <Text style={styles.expensePaidBy}>Paid by: {item.paidBy.name}</Text>
            <Text style={styles.expenseDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.expenseSplit}>Split among {item.splitAmong.length} members (${(item.amount / item.splitAmong.length).toFixed(2)} each)</Text>
          
          <View style={styles.paymentStatusContainer}>
            {item.currentUserPaid ? (
              <View style={styles.paidStatusContainer}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.paidStatusText}>You've paid your share</Text>
              </View>
            ) : (
              item.isPaidByCurrentUser ? (
                <View style={styles.paidStatusContainer}>
                  <Icon name="info-circle" size={16} color="#007bff" />
                  <Text style={styles.paidStatusText}>You paid for this expense</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.markAsPaidButton}
                  onPress={() => markExpensePaid(item._id)}
                >
                  <Icon name="dollar" size={16} color="#fff" />
                  <Text style={styles.markAsPaidText}>Mark as Paid</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      )}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.expensesList}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses yet</Text>
        </View>
      }
    />
  );
};

const styles = {
  expensesList: {
    paddingHorizontal: 16,
  },
  expenseItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expensePaidBy: {
    fontSize: 14,
    color: '#666',
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  expenseSplit: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  expensesLoading: {
    marginVertical: 24,
  },
  paymentStatusContainer: {
    marginTop: 8,
  },
  paidStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidStatusText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4CAF50',
  },
  markAsPaidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4,
  },
  markAsPaidText: {
    marginLeft: 4,
    color: '#fff',
    fontSize: 14,
  },
};

export default ExpenseList;