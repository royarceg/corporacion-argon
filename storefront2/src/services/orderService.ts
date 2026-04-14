import api from "./api";

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  color: string | null;
  size: string | null;
  quantity_requested: number;
  quantity_confirmed: number | null;
  unit_price_initial: string;
  unit_price_confirmed: string | null;
  line_total_initial: string;
  line_total_confirmed: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  customer_po: string;
  wanted_date: string | null;
  status: "pending" | "confirmed" | "cancelled";
  subtotal_initial: string;
  subtotal_confirmed: string | null;
  created_at: string;
  confirmed_at: string | null;
  created_by: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  company_name: string;
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const { data } = await api.get<{ success: boolean; orders: Order[] }>("/orders");
    return data.orders;
  },

  async getOrderById(id: number): Promise<OrderDetail> {
    const { data } = await api.get<{ success: boolean; order: OrderDetail }>(`/orders/${id}`);
    return data.order;
  },

  async createOrder(
    customer_po: string,
    items: { product_id: number; quantity: number }[],
    wanted_date?: string,
  ): Promise<{ order_number: string; id: number }> {
    const { data } = await api.post<{ success: boolean; order: { id: number; order_number: string } }>("/orders", {
      customer_po,
      items,
      ...(wanted_date ? { wanted_date } : {}),
    });
    return data.order;
  },

  // Admin
  async getAdminOrderById(id: number): Promise<OrderDetail> {
    const { data } = await api.get<{ success: boolean; order: OrderDetail }>(`/orders/admin/${id}`);
    return data.order;
  },

  async getAllOrders(): Promise<Order[]> {
    const { data } = await api.get<{ success: boolean; orders: Order[] }>("/orders/admin/all");
    return data.orders;
  },

  async confirmOrder(id: number, items: { id: number; quantity_confirmed: number; unit_price_confirmed: number }[]): Promise<void> {
    await api.put(`/orders/${id}/confirm`, { items });
  },
};
