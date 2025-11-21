import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Printer, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

export default function BillScreen() {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const navigate = useNavigate();
  const {
    orders,
    products,
    categories,
    addOrderItem,
    removeOrderItem,
    updateOrderItemQuantity,
    printBill,
    getTableTotal,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');

  const tableId = `table${tableNumber}`;
  const currentOrder = orders[tableId] || [];
  const total = getTableTotal(tableId);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : [];

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a product and enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    addOrderItem(tableId, {
      productId: product.id,
      productName: product.name,
      quantity: parseInt(quantity),
      price: product.price,
    });

    // Reset form
    setSelectedCategory('');
    setSelectedProduct('');
    setQuantity('1');

    toast({
      title: "Item Added",
      description: `${product.name} x${quantity} added to bill`,
    });
  };

  const handlePrint = () => {
    if (currentOrder.length === 0) {
      toast({
        title: "Empty Bill",
        description: "Cannot print an empty bill",
        variant: "destructive",
      });
      return;
    }

    // Create thermal print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @media print {
            @page { 
              size: 80mm auto; 
              margin: 0; 
            }
            body { 
              margin: 0; 
              padding: 10px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 80mm;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 300px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 16px;
            font-weight: bold;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 30px;
            text-align: center;
          }
          .item-price {
            width: 60px;
            text-align: right;
          }
          .total-section {
            border-top: 2px dashed #000;
            margin-top: 10px;
            padding-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            font-weight: bold;
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            border-top: 2px dashed #000;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>DEEPIKA RESTAURANT</h2>
          <p>Table ${tableNumber}</p>
          <p>${new Date().toLocaleString()}</p>
        </div>
        
        <div class="items">
          ${currentOrder.map(item => `
            <div class="item-row">
              <span class="item-name">${item.productName}</span>
              <span class="item-qty">x${item.quantity}</span>
              <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="total-section">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>₹${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank You!</p>
          <p>Visit Again</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    }

    // Save to history via API
    printBill(tableId);
    toast({
      title: "Bill Printed",
      description: "Bill has been sent to printer and saved to history",
    });
    
    // Navigate after a short delay to ensure print dialog opens
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Table {tableNumber} - Bill</h1>
            <p className="text-muted-foreground mt-1">Manage billing for this table</p>
          </div>
        </div>

        {/* Receipt Style Bill */}
        <Card className="p-6 mb-6 bg-card">
          <div className="border-b-2 border-dashed border-border pb-4 mb-4">
            <h2 className="text-xl font-bold text-center">DEEPIKA RESTAURANT</h2>
            <p className="text-center text-sm text-muted-foreground">Table {tableNumber}</p>
          </div>

          {currentOrder.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items in this bill yet
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-muted-foreground border-b border-border pb-2">
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {currentOrder.map((item) => (
                <div key={item.productId} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5 font-medium">{item.productName}</div>
                  <div className="col-span-2 text-center">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateOrderItemQuantity(tableId, item.productId, parseInt(e.target.value) || 0)
                      }
                      className="w-16 text-center"
                    />
                  </div>
                  <div className="col-span-2 text-right">₹{item.price}</div>
                  <div className="col-span-2 text-right font-semibold">
                    ₹{item.price * item.quantity}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOrderItem(tableId, item.productId)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-t-2 border-dashed border-border pt-4 mt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>TOTAL</span>
                  <span className="text-primary">₹{total}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Add Item Section */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedProduct}
              onValueChange={setSelectedProduct}
              disabled={!selectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - ₹{product.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
            />

            <Button onClick={handleAddItem} className="w-full">
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </Button>
          </div>
        </Card>

        {/* Print Button */}
        <Button
          onClick={handlePrint}
          size="lg"
          className="w-full"
          disabled={currentOrder.length === 0}
        >
          <Printer className="w-5 h-5 mr-2" />
          Print Bill
        </Button>
      </div>
    </div>
  );
}
