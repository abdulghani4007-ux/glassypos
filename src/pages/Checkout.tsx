import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign, Printer, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { getSettings } from "@/lib/storage";

const Checkout = () => {
  const settings = getSettings();
  const cartItems = [
    { id: 1, name: "Paracetamol 500mg", price: 5, quantity: 2 },
    { id: 2, name: "Amoxicillin 250mg", price: 12, quantity: 1 },
  ];

  const subtotal = 22;
  const discount = 2;
  const tax = 1;
  const total = 21;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/billing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">Complete your transaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cart Summary */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Cart Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {settings.currency}{item.price} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">{settings.currency}{item.price * item.quantity}</p>
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{settings.currency}{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span className="text-secondary">-{settings.currency}{discount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>{settings.currency}{tax}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg text-primary">{settings.currency}{total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <DollarSign className="w-5 h-5 mr-3" />
                Cash
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <CreditCard className="w-5 h-5 mr-3" />
                Card / UPI
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <CreditCard className="w-5 h-5 mr-3" />
                Udhar / Credit
              </Button>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Cash Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Cash Received</label>
                <Input type="number" placeholder="Enter amount" className="text-lg" />
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Change to Return:</span>
                  <span className="text-2xl font-bold text-secondary">{settings.currency}0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full" size="lg">
              <Printer className="w-5 h-5 mr-2" />
              Print Invoice & Complete
            </Button>
            <Link to="/billing" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Back to Billing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Invoice Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-8 space-y-4 bg-background/50">
            <div className="text-center">
              <h2 className="text-2xl font-bold">MediStore Pharmacy</h2>
              <p className="text-sm text-muted-foreground">Invoice #INV-001</p>
              <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{settings.currency}{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>{settings.currency}{total}</span>
            </div>
            <div className="text-center text-sm text-muted-foreground pt-4">
              Thank you for your business!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;
