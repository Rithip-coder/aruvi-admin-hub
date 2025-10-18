import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { productsApi, categoriesApi, ordersApi, billingApi, historyApi, waitersApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  kudilId: string;
  items: OrderItem[];
}

export interface HistoryEntry {
  id: string;
  kudilId: string;
  items: OrderItem[];
  total: number;
  timestamp: number;
  waiterId?: string;
}

export interface Waiter {
  id: string;
  username?: string;
  password?: string;
  name: string;
  phone: string;
  email: string;
  joinDate: number;
  status: 'active' | 'inactive';
  ordersCompleted: number;
  issues: WaiterIssue[];
}

export interface WaiterIssue {
  id: string;
  date: number;
  description: string;
}

export interface KudilCompletion {
  kudilId: string;
  completed: boolean;
  timestamp: number;
}

interface AppContextType {
  orders: Record<string, OrderItem[]>;
  products: Product[];
  categories: Category[];
  history: HistoryEntry[];
  waiters: Waiter[];
  kudilCompletions: Record<string, boolean>;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  addOrderItem: (kudilId: string, item: OrderItem) => Promise<void>;
  removeOrderItem: (kudilId: string, productId: string) => Promise<void>;
  updateOrderItemQuantity: (kudilId: string, productId: string, quantity: number) => Promise<void>;
  clearKudilOrder: (kudilId: string) => Promise<void>;
  printBill: (kudilId: string, waiterId?: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addWaiter: (waiter: Omit<Waiter, 'id' | 'ordersCompleted' | 'issues'>) => Promise<void>;
  updateWaiter: (id: string, waiter: Partial<Waiter>) => Promise<void>;
  deleteWaiter: (id: string) => Promise<void>;
  addWaiterIssue: (waiterId: string, description: string) => Promise<void>;
  toggleKudilCompletion: (kudilId: string) => Promise<void>;
  getKudilOrderCount: (kudilId: string) => number;
  getKudilTotal: (kudilId: string) => number;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Record<string, OrderItem[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [kudilCompletions, setKudilCompletions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  // Load initial data from API
  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, ordersData, historyData, waitersData] = await Promise.all([
        productsApi.getAll().catch(() => []),
        categoriesApi.getAll().catch(() => []),
        ordersApi.getAll().catch(() => []),
        historyApi.getAll().catch(() => []),
        waitersApi.getAll().catch(() => []),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setHistory(historyData);
      setWaiters(waitersData);

      // Convert orders array to Record format
      const ordersMap: Record<string, OrderItem[]> = {};
      ordersData.forEach((order: any) => {
        ordersMap[order.kudilId] = order.items || [];
      });
      setOrders(ordersMap);

    } catch (error) {
      toast({
        title: "Error loading data",
        description: error instanceof Error ? error.message : "Failed to load data from server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const addOrderItem = async (kudilId: string, item: OrderItem) => {
    try {
      await ordersApi.addItem(kudilId, item);
      
      setOrders(prev => {
        const kudilOrders = prev[kudilId] || [];
        const existingItemIndex = kudilOrders.findIndex(i => i.productId === item.productId);
        
        if (existingItemIndex > -1) {
          const updated = [...kudilOrders];
          updated[existingItemIndex].quantity += item.quantity;
          return { ...prev, [kudilId]: updated };
        } else {
          return { ...prev, [kudilId]: [...kudilOrders, item] };
        }
      });
      
      toast({
        title: "Item added",
        description: "Item successfully added to order",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const removeOrderItem = async (kudilId: string, productId: string) => {
    try {
      await ordersApi.removeItem(kudilId, productId);
      
      setOrders(prev => ({
        ...prev,
        [kudilId]: (prev[kudilId] || []).filter(item => item.productId !== productId),
      }));
      
      toast({
        title: "Item removed",
        description: "Item successfully removed from order",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const updateOrderItemQuantity = async (kudilId: string, productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeOrderItem(kudilId, productId);
      return;
    }
    
    try {
      await ordersApi.updateItemQuantity(kudilId, productId, quantity);
      
      setOrders(prev => {
        const kudilOrders = prev[kudilId] || [];
        return {
          ...prev,
          [kudilId]: kudilOrders.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        };
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const clearKudilOrder = async (kudilId: string) => {
    try {
      await ordersApi.clearOrder(kudilId);
      setOrders(prev => ({ ...prev, [kudilId]: [] }));
      
      toast({
        title: "Order cleared",
        description: "All items removed from order",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear order",
        variant: "destructive",
      });
    }
  };

  const printBill = async (kudilId: string, waiterId?: string) => {
    const kudilOrders = orders[kudilId] || [];
    if (kudilOrders.length === 0) return;

    const total = kudilOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    try {
      const bill = await billingApi.print({
        kudilId,
        waiterId,
        items: kudilOrders,
        total,
      });

      // Refresh history
      const updatedHistory = await historyApi.getAll();
      setHistory(updatedHistory);
      
      // Clear the order
      setOrders(prev => ({ ...prev, [kudilId]: [] }));
      setKudilCompletions(prev => ({ ...prev, [kudilId]: false }));
      
      toast({
        title: "Bill printed",
        description: "Bill has been saved to history",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to print bill",
        variant: "destructive",
      });
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productsApi.create(product);
      setProducts(prev => [...prev, newProduct]);
      
      toast({
        title: "Product added",
        description: "Product successfully created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, product: Omit<Product, 'id'>) => {
    try {
      const updated = await productsApi.update(id, product);
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      
      toast({
        title: "Product updated",
        description: "Product successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "Product deleted",
        description: "Product successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = await categoriesApi.create(category);
      setCategories(prev => [...prev, newCategory]);
      
      toast({
        title: "Category added",
        description: "Category successfully created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (id: string, category: Omit<Category, 'id'>) => {
    try {
      const updated = await categoriesApi.update(id, category);
      setCategories(prev => prev.map(c => (c.id === id ? updated : c)));
      
      toast({
        title: "Category updated",
        description: "Category successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      
      toast({
        title: "Category deleted",
        description: "Category successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const getKudilOrderCount = (kudilId: string) => {
    const kudilOrders = orders[kudilId] || [];
    return kudilOrders.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getKudilTotal = (kudilId: string) => {
    const kudilOrders = orders[kudilId] || [];
    return kudilOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const addWaiter = async (waiter: Omit<Waiter, 'id' | 'ordersCompleted' | 'issues'>) => {
    try {
      const newWaiter = await waitersApi.create({
        username: waiter.username || '',
        password: waiter.password || '',
        name: waiter.name,
        phone: waiter.phone,
        email: waiter.email,
        status: waiter.status,
      });
      setWaiters(prev => [...prev, newWaiter]);
      
      toast({
        title: "Waiter added",
        description: "Waiter successfully created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add waiter",
        variant: "destructive",
      });
    }
  };

  const updateWaiter = async (id: string, waiter: Partial<Waiter>) => {
    try {
      const updated = await waitersApi.update(id, waiter);
      setWaiters(prev => prev.map(w => (w.id === id ? updated : w)));
      
      toast({
        title: "Waiter updated",
        description: "Waiter successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update waiter",
        variant: "destructive",
      });
    }
  };

  const deleteWaiter = async (id: string) => {
    try {
      await waitersApi.delete(id);
      setWaiters(prev => prev.filter(w => w.id !== id));
      
      toast({
        title: "Waiter deleted",
        description: "Waiter successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete waiter",
        variant: "destructive",
      });
    }
  };

  const addWaiterIssue = async (waiterId: string, description: string) => {
    try {
      const issue = await waitersApi.addIssue(waiterId, description);
      setWaiters(prev =>
        prev.map(w =>
          w.id === waiterId ? { ...w, issues: [...w.issues, issue] } : w
        )
      );
      
      toast({
        title: "Issue added",
        description: "Issue successfully recorded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add issue",
        variant: "destructive",
      });
    }
  };

  const toggleKudilCompletion = async (kudilId: string) => {
    const newStatus = !kudilCompletions[kudilId];
    
    try {
      await ordersApi.markComplete(kudilId, newStatus);
      setKudilCompletions(prev => ({ ...prev, [kudilId]: newStatus }));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update completion status",
        variant: "destructive",
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        products,
        categories,
        history,
        waiters,
        kudilCompletions,
        loading,
        isAuthenticated,
        login,
        logout,
        addOrderItem,
        removeOrderItem,
        updateOrderItemQuantity,
        clearKudilOrder,
        printBill,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addWaiter,
        updateWaiter,
        deleteWaiter,
        addWaiterIssue,
        toggleKudilCompletion,
        getKudilOrderCount,
        getKudilTotal,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
