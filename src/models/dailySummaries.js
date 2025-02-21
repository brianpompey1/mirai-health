import {supabase} from '../utils/supabase';

const DailySummary = {
    async getDailySummary(userId, date) {
        const dateString = date.toISOString().split('T')[0];
        const { data, error } = await supabase
                .from('daily_summaries')
                .select('*')
                .eq('user_id', userId)
                .eq('date', dateString)
        if (error) throw error;
        return data;
    },
    async upsertDailySummary(userId, date, summaryData) {
      const dateString = date.toISOString().split('T')[0];

        const { error: upsertError } = await supabase
          .from('daily_summaries')
          .upsert({
            user_id: userId,
            date: dateString,
            total_calories: summaryData.total_calories,
            total_protein: summaryData.total_protein,
            total_carbs: summaryData.total_carbs,
            total_fat: summaryData.total_fat,
            water_intake: summaryData.water_intake,
          }, { onConflict: 'user_id, date' })
          .select();
        if(upsertError) throw upsertError;

    }
}

export default DailySummary;