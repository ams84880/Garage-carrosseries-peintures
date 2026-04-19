import { useEffect, useState } from 'react';
import { supabase, appointmentsAPI, reviewsAPI, Appointment, Review } from '@/lib/supabase';

/**
 * Hook for managing appointments with Supabase
 */
export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsAPI.getAll();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointment: Appointment) => {
    try {
      const newAppointment = await appointmentsAPI.create(appointment);
      setAppointments([newAppointment, ...appointments]);
      return newAppointment;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create appointment');
    }
  };

  const updateAppointment = async (id: number, updates: Partial<Appointment>) => {
    try {
      const updated = await appointmentsAPI.update(id, updates);
      setAppointments(appointments.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update appointment');
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      await appointmentsAPI.delete(id);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete appointment');
    }
  };

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments,
  };
}

/**
 * Hook for managing reviews with Supabase
 */
export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsAPI.getApproved();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (review: Review) => {
    try {
      const newReview = await reviewsAPI.create(review);
      return newReview;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create review');
    }
  };

  const approveReview = async (id: number) => {
    try {
      const updated = await reviewsAPI.updateStatus(id, 'approved');
      setReviews([updated, ...reviews]);
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to approve review');
    }
  };

  const rejectReview = async (id: number) => {
    try {
      await reviewsAPI.updateStatus(id, 'rejected');
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to reject review');
    }
  };

  return {
    reviews,
    loading,
    error,
    createReview,
    approveReview,
    rejectReview,
    refetch: fetchReviews,
  };
}

/**
 * Hook for all reviews (admin view)
 */
export function useAllReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsAPI.getAll();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const updated = await reviewsAPI.updateStatus(id, status);
      setReviews(reviews.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update review');
    }
  };

  const deleteReview = async (id: number) => {
    try {
      await reviewsAPI.delete(id);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete review');
    }
  };

  return {
    reviews,
    loading,
    error,
    updateReviewStatus,
    deleteReview,
    refetch: fetchReviews,
  };
}
