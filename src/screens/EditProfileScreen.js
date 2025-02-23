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
import { supabase } from '../utils/supabase';
import { useTheme } from '../contexts/ThemeContext';

const EditProfileScreen = ({ navigation }) => {
  // Placeholder data - replace with actual user data from context/state
  const [name, setName] = useState('Brian Pompey');
  const [email, setEmail] = useState('brian.pompey@example.com');
  const [phone, setPhone] = useState('555-123-4567');
  const [startWeight, setStartWeight] = useState(''); // Add state for startWeight
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(''); // Store the URI
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null)
  const { theme } = useTheme();

  useEffect(() => {

    const fetchUserData = async() => {
        setLoading(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                navigation.navigate('Auth'); // Redirect to login if not logged in
                return;
            }
            setUserId(user.id)
            const {data, error} = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()
            if(error) {
                console.error("Error fetching user data", error);
                Alert.alert("Error", "Failed to get user data")
            }
            if(data) {
                setName(data.first_name);
                setEmail(data.email);
                setPhone(data.phone);
                setProfilePicture(data.profile_picture)
                setStartWeight(data.start_weight ? data.start_weight.toString() : ''); //NEW
            }
        } catch(error) {
            console.error("Error", error);
            Alert.alert("Error", "An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    fetchUserData();

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

  const handleSaveChanges = async () => {
    // TODO: Implement save changes logic (call API, update user data)
      // Basic validation
      setLoading(true)
      try {
           if (newPassword !== confirmNewPassword) {
              Alert.alert('Error', 'New passwords do not match.');
              return;
          }

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          // Handle case where user is not logged in (redirect to login, show error)
          navigation.navigate("Auth") //redirect
          return;
        }

      const updates = {
          first_name: name,
          email: email,
          phone: phone,
          profile_picture: profilePicture,
          start_weight: parseFloat(startWeight) || null,  // Convert to number, handle empty string
          // Don't include passwords here
      };


      // Update user data in Supabase
      const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id) // Update the row where id matches the user's ID
          .select(); //Returns the updated info

      if (error) {
          console.error('Error updating profile:', error);
          Alert.alert('Error', error.message); // Use error.message for Supabase errors
          return;
      }

      // Update password (if a new password was entered)
      if (newPassword) {
          const { error: passwordError } = await supabase.auth.updateUser({
              password: newPassword
          });

          if (passwordError) {
            Alert.alert("Error", passwordError.message);
            return;
          }
      }
       Alert.alert('Success', 'Profile updated successfully!');
       navigation.goBack(); // Go back to the Profile screen

      } catch(error){
          console.error("Catch error", error)
          Alert.alert("Error", "Failed to save changes.")
      } finally {
          setLoading(false)
      }
  };


  if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Loading...</Text>
    </View>
  );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.profileImageContainer, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profilePicture ? { uri: profilePicture } : require('../assets/images/placeholder-profile.png')}
            style={styles.profileImage}
          />
          <Text style={[styles.changePhotoText, { color: theme.text }]}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.form, { backgroundColor: theme.background }]}>
        <Text style={[styles.label, { color: theme.text }]}>Name:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <Text style={[styles.label, { color: theme.text }]}>Email:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: theme.text }]}>Phone:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: theme.text }]}>Starting Weight (lbs):</Text>
        <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
            value={startWeight}
            onChangeText={setStartWeight}
            placeholder="Enter your starting weight"
            keyboardType="numeric"
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Change Password</Text>

        <Text style={[styles.label, { color: theme.text }]}>Current Password:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          secureTextEntry
        />

        <Text style={[styles.label, { color: theme.text }]}>New Password:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
        />

        <Text style={[styles.label, { color: theme.text }]}>Confirm New Password:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          placeholder="Confirm new password"
          secureTextEntry
        />

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.buttonBackground }]} onPress={handleSaveChanges}>
          <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>Save Changes</Text>
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