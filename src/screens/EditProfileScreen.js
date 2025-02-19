import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const EditProfileScreen = ({ navigation }) => {
  // Placeholder data - replace with actual user data from context/state
  const [name, setName] = useState('Brian Pompey');
  const [email, setEmail] = useState('brian.pompey@example.com');
  const [phone, setPhone] = useState('555-123-4567');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(''); // Store the URI

  useEffect(() => {
      (async () => {
        if (Platform.OS !== 'web') { // Camera roll access not needed on web
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Sorry, we need camera roll permissions to make this work!');
          }
        }
      })();
    }, []);

  const pickImage = async () => {
    try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true, // Enable editing (cropping, etc.)
          aspect: [1, 1],     // Enforce a 1:1 aspect ratio (square)
          quality: 0.5,       // Compress the image (0.0 to 1.0)
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          // result.uri is deprecated in favor of result.assets[0].uri in newer versions of expo-image-picker.
          const imageUri = result.assets[0].uri;

          // Use ImageManipulator to resize *before* setting the state.
          const manipResult = await ImageManipulator.manipulateAsync(
              imageUri,
              [{ resize: { width: 200, height: 200 } }], // Resize to 200x200
              { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress
          );

          setProfilePicture(manipResult.uri); // Save the *resized* image URI
        }
    } catch (error) {
        console.error("Image Picker Error", error);
        Alert.alert("Error", "Failed to pick image.");

    }

  };

    const handleSaveChanges = () => {
    // TODO: Implement save changes logic (call API, update user data)
        // Basic validation
        if (newPassword !== confirmNewPassword) {
          Alert.alert('Error', 'New passwords do not match.');
          return;
        }

        // Placeholder for API call (replace with your actual API call)
        // Example using fetch:
        /*
        fetch('/api/user/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            currentPassword,
            newPassword,
            profilePicture, // Send the updated picture URI
          }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack(); // Go back to the Profile screen
          } else {
            Alert.alert('Error', data.message || 'Failed to update profile.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          Alert.alert('Error', 'An error occurred while updating your profile.');
        });
        */
        //For now, since there's no backend
        Alert.alert("Success", "Changes Saved");
        navigation.goBack();

  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profilePicture ? { uri: profilePicture } : require('../assets/images/placeholder-profile.png')}
            style={styles.profileImage}
          />
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone:</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.sectionTitle}>Change Password</Text>

        <Text style={styles.label}>Current Password:</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          secureTextEntry
        />

        <Text style={styles.label}>New Password:</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
        />

        <Text style={styles.label}>Confirm New Password:</Text>
        <TextInput
          style={styles.input}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          placeholder="Confirm new password"
          secureTextEntry
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePhotoText: {
    color: '#007AFF',
    marginTop: 5,
  },
  form: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'sans-serif',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'sans-serif',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
    marginBottom: 10,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
  },
});

export default EditProfileScreen;