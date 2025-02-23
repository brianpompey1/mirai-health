import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const AddActionModal = ({ isVisible, onClose, onAddFood, navigation }) => {
  const { theme } = useTheme();

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      backdropOpacity={0.5}
      style={styles.modal}
    >
      <View style={[styles.content, { backgroundColor: theme.background }]}>
        <View style={styles.dragHandle} />
        
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, {color: theme.text}]}>Add Food</Text>
          <Text style={[styles.subtitle, {color: theme.text}]}>Log your meals to track your nutrition</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.actionButton,
              borderColor: theme.border,
            },
          ]}
          onPress={() => {
            onClose();
            navigation.navigate('AddFood');
          }}
        >
          <Text style={[styles.actionButtonText, { color: theme.actionButtonText }]}>
            Add Food Item
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.background }]} onPress={onClose}>
          <Text style={[styles.cancelButtonText, {color: theme.text}]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'stretch',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default AddActionModal;