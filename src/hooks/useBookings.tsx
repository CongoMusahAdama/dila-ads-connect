import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface BookingRequest {
  _id: string;
  billboardId: {
    _id: string;
    name: string;
    location: string;
    imageUrl?: string;
    size?: string;
    pricePerDay?: number;
    ownerId: {
      _id: string;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  };
  advertiserId: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  responseMessage?: string;
  hasDispute: boolean;
  disputeReason?: string;
  disputeStatus?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

interface BookingFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export const useMyBookingRequests = (filters?: BookingFilters) => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchMyBookingRequests = async (newFilters?: BookingFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getMyBookingRequests(newFilters || filters);
      setBookingRequests(response.bookingRequests);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookingRequests();
  }, [filters?.page, filters?.status]);

  const createBookingRequest = async (data: {
    billboardId: string;
    startDate: string;
    endDate: string;
    message?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createBookingRequest(data);
      await fetchMyBookingRequests(); // Refresh the list
      return { success: true, data: response };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelBookingRequest = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.cancelBookingRequest(id);
      await fetchMyBookingRequests(); // Refresh the list
      return { success: true, data: response };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    bookingRequests,
    loading,
    error,
    pagination,
    refetch: fetchMyBookingRequests,
    createBookingRequest,
    cancelBookingRequest,
  };
};

export const useBillboardBookingRequests = (filters?: BookingFilters) => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchBillboardBookingRequests = async (newFilters?: BookingFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getBillboardBookingRequests(newFilters || filters);
      setBookingRequests(response.bookingRequests);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillboardBookingRequests();
  }, [filters?.page, filters?.status]);

  const updateBookingStatus = async (id: string, data: {
    status: 'APPROVED' | 'REJECTED';
    responseMessage?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updateBookingStatus(id, data);
      await fetchBillboardBookingRequests(); // Refresh the list
      return { success: true, data: response };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    bookingRequests,
    loading,
    error,
    pagination,
    refetch: fetchBillboardBookingRequests,
    updateBookingStatus,
  };
};
