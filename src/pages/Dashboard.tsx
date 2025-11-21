import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ShoppingCart, Edit, Plus, Minus, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    orders, 
    products, 
    categories, 
    tableCompletions,
    getTableOrderCount, 
    getTableTotal,
    addOrderItem,
    removeOrderItem,
    updateOrderItemQuantity,
    toggleTableCompletion,
  } = useApp();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Dashboard refreshed');
  };

  const handleGoToBill = (tableId: string) => {
    const tableNumber = tableId.replace('table', '');
    navigate(`/bill/${tableNumber}`);
  };

  const handleAddItem = () => {
    if (!editingTable || !selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    const product = products.find(p => p.id === selectedProduct);
    if (product) {
      addOrderItem(editingTable, {
        productId: product.id,
        productName: product.name,
        quantity,
        price: product.price,
      });
      toast.success('Item added');
      setSelectedProduct('');
      setQuantity(1);
    }
  };

  const handleCompleteToggle = (tableId: string) => {
    toggleTableCompletion(tableId);
    toast.success(tableCompletions[tableId] ? 'Marked as incomplete' : 'Marked as complete');
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : products;

  const tables = Array.from({ length: 8 }, (_, i) => {
    const tableNumber = i + 1;
    const tableId = `table${tableNumber}`;
    const tableOrders = orders[tableId] || [];
    
    return {
      name: `Table ${tableNumber}`,
      number: tableNumber,
      id: tableId,
      orders: tableOrders,
    };
  });

  return (
    <div className="p-4 md:p-8" key={refreshKey}>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor all table orders</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {tables.map((table) => {
          const itemCount = getTableOrderCount(table.id);
          const total = getTableTotal(table.id);
          const isCompleted = tableCompletions[table.id];

          return (
            <Card 
              key={table.id} 
              className={cn(
                "overflow-hidden hover:shadow-lg transition-all",
                isCompleted && "border-2 border-primary bg-primary/5"
              )}
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">{table.name}</h2>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => {
                            setEditingTable(table.id);
                            setSelectedCategory('');
                            setSelectedProduct('');
                            setQuantity(1);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Manage Orders - {table.name}</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh]">
                          <div className="space-y-4 py-4 px-1">
                            {/* Current Items */}
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">Current Items</Label>
                              {table.orders.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No items</p>
                              ) : (
                                <div className="space-y-2">
                                  {table.orders.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                                      <span className="flex-1 text-sm">{item.productName}</span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6"
                                          onClick={() => updateOrderItemQuantity(table.id, item.productId, item.quantity - 1)}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6"
                                          onClick={() => updateOrderItemQuantity(table.id, item.productId, item.quantity + 1)}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6 ml-2"
                                          onClick={() => {
                                            removeOrderItem(table.id, item.productId);
                                            toast.success('Item removed');
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Add New Item */}
                            <div className="border-t pt-4">
                              <Label className="text-sm font-semibold mb-2 block">Add New Item</Label>
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-xs">Category</Label>
                                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">Product</Label>
                                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {filteredProducts.map(prod => (
                                        <SelectItem key={prod.id} value={prod.id}>
                                          {prod.name} - ₹{prod.price}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">Quantity</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                  />
                                </div>
                                <Button onClick={handleAddItem} className="w-full">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Item
                                </Button>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                    <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                </div>

                <ScrollArea className="h-32 mb-4">
                  <div className="pr-4">
                    <p className="text-sm text-muted-foreground mb-2">Current Orders:</p>
                    {table.orders.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No orders yet</p>
                    ) : (
                      <div className="space-y-1">
                        {table.orders.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.productName}</span>
                            <span className="font-medium">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total:</span>
                    <span className="text-xl md:text-2xl font-bold text-primary">₹{total}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {itemCount} item(s)
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    variant={isCompleted ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleCompleteToggle(table.id)}
                  >
                    {isCompleted ? '✓ Completed' : 'Waiter Complete'}
                  </Button>
                  <Button 
                    className="w-full"
                    onClick={() => handleGoToBill(table.id)}
                  >
                    Go to Bill
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}