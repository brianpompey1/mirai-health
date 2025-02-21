import { supabase } from '../utils/supabase';

const Appointment = {
  async getUpcomingAppointments(userId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .gte('date_time', new Date().toISOString())
      .order('date_time', { ascending: true });

    if (error) throw error;
    return data.map(appointment => ({
        ...appointment,
        date_time: new Date(appointment.date_time) //Convert back to JS date
    }));
  },

  async getPastAppointments(userId) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .lt('date_time', new Date().toISOString())
        .order('date_time', { ascending: false });

        if(error) throw error;
        return data.map(appointment => ({
            ...appointment,
            date_time: new Date(appointment.date_time)
        }));
  },

  async createAppointment(userId, appointmentData) {
      const {data, error} = await supabase
        .from('appointments')
        .insert([
          {
            user_id: userId,
            date_time: appointmentData.dateTime,
            location: appointmentData.location, //  You'll likely get this from user input or settings
            notes: appointmentData.notes,
          },
        ])
        .select();
        if(error) throw error;
        return data;
  },

  async rescheduleAppointment(appointmentId, userId, newDateTime) {
     const { error } = await supabase
        .from('appointments')
        .update({ date_time: newDateTime })
        .eq('id', appointmentId)
        .eq('user_id', userId);
    if(error) throw error;
  },

    async cancelAppointment(appointmentId, userId) {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', appointmentId)
            .eq('user_id', userId);
        if(error) throw error;
    }

  // Add other appointment-related methods (e.g., getAppointmentDetails)
};

export default Appointment;