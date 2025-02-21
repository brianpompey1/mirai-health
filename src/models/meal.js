import { supabase } from '../utils/supabase';
const Meal = {
    async getMealsForDate(userId, date) { // Pass in date
        const dateString = date.toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('meals')
          .select(`
            id,
            time,
            type,
            totalCalories,
            food_items (
                id,
                name,
                calories,
                protein,
                carbs,
                fat
            )
          `)
          .eq('user_id', userId)
          .eq('date', dateString) // Use the date parameter
          .order('time', { ascending: true });

        if (error) throw error;
        return data;
    },
}

export default Meal;