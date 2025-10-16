import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle, FileText } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { getKudilOrderCount, clearKudilOrder } = useApp();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000); // Auto-refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Refreshed",
      description: "Dashboard updated successfully",
    });
  };

  const handleWaiterComplete = (kudilNumber: number) => {
    const kudilId = `kudil${kudilNumber}`;
    clearKudilOrder(kudilId);
    toast({
      title: "Order Cleared",
      description: `Kudil ${kudilNumber} order has been marked complete`,
    });
  };

  const handleGoToBill = (kudilNumber: number) => {
    navigate(`/bill/${kudilNumber}`);
  };

  const kudils = Array.from({ length: 8 }, (_, i) => {
    const kudilNumber = i + 1;
    const kudilId = `kudil${kudilNumber}`;
    const orderCount = getKudilOrderCount(kudilId);
    
    return {
      number: kudilNumber,
      id: kudilId,
      orderCount,
    };
  });

  return (
    <div className="p-8" key={refreshKey}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage all Kudil orders</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="lg">
          <RefreshCw className="w-5 h-5 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kudils.map((kudil) => (
          <Card
            key={kudil.id}
            className="p-6 hover:shadow-lg transition-all border-2"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  Kudil {kudil.number}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {kudil.orderCount}
                  </span>
                  <span className="text-sm text-muted-foreground">items</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleWaiterComplete(kudil.number)}
                  variant="outline"
                  className="w-full"
                  disabled={kudil.orderCount === 0}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Waiter Complete
                </Button>
                <Button
                  onClick={() => handleGoToBill(kudil.number)}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Go to Bill
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
