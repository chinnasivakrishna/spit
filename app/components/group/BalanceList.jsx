import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const BalanceList = ({ balances, loadingBalances }) => {
  if (loadingBalances) {
    return <ActivityIndicator size="small" color="#007bff" style={styles.balancesLoading} />;
  }

  return (
    <FlatList
      data={balances}
      renderItem={({ item }) => (
        <View style={styles.balanceItem}>
          <Image 
            source={item.photoUrl ? { uri: item.photoUrl } : require('../../../assets/images/profile-img.jpg')} 
            style={styles.balanceAvatar} 
          />
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceName}>{item.name}</Text>
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatLabel}>Paid:</Text>
                <Text style={styles.balanceStatValue}>${item.paid.toFixed(2)}</Text>
              </View>
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatLabel}>Owed:</Text>
                <Text style={styles.balanceStatValue}>${item.owed.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.balanceNetContainer}>
              <Text style={styles.balanceNetLabel}>Net Balance:</Text>
              <Text style={[
                styles.balanceNetValue, 
                item.net > 0 ? styles.positiveBalance : 
                item.net < 0 ? styles.negativeBalance : styles.neutralBalance
              ]}>
                {item.net > 0 ? '+' : ''}{item.net.toFixed(2)}
              </Text>
            </View>
            {item.pendingPayments > 0 && (
              <View style={styles.pendingPaymentsContainer}>
                <Icon name="exclamation-circle" size={14} color="#FFC107" />
                <Text style={styles.pendingPaymentsText}>
                  ${item.pendingPayments.toFixed(2)} payment(s) pending
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.balancesList}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No balance information available</Text>
        </View>
      }
    />
  );
};

const styles = {
  balancesList: {
    paddingHorizontal: 16,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  balanceAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceStats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  balanceStat: {
    flex: 1,
  },
  balanceStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  balanceStatValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceNetContainer: {
    marginTop: 4,
  },
  balanceNetLabel: {
    fontSize: 12,
    color: '#666',
  },
  balanceNetValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  positiveBalance: {
    color: '#4CAF50',
  },
  negativeBalance: {
    color: '#F44336',
  },
  neutralBalance: {
    color: '#666',
  },
  pendingPaymentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pendingPaymentsText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#FFC107',
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
  balancesLoading: {
    marginVertical: 24,
  },
};

export default BalanceList;