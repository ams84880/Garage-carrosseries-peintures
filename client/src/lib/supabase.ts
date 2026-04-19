import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Some features may not work.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Types
export interface Appointment {
  id?: number;
  name: string;
  email: string;
  phone: string;
  vehicle?: string;
  service?: string;
  message?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id?: number;
  name: string;
  email: string;
  rating: number;
  comment: string;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

// Appointments API
export const appointmentsAPI = {
  async create(appointment: Appointment) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, updates: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Reviews API
export const reviewsAPI = {
  async create(review: Review) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async getApproved() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getAll() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateStatus(id: number, status: 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Real-time subscriptions
export const subscribeToAppointments = (callback: (data: Appointment[]) => void) => {
  return supabase
    .channel('appointments')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      () => {
        appointmentsAPI.getAll().then(callback);
      }
    )
    .subscribe();
};

export const subscribeToReviews = (callback: (data: Review[]) => void) => {
  return supabase
    .channel('reviews')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reviews' },
      () => {
        reviewsAPI.getApproved().then(callback);
      }
    )
    .subscribe();
};
