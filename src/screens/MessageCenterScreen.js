import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const MessageCenterScreen = () => {
    const { theme } = useTheme();

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.container}>
                {/* <Text style={[styles.title, { color: theme.text }]}>Message Center</Text> */}
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    No messages yet
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
    },
});

export default MessageCenterScreen;
