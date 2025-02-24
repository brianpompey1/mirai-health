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
          navigation.navigate('Auth');
          return;
        }

        // First, get the starting weight
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('start_weight')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching starting weight:', userError);
          Alert.alert('Error', 'Failed to fetch starting weight.');
          return;
        }

        // Then, get all appointments with weights
        const { data: appointments, error: appointmentError } = await supabase
          .from('appointments')
          .select('date_time, notes')
          .eq('user_id', user.id)
          .not('notes', 'is', null)
          .not('notes', 'eq', '')
          .order('date_time', { ascending: true });

        if (appointmentError) {
          console.error('Error fetching appointments:', appointmentError);
          Alert.alert('Error', 'Failed to fetch weight history.');
          return;
        }

        // Process appointments to extract weights
        const appointmentWeights = appointments
          .map(appointment => {
            const weightMatch = appointment.notes?.match(/Weight:\s*(\d+)/);
            if (weightMatch && weightMatch[1]) {
              return {
                date: appointment.date_time,
                weight: parseFloat(weightMatch[1])
              };
            }
            return null;
          })
          .filter(item => item !== null);

        // Combine starting weight with appointment weights
        const allWeightData = [
          {
            date: new Date(appointments[0]?.date_time || Date.now()).setMonth(new Date(appointments[0]?.date_time || Date.now()).getMonth() - 1), // Set starting weight date 1 month before first appointment
            weight: userData.start_weight,
            isStartWeight: true
          },
          ...appointmentWeights
        ].filter(item => item.weight !== null && !isNaN(item.weight));

        setWeightData(allWeightData);
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
    }),
    datasets: [
      {
        data: weightData.map((entry) => entry.weight),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>No weight history data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* <Text style={[styles.title, { color: theme.text }]}>Weight History</Text> */}
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" lbs"
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: theme.cardBackground,
          backgroundGradientFrom: theme.cardBackground,
          backgroundGradientTo: theme.cardBackground,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          labelColor: (opacity = 1) => theme.text,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      
      {/* Display weight entries as a list */}
      <View style={styles.weightList}>
        {weightData.map((entry, index) => (
          <View key={index} style={[styles.weightItem, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.date, { color: theme.text }]}>
              {entry.isStartWeight ? 'Starting Weight' : new Date(entry.date).toLocaleDateString()}
            </Text>
            <Text style={[styles.weight, { color: theme.text }]}>{entry.weight} lbs</Text>
          </View>
        ))}
      </View>
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
  },
  weightList: {
    marginTop: 16,
  },
  weightItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    marginBottom: 4,
  },
  weight: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WeightHistoryScreen;