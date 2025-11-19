import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="glass w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
              <Pill className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to MediStore</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to access your pharmacy management system
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@medistore.com"
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="bg-background/50"
            />
          </div>
          <Button className="w-full" size="lg">
            Sign In
          </Button>
          <div className="text-center">
            <Link to="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              First user is automatically assigned as Admin. New users require approval.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
