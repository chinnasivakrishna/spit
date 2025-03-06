import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const InviteModal = ({ visible, onClose, inviteEmail, setInviteEmail, invitingMember, inviteMember }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, styles.inviteModalContent]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite Member</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Icon name="times" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email Address</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter email address"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[styles.inviteSubmitButton, invitingMember && styles.buttonDisabled]}
            onPress={inviteMember}
            disabled={invitingMember}
          >
            {invitingMember ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.inviteSubmitText}>Send Invitation</Text>
            )}
          </TouchableOpacity>
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
  inviteModalContent: {
    maxHeight: '40%',
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
  inviteSubmitButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  inviteSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
};

export default InviteModal;