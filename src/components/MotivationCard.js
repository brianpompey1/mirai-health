import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native'; // Use ImageBackground

const MotivationCard = ({ quote, author, backgroundImage }) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImage ? { uri: backgroundImage } : require('../assets/images/placeholder-motivation.jpg')} // Use ImageBackground
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle} // Apply border radius to the image itself
      >
        <View style={styles.overlay} />
        <Text style={styles.quote}>{quote}</Text>
        <Text style={styles.author}>- {author}</Text>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10, // Reduced margin
    marginBottom: 10,      // Reduced margin
    borderRadius: 10,     // Rounded corners
    overflow: 'hidden',    // Clip content to rounded corners
    height: 150,          // Adjust height as needed
  },
  backgroundImage: {
    flex: 1,              // Make the image fill the container
    resizeMode: 'cover',  // Cover the entire area
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',     // Center content horizontally
  },
  imageStyle: {
    borderRadius: 10      // Apply rounded corners to the image
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Position over the entire image
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black overlay
  },
  quote: {
    fontSize: 18,
    fontFamily: 'sans-serif',
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 20,
    zIndex: 1,             // Ensure text is above the overlay
    fontWeight: 'bold'
  },
  author: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    zIndex: 1,             // Ensure text is above the overlay
  },
});

export default MotivationCard;