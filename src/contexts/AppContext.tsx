import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  addOrderItem: (kudilId: string, item: OrderItem) => void;
  removeOrderItem: (kudilId: string, productId: string) => void;
  updateOrderItemQuantity: (kudilId: string, productId: string, quantity: number) => void;
  clearKudilOrder: (kudilId: string) => void;
  printBill: (kudilId: string, waiterId?: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  addWaiter: (waiter: Omit<Waiter, 'id' | 'ordersCompleted' | 'issues'>) => void;
  updateWaiter: (id: string, waiter: Partial<Waiter>) => void;
  deleteWaiter: (id: string) => void;
  addWaiterIssue: (waiterId: string, description: string) => void;
  toggleKudilCompletion: (kudilId: string) => void;
  getKudilOrderCount: (kudilId: string) => number;
  getKudilTotal: (kudilId: string) => number;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

  // Load initial data from localStorage
  const loadData = () => {
    try {
      setLoading(true);
      
      const storedProducts = localStorage.getItem('products');
      const storedCategories = localStorage.getItem('categories');
      const storedOrders = localStorage.getItem('orders');
      const storedHistory = localStorage.getItem('history');
      const storedWaiters = localStorage.getItem('waiters');
      const storedCompletions = localStorage.getItem('kudilCompletions');

      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      if (storedWaiters) setWaiters(JSON.parse(storedWaiters));
      if (storedCompletions) setKudilCompletions(JSON.parse(storedCompletions));
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load data from storage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }, [orders, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('history', JSON.stringify(history));
    }
  }, [history, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('waiters', JSON.stringify(waiters));
    }
  }, [waiters, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('kudilCompletions', JSON.stringify(kudilCompletions));
    }
  }, [kudilCompletions, loading]);

  const refreshData = () => {
    loadData();
  };

  const addOrderItem = (kudilId: string, item: OrderItem) => {
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
  };

  const removeOrderItem = (kudilId: string, productId: string) => {
    setOrders(prev => ({
      ...prev,
      [kudilId]: (prev[kudilId] || []).filter(item => item.productId !== productId),
    }));
    
    toast({
      title: "Item removed",
      description: "Item successfully removed from order",
    });
  };

  const updateOrderItemQuantity = (kudilId: string, productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeOrderItem(kudilId, productId);
      return;
    }
    
    setOrders(prev => {
      const kudilOrders = prev[kudilId] || [];
      return {
        ...prev,
        [kudilId]: kudilOrders.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      };
    });
  };

  const clearKudilOrder = (kudilId: string) => {
    setOrders(prev => ({ ...prev, [kudilId]: [] }));
    
    toast({
      title: "Order cleared",
      description: "All items removed from order",
    });
  };

  const printBill = (kudilId: string, waiterId?: string) => {
    const kudilOrders = orders[kudilId] || [];
    if (kudilOrders.length === 0) return;

    const total = kudilOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const newBill: HistoryEntry = {
      id: generateId(),
      kudilId,
      waiterId,
      items: kudilOrders,
      total,
      timestamp: Date.now(),
    };

    setHistory(prev => [newBill, ...prev]);
    setOrders(prev => ({ ...prev, [kudilId]: [] }));
    setKudilCompletions(prev => ({ ...prev, [kudilId]: false }));
    
    toast({
      title: "Bill printed",
      description: "Bill has been saved to history",
    });
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: generateId(),
    };
    setProducts(prev => [...prev, newProduct]);
    
    toast({
      title: "Product added",
      description: "Product successfully created",
    });
  };

  const updateProduct = (id: string, product: Omit<Product, 'id'>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...product, id } : p)));
    
    toast({
      title: "Product updated",
      description: "Product successfully updated",
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    
    toast({
      title: "Product deleted",
      description: "Product successfully deleted",
    });
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
    };
    setCategories(prev => [...prev, newCategory]);
    
    toast({
      title: "Category added",
      description: "Category successfully created",
    });
  };

  const updateCategory = (id: string, category: Omit<Category, 'id'>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...category, id } : c)));
    
    toast({
      title: "Category updated",
      description: "Category successfully updated",
    });
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    
    toast({
      title: "Category deleted",
      description: "Category successfully deleted",
    });
  };

  const getKudilOrderCount = (kudilId: string) => {
    const kudilOrders = orders[kudilId] || [];
    return kudilOrders.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getKudilTotal = (kudilId: string) => {
    const kudilOrders = orders[kudilId] || [];
    return kudilOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const addWaiter = (waiter: Omit<Waiter, 'id' | 'ordersCompleted' | 'issues'>) => {
    const newWaiter: Waiter = {
      ...waiter,
      id: generateId(),
      ordersCompleted: 0,
      issues: [],
      joinDate: Date.now(),
    };
    setWaiters(prev => [...prev, newWaiter]);
    
    toast({
      title: "Waiter added",
      description: "Waiter successfully created",
    });
  };

  const updateWaiter = (id: string, waiter: Partial<Waiter>) => {
    setWaiters(prev => prev.map(w => (w.id === id ? { ...w, ...waiter } : w)));
    
    toast({
      title: "Waiter updated",
      description: "Waiter successfully updated",
    });
  };

  const deleteWaiter = (id: string) => {
    setWaiters(prev => prev.filter(w => w.id !== id));
    
    toast({
      title: "Waiter deleted",
      description: "Waiter successfully deleted",
    });
  };

  const addWaiterIssue = (waiterId: string, description: string) => {
    const newIssue: WaiterIssue = {
      id: generateId(),
      date: Date.now(),
      description,
    };
    
    setWaiters(prev =>
      prev.map(w =>
        w.id === waiterId ? { ...w, issues: [...w.issues, newIssue] } : w
      )
    );
    
    toast({
      title: "Issue added",
      description: "Issue successfully recorded",
    });
  };

  const toggleKudilCompletion = (kudilId: string) => {
    setKudilCompletions(prev => ({ ...prev, [kudilId]: !prev[kudilId] }));
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
