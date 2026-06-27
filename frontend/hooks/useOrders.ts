"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Customer {
  customer_id: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
}

export interface Order {
  id: string;
  customer_id: string | null;
  transaction_date: string;
  container_type_id: number;
  quantity: number;
  amount: number;
  is_walk_in: boolean;
  created_at: string;
}

export interface OrderFormData {
  customer_id: string | null;
  transaction_date: string;
  container_type_id: number;
  quantity: number;
  is_walk_in: boolean;
  isNewCustomer: boolean;
  newFirstName: string;
  newLastName: string;
  newContact: string;
}

export interface OrderFilters {
  search: string;
  type: "all" | "1" | "2";
  dateFrom: string;
  dateTo: string;
}

const today = new Date().toLocaleDateString("en-CA");
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA");

const DEFAULT_FORM: OrderFormData = {
  customer_id: null,
  transaction_date: today,
  container_type_id: 1,
  quantity: 1,
  is_walk_in: false,
  isNewCustomer: false,
  newFirstName: "",
  newLastName: "",
  newContact: "",
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderFormData>(DEFAULT_FORM);

  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    type: "all",
    dateFrom: thirtyDaysAgo,
    dateTo: today,
  });

  async function fetchCustomers() {
    const { data } = await supabase
      .from("customers")
      .select("customer_id, first_name, last_name, contact_number")
      .order("first_name", { ascending: true });
    setCustomers(data || []);
  }

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("transaction_date", filters.dateFrom)
        .lte("transaction_date", filters.dateTo)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => { fetchCustomers(); }, []);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      filters.search === "" ||
      (o.is_walk_in && "walk-in".includes(filters.search.toLowerCase())) ||
      (!o.is_walk_in && o.customer_id && customers.some(c => 
        c.customer_id === o.customer_id && 
        (`${c.first_name} ${c.last_name}`.toLowerCase().includes(filters.search.toLowerCase()))
      ));
    const matchesType =
      filters.type === "all" || o.container_type_id === Number(filters.type);
    return matchesSearch && matchesType;
  });

  function openAdd() {
    setEditingOrder(null);
    setForm(DEFAULT_FORM);
    setIsModalOpen(true);
  }

  function openEdit(order: Order) {
    setEditingOrder(order);
    setForm({
      customer_id: order.customer_id,
      transaction_date: order.transaction_date,
      container_type_id: order.container_type_id,
      quantity: order.quantity,
      is_walk_in: order.is_walk_in,
      isNewCustomer: false,
      newFirstName: "",
      newLastName: "",
      newContact: "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingOrder(null);
    setForm(DEFAULT_FORM);
    setError(null);
  }

  async function saveOrder() {
    try {
      setSaving(true);
      setError(null);

      let customerId = form.customer_id;

      if (form.isNewCustomer && !form.is_walk_in) {
        if (!form.newFirstName.trim() || !form.newLastName.trim()) {
          setError("First and last name are required for new customers.");
          return;
        }
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert([{
            first_name: form.newFirstName.trim(),
            last_name: form.newLastName.trim(),
            contact_number: form.newContact.trim() || null,
          }])
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.customer_id;
        await fetchCustomers();
      }

      const amount = form.quantity * 20;

      const payload = {
        customer_id: form.is_walk_in ? null : customerId,
        transaction_date: form.transaction_date,
        container_type_id: form.container_type_id,
        quantity: form.quantity,
        amount,
        is_walk_in: form.is_walk_in,
      };

      if (editingOrder) {
        const { error } = await supabase.from("orders").update(payload).eq("id", editingOrder.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("orders").insert([payload]);
        if (error) throw error;
      }

      closeModal();
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteOrder(id: string) {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return {
    orders: filtered,
    totalCount: orders.length,
    customers,
    loading,
    saving,
    error,
    filters,
    setFilters,
    isModalOpen,
    editingOrder,
    form,
    setForm,
    openAdd,
    openEdit,
    closeModal,
    saveOrder,
    deleteOrder,
  };
}