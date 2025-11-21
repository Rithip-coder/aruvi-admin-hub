import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";

interface Hotel {
  id: string;
  shopName: string;
  shopAddress: string;
  shopDescription: string;
  noOfTables: number;
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const HotelSettings = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [deleteHotelId, setDeleteHotelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    shopName: "",
    shopAddress: "",
    shopDescription: "",
    noOfTables: 0,
  });

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('hotels', JSON.stringify(hotels));
    }
  }, [hotels, loading]);

  const loadHotels = () => {
    try {
      setLoading(true);
      const storedHotels = localStorage.getItem('hotels');
      if (storedHotels) {
        setHotels(JSON.parse(storedHotels));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load hotels from storage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedHotel(null);
    setFormData({
      shopName: "",
      shopAddress: "",
      shopDescription: "",
      noOfTables: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setFormData({
      shopName: hotel.shopName,
      shopAddress: hotel.shopAddress,
      shopDescription: hotel.shopDescription,
      noOfTables: hotel.noOfTables,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteHotelId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteHotelId) return;

    setHotels(prev => prev.filter(h => h.id !== deleteHotelId));
    toast({
      title: "Hotel deleted",
      description: "Hotel has been deleted successfully",
    });
    setIsDeleteDialogOpen(false);
    setDeleteHotelId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shopName || !formData.shopAddress || formData.noOfTables <= 0) {
      toast({
        title: "Validation error",
        description: "Please fill all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    if (selectedHotel) {
      setHotels(prev => prev.map(h => h.id === selectedHotel.id ? { ...formData, id: selectedHotel.id } : h));
      toast({
        title: "Hotel updated",
        description: "Hotel details have been updated successfully",
      });
    } else {
      const newHotel: Hotel = {
        ...formData,
        id: generateId(),
      };
      setHotels(prev => [...prev, newHotel]);
      toast({
        title: "Hotel added",
        description: "New hotel has been added successfully",
      });
    }
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your hotel information and configuration
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hotel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Building2 className="h-8 w-8 text-primary mb-2" />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(hotel)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(hotel.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle>{hotel.shopName}</CardTitle>
              <CardDescription>{hotel.shopAddress}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{hotel.shopDescription}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Tables:</span>
                <span>{hotel.noOfTables}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hotels.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hotels found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first hotel
          </p>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Hotel
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedHotel ? "Edit Hotel" : "Add New Hotel"}
            </DialogTitle>
            <DialogDescription>
              {selectedHotel
                ? "Update the hotel information below"
                : "Enter the details for the new hotel"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name *</Label>
                <Input
                  id="shopName"
                  value={formData.shopName}
                  onChange={(e) =>
                    setFormData({ ...formData, shopName: e.target.value })
                  }
                  placeholder="Enter shop name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopAddress">Shop Address *</Label>
                <Input
                  id="shopAddress"
                  value={formData.shopAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, shopAddress: e.target.value })
                  }
                  placeholder="Enter shop address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopDescription">Description</Label>
                <Textarea
                  id="shopDescription"
                  value={formData.shopDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, shopDescription: e.target.value })
                  }
                  placeholder="Enter shop description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noOfTables">Number of Tables *</Label>
                <Input
                  id="noOfTables"
                  type="number"
                  min="1"
                  value={formData.noOfTables || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, noOfTables: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Enter number of tables"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedHotel ? "Update" : "Add"} Hotel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hotel
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HotelSettings;
