import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function History() {
  const { history } = useApp();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set());

  const filteredHistory = history.filter((entry) => {
    const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
    return entryDate === selectedDate;
  });

  const toggleExpand = (id: string) => {
    setExpandedBills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Bill History</h1>
        <p className="text-muted-foreground mt-1">View all printed bills</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredHistory.length} bill(s)
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No bills found for this date</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry) => {
            const isExpanded = expandedBills.has(entry.id);
            const kudilNumber = entry.kudilId.replace('kudil', '');
            
            return (
              <Card key={entry.id} className="overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpand(entry.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">Kudil {kudilNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {entry.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">₹{entry.total}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-6 bg-muted/30">
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-muted-foreground pb-2 border-b border-border">
                        <div className="col-span-6">Item</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-2 text-right">Total</div>
                      </div>
                      {entry.items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 text-sm">
                          <div className="col-span-6">{item.productName}</div>
                          <div className="col-span-2 text-center">{item.quantity}</div>
                          <div className="col-span-2 text-right">₹{item.price}</div>
                          <div className="col-span-2 text-right font-semibold">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
