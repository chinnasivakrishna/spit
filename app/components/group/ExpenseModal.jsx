import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Checkbox } from 'expo-checkbox';

const ExpenseModal = ({ 
  visible, 
  onClose, 
  expenseDescription, 
  setExpenseDescription, 
  expenseAmount, 
  setExpenseAmount, 
  expenseCategory, 
  setExpenseCategory, 
  expenseNotes, 
  setExpenseNotes, 
  splitAll, 
  setSplitAll, 
  splitSelected, 
  toggleMemberSelection, 
  allGroupMembers, 
  addingExpense, 
  addExpense 
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Icon name="times" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                placeholder="What was this expense for?"
                value={expenseDescription}
                onChangeText={setExpenseDescription}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0.00"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Category (Optional)"
                value={expenseCategory}
                onChangeText={setExpenseCategory}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                placeholder="Additional notes (Optional)"
                value={expenseNotes}
                onChangeText={setExpenseNotes}
                multiline={true}
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Split Among</Text>
              <View style={styles.splitToggle}>
                <TouchableOpacity 
                  style={[styles.splitToggleButton, splitAll && styles.splitToggleButtonActive]}
                  onPress={() => setSplitAll(true)}
                >
                  <Text style={[styles.splitToggleText, splitAll && styles.splitToggleTextActive]}>
                    All Members
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.splitToggleButton, !splitAll && styles.splitToggleButtonActive]}
                  onPress={() => setSplitAll(false)}
                >
                  <Text style={[styles.splitToggleText, !splitAll && styles.splitToggleTextActive]}>
                    Select Members
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {!splitAll && (
              <View style={styles.memberSelectContainer}>
                <FlatList
                  data={allGroupMembers}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[styles.memberSelectItem, !item.isActive && styles.memberSelectItemDisabled]}
                      onPress={() => item.isActive && toggleMemberSelection(item._id)}
                      disabled={!item.isActive || splitAll}
                    >
                      <View style={styles.memberSelectCheckbox}>
                        <CheckBox
                          disabled={!item.isActive || splitAll}
                          value={splitAll || splitSelected.includes(item._id)}
                          onValueChange={() => item.isActive && toggleMemberSelection(item._id)}
                          color={splitSelected.includes(item._id) ? '#007bff' : undefined}
                        />
                      </View>
                      <Image 
                        source={item.photoUrl ? { uri: item.photoUrl } : require('../../../assets/images/profile-img.jpg')} 
                        style={[styles.memberSelectAvatar, !item.isActive && styles.memberSelectAvatarDisabled]} 
                      />
                      <View style={styles.memberSelectInfo}>
                        <Text style={[styles.memberSelectName, !item.isActive && styles.memberSelectNameDisabled]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.memberSelectEmail, !item.isActive && styles.memberSelectEmailDisabled]}>
                          {item.email}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                />
              </View>
            )}

            <TouchableOpacity 
              style={[styles.addExpenseSubmitButton, addingExpense && styles.buttonDisabled]}
              onPress={addExpense}
              disabled={addingExpense}
            >
              {addingExpense ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.addExpenseSubmitText}>Add Expense</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalScrollView: {
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  formTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  splitToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  splitToggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  splitToggleButtonActive: {
    backgroundColor: '#007bff',
  },
  splitToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  splitToggleTextActive: {
    color: '#fff',
  },
  memberSelectContainer: {
    marginBottom: 16,
  },
  memberSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberSelectItemDisabled: {
    opacity: 0.5,
  },
  memberSelectCheckbox: {
    marginRight: 12,
  },
  memberSelectAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberSelectAvatarDisabled: {
    opacity: 0.5,
  },
  memberSelectInfo: {
    flex: 1,
  },
  memberSelectName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberSelectNameDisabled: {
    color: '#999',
  },
  memberSelectEmail: {
    fontSize: 14,
    color: '#666',
  },
  memberSelectEmailDisabled: {
    color: '#999',
  },
  addExpenseSubmitButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  addExpenseSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
};

export default ExpenseModal;