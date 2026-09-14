import { api } from "./api";

export interface DashboardGrowth {
  current: number;
  previous: number;
  percentage: number;
  direction: "up" | "down" | "neutral";
}

export interface DashboardResponse {
  period: {
    startDate: string;
    endDate: string;
  };

  comparisonPeriod: {
    startDate: string;
    endDate: string;
  };

  overview: {
    revenue: DashboardGrowth;
    orders: DashboardGrowth;
    customers: DashboardGrowth;
    averageOrderValue: DashboardGrowth;
  };

  orderStatus: {
    status: string;
    count: number;
  }[];

  paymentStatus: {
    status: string;
    count: number;
    amount: number;
  }[];

  salesChart: {
    date: string;
    revenue: number;
  }[];

  topProducts: {
    productName: string;
    quantity: number;
    revenue: number;
  }[];

  inventory: {
    totalProducts: number;
    totalVariants: number;
    lowStock: {
      id: string;
      sku: string;
      name: string;
      stock: number;
      price: number;
      product: {
        id: string;
        name: string;
      };
    }[];
  };

  customers: {
    newCustomers: number;
    activeCustomers: number;
  };

  returns: {
    pending: number;
  };

  recentOrders: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    itemsCount: number;
    customer: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

export interface DashboardParams {
  startDate?: string;
  endDate?: string;
}

export const dashboardService = {
  getDashboard: async (
    params?: DashboardParams,
  ): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>("/dashboard", {
      params,
    });

    return response.data;
  },
};
