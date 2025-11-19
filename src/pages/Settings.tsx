import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Trash2, UserPlus, Download, Upload, Database, HardDrive, RefreshCw } from "lucide-react";
import { 
  getSettings, 
  saveSettings, 
  Settings as SettingsType,
  getUsers,
  addUser,
  deleteUser,
  updateUserRole,
  User
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { storageService } from "@/lib/storageService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const [settings, setSettings] = useState<SettingsType>(getSettings());
  const [users, setUsers] = useState<User[]>(getUsers());
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<'admin' | 'staff'>('staff');
  const [dataStats, setDataStats] = useState(storageService.getDataStats());
  const [storageMethod, setStorageMethod] = useState(storageService.getCurrentMethod());
  const [isMigrating, setIsMigrating] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Check if Supabase is connected
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    setIsSupabaseConnected(!!(supabaseUrl && supabaseKey));
  }, []);

  useEffect(() => {
    setSettings(getSettings());
    setUsers(getUsers());
    setDataStats(storageService.getDataStats());
  }, []);

  const handleSaveGeneral = () => {
    saveSettings(settings);
    toast({
      title: "Success",
      description: "General settings saved successfully",
    });
  };

  const handleSaveAppearance = () => {
    saveSettings(settings);
    toast({
      title: "Success",
      description: "Appearance settings saved successfully",
    });
    
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAddUser = () => {
    if (!newUserEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      addUser(newUserEmail, newUserRole);
      setUsers(getUsers());
      setNewUserEmail("");
      setNewUserRole('staff');
      toast({
        title: "Success",
        description: "User added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    try {
      deleteUser(userId);
      setUsers(getUsers());
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserRole = (userId: string, role: 'admin' | 'staff') => {
    try {
      updateUserRole(userId, role);
      setUsers(getUsers());
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      });
    }
  };

  // Apply dark mode on mount
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleSaveBilling = () => {
    saveSettings(settings);
    toast({
      title: "Success",
      description: "Billing settings saved successfully",
    });
  };

  const handleStorageMethodChange = (method: 'localStorage' | 'supabase') => {
    if (method === 'supabase' && !isSupabaseConnected) {
      toast({
        title: "Supabase Not Connected",
        description: "Please connect your external Supabase project to use cloud storage",
        variant: "destructive",
      });
      return;
    }
    setStorageMethod(method);
    storageService.setStorageMethod(method);
    toast({
      title: "Storage Method Updated",
      description: `Now using ${method === 'localStorage' ? 'Local Storage' : 'External Supabase'}`,
    });
  };

  const handleExportData = () => {
    try {
      storageService.downloadData();
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        storageService.importData(data);
        setDataStats(storageService.getDataStats());
        toast({
          title: "Success",
          description: "Data imported successfully",
        });
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleMigrateData = async () => {
    setIsMigrating(true);
    try {
      // Export current data
      const currentData = storageService.exportData();
      
      // TODO: When Supabase is connected, implement migration logic here
      // For now, just simulate migration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Migration Ready",
        description: "Connect your Supabase project to complete data migration",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to migrate data",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClearAllData = () => {
    try {
      storageService.clearAllData();
      setDataStats(storageService.getDataStats());
      toast({
        title: "Success",
        description: "All data has been cleared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      });
    }
  };

  const handleSaveInventory = () => {
    saveSettings(settings);
    toast({
      title: "Success",
      description: "Inventory settings saved successfully",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your store preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="notifications">Inventory Alerts</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="storage">Data Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shop Name</Label>
                  <Input 
                    placeholder="Enter shop name" 
                    value={settings.shopName}
                    onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input 
                    placeholder="Currency" 
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Tax (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="Tax percentage" 
                    value={settings.defaultTax}
                    onChange={(e) => setSettings({ ...settings, defaultTax: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Discount (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="Discount percentage" 
                    value={settings.defaultDiscount}
                    onChange={(e) => setSettings({ ...settings, defaultDiscount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button className="gap-2" onClick={handleSaveGeneral}>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Invoice Prefix</Label>
                <Input 
                  placeholder="e.g., INV-" 
                  value={settings.invoicePrefix}
                  onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice Footer</Label>
                <Input 
                  placeholder="Thank you message" 
                  value={settings.invoiceFooter}
                  onChange={(e) => setSettings({ ...settings, invoiceFooter: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Customer Info on Invoice</Label>
                  <p className="text-sm text-muted-foreground">Display customer details</p>
                </div>
                <Switch 
                  checked={settings.showCustomerInfo}
                  onCheckedChange={(checked) => setSettings({ ...settings, showCustomerInfo: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Udhar/Credit</Label>
                  <p className="text-sm text-muted-foreground">Allow credit transactions</p>
                </div>
                <Switch 
                  checked={settings.enableUdhar}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableUdhar: checked })}
                />
              </div>
              <Button className="gap-2" onClick={handleSaveBilling}>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage user accounts and permissions. At least one admin must exist.
              </p>
              
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value: 'admin' | 'staff') => handleUpdateUserRole(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.email}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Add New User</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={newUserRole} onValueChange={(value: 'admin' | 'staff') => setNewUserRole(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddUser} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input 
                  type="number" 
                  placeholder="Alert when stock falls below" 
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-muted-foreground">Get notified when stock falls below this level</p>
              </div>
              <div className="space-y-2">
                <Label>Expiry Alert Days</Label>
                <Input 
                  type="number" 
                  placeholder="Days before expiry" 
                  value={settings.expiryAlertDays}
                  onChange={(e) => setSettings({ ...settings, expiryAlertDays: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-muted-foreground">Alert for medicines expiring in this many days</p>
              </div>
              <Button className="gap-2" onClick={handleSaveInventory}>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Theme & UI Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                </div>
                <Switch 
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Glassy/Frosted UI</Label>
                  <p className="text-sm text-muted-foreground">Enable glass morphism effects</p>
                </div>
                <Switch 
                  checked={settings.glassyUI}
                  onCheckedChange={(checked) => setSettings({ ...settings, glassyUI: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Sidebar</Label>
                  <p className="text-sm text-muted-foreground">Start with collapsed sidebar</p>
                </div>
                <Switch 
                  checked={settings.compactSidebar}
                  onCheckedChange={(checked) => setSettings({ ...settings, compactSidebar: checked })}
                />
              </div>
              <Button className="gap-2" onClick={handleSaveAppearance}>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          {/* Storage Method Selection */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Storage Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Current method:</span>
                <Badge variant="secondary" className="gap-1">
                  {storageMethod === 'localStorage' ? (
                    <>
                      <HardDrive className="w-3 h-3" />
                      Local Storage
                    </>
                  ) : (
                    <>
                      <Database className="w-3 h-3" />
                      Supabase
                    </>
                  )}
                </Badge>
              </div>

              <RadioGroup value={storageMethod} onValueChange={(value: 'localStorage' | 'supabase') => handleStorageMethodChange(value)}>
                <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <RadioGroupItem value="localStorage" id="localStorage" />
                  <div className="flex-1">
                    <Label htmlFor="localStorage" className="font-medium cursor-pointer">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        Local Storage (Browser)
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Data stored in your browser. Works offline but limited to this device only.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start space-x-3 space-y-0 rounded-lg border p-4 ${!isSupabaseConnected ? 'opacity-50' : ''}`}>
                  <RadioGroupItem value="supabase" id="supabase" disabled={!isSupabaseConnected} />
                  <div className="flex-1">
                    <Label htmlFor="supabase" className="font-medium">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        External Supabase
                        <Badge variant={isSupabaseConnected ? "default" : "outline"} className="text-xs">
                          {isSupabaseConnected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isSupabaseConnected 
                        ? "Your Supabase project is connected and ready to use."
                        : "Connect your own Supabase project for cloud storage and sync across devices."}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Data Statistics */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Data Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold">{dataStats.medicines}</div>
                  <div className="text-sm text-muted-foreground">Medicines</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold">{dataStats.sales}</div>
                  <div className="text-sm text-muted-foreground">Sales</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold">{dataStats.expenses}</div>
                  <div className="text-sm text-muted-foreground">Expenses</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold">{dataStats.refunds}</div>
                  <div className="text-sm text-muted-foreground">Refunds</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold">{dataStats.udhars}</div>
                  <div className="text-sm text-muted-foreground">Udhar Records</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold">{dataStats.users}</div>
                  <div className="text-sm text-muted-foreground">Users</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export/Import */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">Download all your data as a JSON file</p>
                <Button onClick={handleExportData} className="gap-2 w-full sm:w-auto">
                  <Download className="w-4 h-4" />
                  Export All Data
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Import Data</Label>
                <p className="text-sm text-muted-foreground">Upload a previously exported JSON file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="gap-2 w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Migration */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Data Migration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Migrate your data between Local Storage and External Supabase. This will copy all your data to the selected storage method.
              </p>
              <Button 
                onClick={handleMigrateData} 
                disabled={!isSupabaseConnected || isMigrating}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
                {isMigrating ? 'Preparing Migration...' : 'Migrate to Supabase'}
              </Button>
              <p className="text-xs text-muted-foreground">
                {isSupabaseConnected 
                  ? "Click to migrate your local data to Supabase cloud storage"
                  : "Connect your Supabase project to migrate data to cloud storage"}
              </p>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="glass border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Clear All Data</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all data from {storageMethod === 'localStorage' ? 'Local Storage' : 'External Supabase'}. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all medicines, sales, expenses, refunds, udhar records, and users from your {storageMethod === 'localStorage' ? 'browser storage' : 'cloud storage'}. 
                        This action cannot be undone. Consider exporting your data first.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
