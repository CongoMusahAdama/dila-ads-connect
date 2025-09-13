import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalBillboards: number;
  totalBookings: number;
  pendingComplaints: number;
  pendingDisputes: number;
  pendingBillboards: number;
  recentBookings: any[];
}

interface Complaint {
  _id: string;
  advertiserId: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

interface Dispute {
  _id: string;
  billboardId: {
    _id: string;
    name: string;
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
  hasDispute: boolean;
  disputeReason?: string;
  disputeStatus?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

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

interface AdminFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getDashboardStats();
      setStats(response.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats,
  };
};

export const useAdminComplaints = (filters?: AdminFilters) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchComplaints = async (newFilters?: AdminFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getAllComplaints(newFilters || filters);
      setComplaints(response.complaints);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filters?.page, filters?.status]);

  const updateComplaint = async (id: string, data: {
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    adminResponse?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updateComplaint(id, data);
      await fetchComplaints(); // Refresh the list
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
    refetch: fetchComplaints,
    updateComplaint,
  };
};

export const useAdminDisputes = (filters?: AdminFilters) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchDisputes = async (newFilters?: AdminFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getAllDisputes(newFilters || filters);
      setDisputes(response.disputes);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [filters?.page, filters?.status]);

  const updateDispute = async (id: string, data: {
    disputeStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updateDispute(id, data);
      await fetchDisputes(); // Refresh the list
      return { success: true, data: response };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    disputes,
    loading,
    error,
    pagination,
    refetch: fetchDisputes,
    updateDispute,
  };
};

export const useAdminBillboards = (filters?: { page?: number; limit?: number }) => {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchPendingBillboards = async (newFilters?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getPendingBillboards(newFilters || filters);
      setBillboards(response.billboards);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBillboards();
  }, [filters?.page]);

  const updateBillboardApproval = async (id: string, data: {
    isApproved: boolean;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updateBillboardApproval(id, data);
      await fetchPendingBillboards(); // Refresh the list
      return { success: true, data: response };
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
    refetch: fetchPendingBillboards,
    updateBillboardApproval,
  };
};

export const useAdminUsers = (filters?: { page?: number; limit?: number }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchUsers = async (newFilters?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getAllUsers(newFilters || filters);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters?.page, filters?.limit]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers,
  };
};
