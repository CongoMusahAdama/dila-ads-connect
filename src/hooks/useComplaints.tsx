import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Complaint {
  _id: string;
  advertiserId: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

interface ComplaintFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export const useMyComplaints = (filters?: ComplaintFilters) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchMyComplaints = async (newFilters?: ComplaintFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getMyComplaints(newFilters || filters);
      setComplaints(response.complaints);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [filters?.page, filters?.status]);

  const createComplaint = async (data: {
    subject: string;
    description: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createComplaint(data);
      await fetchMyComplaints(); // Refresh the list
      return { success: true, data: response };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    complaints,
    loading,
    error,
    pagination,
    refetch: fetchMyComplaints,
    createComplaint,
  };
};
