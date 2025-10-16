import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

interface AppContextType {
  orders: Record<string, OrderItem[]>;
  products: Product[];
  categories: Category[];
  history: HistoryEntry[];
  addOrderItem: (kudilId: string, item: OrderItem) => void;
  removeOrderItem: (kudilId: string, productId: string) => void;
  updateOrderItemQuantity: (kudilId: string, productId: string, quantity: number) => void;
  clearKudilOrder: (kudilId: string) => void;
  printBill: (kudilId: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  getKudilOrderCount: (kudilId: string) => number;
  getKudilTotal: (kudilId: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  ORDERS: 'aruvi_orders',
  PRODUCTS: 'aruvi_products',
  CATEGORIES: 'aruvi_categories',
  HISTORY: 'aruvi_history',
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Record<string, OrderItem[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const loadedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const loadedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const loadedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);

    if (loadedOrders) setOrders(JSON.parse(loadedOrders));
    if (loadedProducts) setProducts(JSON.parse(loadedProducts));
    if (loadedCategories) setCategories(JSON.parse(loadedCategories));
    if (loadedHistory) setHistory(JSON.parse(loadedHistory));
    
    // Initialize with sample orders for testing if not present
    if (!loadedOrders) {
      const initialOrders: Record<string, OrderItem[]> = {
        kudil1: [
          { productId: '3', productName: 'Biryani', quantity: 2, price: 220 },
          { productId: '7', productName: 'Mango Lassi', quantity: 2, price: 80 },
        ],
        kudil2: [
          { productId: '1', productName: 'Chicken 65', quantity: 1, price: 180 },
          { productId: '4', productName: 'Butter Chicken', quantity: 1, price: 280 },
          { productId: '6', productName: 'Fresh Lime Soda', quantity: 3, price: 60 },
        ],
        kudil3: [
          { productId: '5', productName: 'Masala Dosa', quantity: 3, price: 120 },
          { productId: '6', productName: 'Fresh Lime Soda', quantity: 3, price: 60 },
        ],
        kudil4: [],
        kudil5: [
          { productId: '2', productName: 'Paneer Tikka', quantity: 1, price: 160 },
          { productId: '8', productName: 'Gulab Jamun', quantity: 2, price: 70 },
        ],
        kudil6: [],
        kudil7: [],
        kudil8: [
          { productId: '3', productName: 'Biryani', quantity: 1, price: 220 },
        ],
      };
      setOrders(initialOrders);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
    }

    // Add sample data if empty
    if (!loadedCategories) {
      const sampleCategories: Category[] = [
        { id: '1', name: 'Starters' },
        { id: '2', name: 'Main Course' },
        { id: '3', name: 'Beverages' },
        { id: '4', name: 'Desserts' },
      ];
      setCategories(sampleCategories);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(sampleCategories));
    }

    if (!loadedProducts) {
      const sampleProducts: Product[] = [
        { id: '1', name: 'Chicken 65', price: 180, categoryId: '1' },
        { id: '2', name: 'Paneer Tikka', price: 160, categoryId: '1' },
        { id: '3', name: 'Biryani', price: 220, categoryId: '2' },
        { id: '4', name: 'Butter Chicken', price: 280, categoryId: '2' },
        { id: '5', name: 'Masala Dosa', price: 120, categoryId: '2' },
        { id: '6', name: 'Fresh Lime Soda', price: 60, categoryId: '3' },
        { id: '7', name: 'Mango Lassi', price: 80, categoryId: '3' },
        { id: '8', name: 'Gulab Jamun', price: 70, categoryId: '4' },
      ];
      setProducts(sampleProducts);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(sampleProducts));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

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
  };

  const removeOrderItem = (kudilId: string, productId: string) => {
    setOrders(prev => ({
      ...prev,
      [kudilId]: (prev[kudilId] || []).filter(item => item.productId !== productId),
    }));
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
  };

  const printBill = (kudilId: string) => {
    const kudilOrders = orders[kudilId] || [];
    if (kudilOrders.length === 0) return;

    const total = kudilOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const historyEntry: HistoryEntry = {
      id: `${Date.now()}`,
      kudilId,
      items: kudilOrders,
      total,
      timestamp: Date.now(),
    };

    setHistory(prev => [historyEntry, ...prev]);
    clearKudilOrder(kudilId);
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, product: Omit<Product, 'id'>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...product, id } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, category: Omit<Category, 'id'>) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...category, id } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const getKudilOrderCount = (kudilId: string) => {
    const kudilOrders = orders[kudilId] || [];
    return kudilOrders.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getKudilTotal = (kudilId: string) => {
    const kudilOrders = orders[kudilId] || [];
    return kudilOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        products,
        categories,
        history,
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
        getKudilOrderCount,
        getKudilTotal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
