import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Billboard {
  _id: string;
  ownerId: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  name: string;
  location: string;
  size: string;
  pricePerDay: number;
  description?: string;
  imageUrl?: string;
  phone?: string;
  email?: string;
  isAvailable: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BillboardFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
}

export const useBillboards = (filters?: BillboardFilters) => {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchBillboards = async (newFilters?: BillboardFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getBillboards(newFilters || filters);
      setBillboards(response.billboards);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters) {
      fetchBillboards();
    }
  }, [filters?.page, filters?.search, filters?.location, filters?.minPrice, filters?.maxPrice, filters?.size]);

  return {
    billboards,
    loading,
    error,
    pagination,
    refetch: fetchBillboards,
  };
};

export const useFeaturedBillboards = () => {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedBillboards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getFeaturedBillboards();
      setBillboards(response.billboards);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedBillboards();
  }, []);

  return {
    billboards,
    loading,
    error,
    refetch: fetchFeaturedBillboards,
  };
};

export const useMyBillboards = (filters?: { page?: number; limit?: number }) => {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchMyBillboards = async (newFilters?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getMyBillboards(newFilters || filters);
      setBillboards(response.billboards);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBillboards();
  }, [filters?.page]);

  const createBillboard = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createBillboard(formData);
      await fetchMyBillboards(); // Refresh the list
      return { success: true, data: response };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateBillboard = async (id: string, formData: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updateBillboard(id, formData);
      await fetchMyBillboards(); // Refresh the list
      return { success: true, data: response };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteBillboard = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.deleteBillboard(id);
      await fetchMyBillboards(); // Refresh the list
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    billboards,
    loading,
    error,
    pagination,
    refetch: fetchMyBillboards,
    createBillboard,
    updateBillboard,
    deleteBillboard,
  };
};

export const useBillboard = (id: string) => {
  const [billboard, setBillboard] = useState<Billboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBillboard = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getBillboardById(id);
      setBillboard(response.billboard);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillboard();
  }, [id]);

  return {
    billboard,
    loading,
    error,
    refetch: fetchBillboard,
  };
};
