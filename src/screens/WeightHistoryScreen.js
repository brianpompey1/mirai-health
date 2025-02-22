import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../utils/supabase';
import { useTheme } from '../contexts/ThemeContext';

const WeightHistoryScreen = ({ navigation }) => {
  const [weightData, setWeightData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchWeightHistory = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          navigation.navigate('Auth'); // Redirect to login
          return;
        }

        const { data, error } = await supabase
          .from('user_progress')
          .select('date, weight')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching weight history:', error);
          Alert.alert('Error', 'Failed to fetch weight history.');
          return;
        }

        setWeightData(data); // No need for explicit mapping if structure is correct
      } catch (error) {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeightHistory();
  }, [navigation]);

    // Transform data for the chart
    const chartData = {
        labels: weightData.map((entry) => {
            const date = new Date(entry.date);
            return `${date.getMonth() + 1}/${date.getDate()}`; // Format as MM/DD

        }),  // Extract dates
        datasets: [
          {
            data: weightData.map((entry) => entry.weight), // Extract weights
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Line color
            strokeWidth: 2, // Line width
          },
        ],
      };
      if (loading) {
        return (
          <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        );
      }
      if (!weightData || weightData.length === 0) {
        return (
            <View  style={[styles.container, { backgroundColor: theme.background }]}>
                <Text>No weight history data available.</Text>
            </View>

        )
      }

      return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.text }]}>Weight History</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 32} // Adjust width for padding
            height={220}
            yAxisLabel="" // Add units if needed (e.g., "lbs")
            yAxisSuffix=" lbs"
            yAxisInterval={1} // Adjust as needed
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2, // Number of decimal places for labels
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Adjust line color
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Adjust label color
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6', // Dot radius
                strokeWidth: '2',
                stroke: '#007AFF', // Dot stroke color
              },
            }}
            bezier // Smooth lines
            style={styles.chart}
          />
           <View style={{height: 30}}></View>
        </ScrollView>
      );
    };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
      padding: 16
  },
  title: {
    fontSize: 24,
    fontFamily: 'sans-serif-medium',
    marginBottom: 20,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default WeightHistoryScreen;