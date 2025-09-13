const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'ADVERTISER' | 'OWNER';
  }) {
    return this.request<{
      message: string;
      token: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string, phone?: string) {
    const loginData: any = { password };
    if (email) {
      loginData.email = email;
    } else if (phone) {
      loginData.phone = phone;
    }
    
    return this.request<{
      message: string;
      token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async getProfile() {
    return this.request<{ user: any }>('/auth/profile');
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    return this.request<{
      message: string;
      profile: any;
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Billboard endpoints
  async getBillboards(params?: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<{
      billboards: any[];
      pagination: any;
    }>(`/billboards${queryString ? `?${queryString}` : ''}`);
  }

  async getFeaturedBillboards() {
    return this.request<{ billboards: any[] }>('/billboards/featured');
  }

  async getBillboardById(id: string) {
    return this.request<{ billboard: any }>(`/billboards/${id}`);
  }

  async getMyBillboards(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<{
      billboards: any[];
      pagination: any;
    }>(`/billboards/my/list${queryString ? `?${queryString}` : ''}`);
  }

  async getOwnerDashboardStats() {
    return this.request<{
      stats: {
        totalBillboards: number;
        activeBillboards: number;
        pendingRequests: number;
        totalBookings: number;
        totalRevenue: number;
        occupancyRate: number;
      };
      recentBookings: any[];
    }>('/billboards/my/dashboard-stats');
  }

  async createBillboard(data: FormData) {
    const url = `${this.baseURL}/billboards`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateBillboard(id: string, data: FormData) {
    const url = `${this.baseURL}/billboards/${id}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteBillboard(id: string) {
    return this.request<{ message: string }>(`/billboards/${id}`, {
      method: 'DELETE',
    });
  }

  // Booking endpoints
  async createBookingRequest(data: {
    billboardId: string;
    startDate: string;
    endDate: string;
    message?: string;
  }) {
    return this.request<{
      message: string;
      bookingRequest: any;
    }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyBookingRequests(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<{
      bookingRequests: any[];
      pagination: any;
    }>(`/bookings/my${queryString ? `?${queryString}` : ''}`);
  }

  async getBillboardBookingRequests(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<{
      bookingRequests: any[];
      pagination: any;
    }>(`/bookings/billboard-requests${queryString ? `?${queryString}` : ''}`);
  }

  async updateBookingStatus(id: string, data: {
    status: 'APPROVED' | 'REJECTED';
    responseMessage?: string;
  }) {
    return this.request<{
      message: string;
      bookingRequest: any;
    }>(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelBookingRequest(id: string) {
    return this.request<{
      message: string;
      bookingRequest: any;
    }>(`/bookings/my/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async getBookingRequestById(id: string) {
    return this.request<{ bookingRequest: any }>(`/bookings/${id}`);
  }

  async createDispute(id: string, data: {
    reason: string;
    description: string;
  }) {
    return this.request<{
      message: string;
      dispute: any;
    }>(`/bookings/${id}/dispute`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Complaint endpoints
  async createComplaint(data: {
    subject: string;
    description: string;
  }) {
    return this.request<{
      message: string;
      complaint: any;
    }>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyComplaints(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<{
      complaints: any[];
      pagination: any;
    }>(`/complaints/my${queryString ? `?${queryString}` : ''}`);
  }

  // Admin endpoints
  async getDashboardStats() {
    return this.request<{
      stats: {
        totalUsers: number;
        totalBillboards: number;
        totalBookings: number;
        pendingComplaints: number;
        pendingDisputes: number;
        pendingBillboards: number;
        recentBookings: any[];
      };
    }>('/admin/dashboard');
  }

  async getAllComplaints(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<{
      complaints: any[];
      pagination: any;
    }>(`/admin/complaints${queryString ? `?${queryString}` : ''}`);
  }

  async getComplaintById(id: string) {
    return this.request<{ complaint: any }>(`/admin/complaints/${id}`);
  }

  async updateComplaint(id: string, data: {
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    adminResponse?: string;
  }) {
    return this.request<{
      message: string;
      complaint: any;
    }>(`/admin/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAllDisputes(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<{
      disputes: any[];
      pagination: any;
    }>(`/admin/disputes${queryString ? `?${queryString}` : ''}`);
  }

  async getDisputeById(id: string) {
    return this.request<{ dispute: any }>(`/admin/disputes/${id}`);
  }

  async updateDispute(id: string, data: {
    disputeStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  }) {
    return this.request<{
      message: string;
      dispute: any;
    }>(`/admin/disputes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPendingBillboards(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<{
      billboards: any[];
      pagination: any;
    }>(`/admin/billboards/pending${queryString ? `?${queryString}` : ''}`);
  }

  async updateBillboardApproval(id: string, data: {
    isApproved: boolean;
  }) {
    return this.request<{
      message: string;
      billboard: any;
    }>(`/admin/billboards/${id}/approval`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAllUsers(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<{
      users: any[];
      pagination: any;
    }>(`/admin/users${queryString ? `?${queryString}` : ''}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
