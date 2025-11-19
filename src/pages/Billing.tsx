import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Plus, Minus, Trash2, ShoppingCart, X } from "lucide-react";
import { getMedicines, addSale, CartItem, Medicine, calculateTotals, getSettings } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Billing = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const settings = getSettings();
  const [globalDiscount, setGlobalDiscount] = useState(settings.defaultDiscount);
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'udhar'>('cash');
  const [cashReceived, setCashReceived] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const results = medicines.filter(
        (m) =>
          m.stock > 0 &&
          (m.name.toLowerCase().includes(query) ||
            m.company.toLowerCase().includes(query) ||
            m.batchNumber.toLowerCase().includes(query))
      );
      setSearchResults(results.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, medicines]);

  const loadMedicines = () => {
    setMedicines(getMedicines());
  };

  const addToCart = (medicine: Medicine) => {
    const existingItem = cartItems.find((item) => item.medicineId === medicine.id);

    if (existingItem) {
      if (existingItem.quantity >= medicine.stock) {
        toast({
          title: "Stock Limit",
          description: "Cannot add more than available stock",
          variant: "destructive",
        });
        return;
      }
      updateQuantity(existingItem.medicineId, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        medicineId: medicine.id,
        name: medicine.name,
        company: medicine.company,
        price: medicine.salePrice,
        quantity: 1,
        discount: 0,
        batchNumber: medicine.batchNumber,
        stock: medicine.stock,
      };
      setCartItems([...cartItems, newItem]);
    }

    setSearchQuery("");
    setSearchResults([]);
    
    toast({
      title: "Added to Cart",
      description: `${medicine.name} added successfully`,
    });
  };

  const updateQuantity = (medicineId: string, newQuantity: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.medicineId === medicineId) {
          if (newQuantity > item.stock) {
            toast({
              title: "Stock Limit",
              description: "Cannot exceed available stock",
              variant: "destructive",
            });
            return item;
          }
          if (newQuantity <= 0) {
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const updateDiscount = (medicineId: string, discount: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.medicineId === medicineId ? { ...item, discount: Math.max(0, Math.min(100, discount)) } : item
      )
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCartItems(cartItems.filter((item) => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setGlobalDiscount(0);
    setCashReceived("");
  };

  const totals = calculateTotals(cartItems, globalDiscount);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }

    if (settings.showCustomerInfo && !customerName) {
      toast({
        title: "Customer Info Required",
        description: "Please enter customer name",
        variant: "destructive",
      });
      return;
    }

    const cashAmount = parseFloat(cashReceived) || 0;
    if (paymentType === 'cash' && cashAmount < totals.total) {
      toast({
        title: "Insufficient Cash",
        description: "Cash received is less than total amount",
        variant: "destructive",
      });
      return;
    }

    try {
      addSale({
        date: new Date().toISOString(),
        items: cartItems,
        subtotal: totals.subtotal,
        discount: totals.totalDiscount,
        tax: totals.tax,
        total: totals.total,
        paymentType,
        cashReceived: paymentType === 'cash' ? cashAmount : undefined,
        changeReturned: paymentType === 'cash' ? cashAmount - totals.total : undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      });

      toast({
        title: "Sale Completed",
        description: "Transaction completed successfully",
      });

      clearCart();
      loadMedicines();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground">Create new bills and manage transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Search & Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search medicines by name, company, or batch..."
                  className="pl-10 bg-background/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 glass rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border/30 last:border-0"
                        onClick={() => addToCart(medicine)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-sm text-muted-foreground">{medicine.company}</p>
                            <p className="text-xs text-muted-foreground">Batch: {medicine.batchNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{settings.currency}{medicine.salePrice}</p>
                            <Badge variant={medicine.stock < medicine.reorderLevel ? "destructive" : "secondary"} className="text-xs">
                              Stock: {medicine.stock}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart Items ({cartItems.length})
              </CardTitle>
              {cartItems.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCart}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Cart is empty. Search and add medicines to start billing.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.medicineId} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.company} • {settings.currency}{item.price} per unit</p>
                      <p className="text-xs text-muted-foreground">Batch: {item.batchNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.medicineId, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                        min="1"
                        max={item.stock}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="w-20">
                      <Label className="text-xs">Discount %</Label>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateDiscount(item.medicineId, parseFloat(e.target.value) || 0)}
                        className="text-center h-8"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="text-right w-24">
                      <p className="font-bold">{settings.currency}{(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeFromCart(item.medicineId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          {settings.showCustomerInfo && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name {settings.showCustomerInfo && "*"}</Label>
                  <Input
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone (Optional)</Label>
                  <Input
                    placeholder="Phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bill Summary */}
        <div className="space-y-6">
          <Card className="glass sticky top-6">
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">{settings.currency}{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Discount:</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={globalDiscount}
                      onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                      className="w-16 h-8 text-center"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Total Discount:</span>
                  <span>-{settings.currency}{totals.totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({settings.defaultTax}%):</span>
                  <span>{settings.currency}{totals.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{settings.currency}{totals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-secondary">
                  <span>Profit:</span>
                  <span>{settings.currency}{totals.profit.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={paymentType === 'cash' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentType('cash')}
                  >
                    Cash
                  </Button>
                  <Button
                    variant={paymentType === 'card' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentType('card')}
                  >
                    Card
                  </Button>
                  {settings.enableUdhar && (
                    <Button
                      variant={paymentType === 'udhar' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentType('udhar')}
                    >
                      Udhar
                    </Button>
                  )}
                </div>
              </div>

              {paymentType === 'cash' && (
                <div className="space-y-2">
                  <Label>Cash Received</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                  />
                  {cashReceived && parseFloat(cashReceived) >= totals.total && (
                    <div className="flex justify-between text-sm text-secondary">
                      <span>Change:</span>
                      <span>{settings.currency}{(parseFloat(cashReceived) - totals.total).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Complete Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;
