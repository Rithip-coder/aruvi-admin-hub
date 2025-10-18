import { useState } from 'react';
import { UserPlus, Phone, Mail, Calendar, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { useApp, Waiter } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function Waiters() {
  const { waiters, addWaiter, updateWaiter, deleteWaiter, addWaiterIssue, history } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [issueDescription, setIssueDescription] = useState('');

  const resetForm = () => {
    setFormData({ username: '', password: '', name: '', phone: '', email: '', status: 'active' });
    setIssueDescription('');
  };

  const handleAdd = () => {
    if (!formData.name || !formData.phone || !formData.username || !formData.password) {
      toast.error('Name, phone, username and password are required');
      return;
    }
    addWaiter({ ...formData, joinDate: Date.now() });
    toast.success('Waiter added successfully');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedWaiter) return;
    updateWaiter(selectedWaiter.id, formData);
    toast.success('Waiter updated successfully');
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this waiter?')) {
      deleteWaiter(id);
      toast.success('Waiter deleted successfully');
    }
  };

  const handleAddIssue = () => {
    if (!selectedWaiter || !issueDescription) return;
    addWaiterIssue(selectedWaiter.id, issueDescription);
    toast.success('Issue reported');
    setIsIssueDialogOpen(false);
    resetForm();
  };

  const openEditDialog = (waiter: Waiter) => {
    setSelectedWaiter(waiter);
    setFormData({
      username: waiter.username || '',
      password: waiter.password || '',
      name: waiter.name,
      phone: waiter.phone,
      email: waiter.email,
      status: waiter.status,
    });
    setIsEditDialogOpen(true);
  };

  const openIssueDialog = (waiter: Waiter) => {
    setSelectedWaiter(waiter);
    setIsIssueDialogOpen(true);
  };

  const getTodayOrders = (waiterId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return history.filter(h => {
      const entryDate = new Date(h.timestamp).toISOString().split('T')[0];
      return h.waiterId === waiterId && entryDate === today;
    }).length;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Waiter Management</h1>
          <p className="text-muted-foreground mt-1">Manage waiters and track performance</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Waiter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Waiter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Username *</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v: 'active' | 'inactive') => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Waiter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {waiters.map((waiter) => (
          <Card key={waiter.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{waiter.name}</h3>
                  <Badge variant={waiter.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                    {waiter.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => openEditDialog(waiter)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(waiter.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {waiter.phone}
                </div>
                {waiter.email && (
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    {waiter.email}
                  </div>
                )}
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Joined {new Date(waiter.joinDate).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-xl font-bold text-primary">{waiter.ordersCompleted}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Today</p>
                  <p className="text-xl font-bold text-primary">{getTodayOrders(waiter.id)}</p>
                </div>
              </div>

              {waiter.issues.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-medium">Issues ({waiter.issues.length})</p>
                  </div>
                  <ScrollArea className="h-20">
                    <div className="space-y-2">
                      {waiter.issues.map((issue) => (
                        <div key={issue.id} className="text-xs p-2 bg-destructive/10 rounded">
                          <p className="text-muted-foreground">{new Date(issue.date).toLocaleDateString()}</p>
                          <p>{issue.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full" onClick={() => openIssueDialog(waiter)}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Waiter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Username *</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: 'active' | 'inactive') => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Dialog */}
      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Issue - {selectedWaiter?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Issue Description</Label>
            <Input
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe the issue"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddIssue}>Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
