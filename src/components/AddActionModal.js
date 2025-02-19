import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

const AddActionModal = ({ isVisible, onClose, onAddExercise, onAddFood, onAddWater }) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose} // Close when tapping outside
      onBackButtonPress={onClose} // Close when pressing back button (Android)
      swipeDirection="down" // Allow swiping down to close
      onSwipeComplete={onClose}
      animationIn="slideInUp" // Slide in from bottom
      animationOut="slideOutDown" // Slide out to bottom
      animationInTiming={300}
      animationOutTiming={300}
      backdropOpacity={0.5}
      style={styles.modal}
    >
      <View style={styles.content}>
        <View style={styles.dragHandle} />

        <TouchableOpacity style={styles.option} onPress={onAddExercise}>
          <Ionicons name="barbell-outline" size={24} color="#007AFF" />
          <Text style={styles.optionText}>Add Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={onAddFood}>
          <Ionicons name="fast-food-outline" size={24} color="#007AFF" />
          <Text style={styles.optionText}>Add Food</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={onAddWater}>
          <Ionicons name="water-outline" size={24} color="#007AFF" />
          <Text style={styles.optionText}>Add Water</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
        padding: 22,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        alignItems: 'center'

    },
    dragHandle: {
        width: 50,
        height: 5,
        backgroundColor: 'gray',
        borderRadius: 3,
        marginBottom: 20,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    optionText: {
        marginLeft: 10,
        fontSize: 18,
        fontFamily: 'sans-serif',
    },
    cancelButton: {
        marginTop: 20,
        padding: 10,
    },
    cancelButtonText: {
        fontSize: 18,
        color: 'red',
        fontFamily: 'sans-serif',
    },
});

export default AddActionModal;