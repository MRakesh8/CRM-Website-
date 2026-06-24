import { useLogin } from "@workspace/api-client-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const { login } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (data) => {
        login(data.token, { ...data.user, avatarUrl: data.user.avatarUrl ?? null });
        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get("redirect");
        navigate(redirect || "/dashboard");
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: err?.response?.data?.error || err.message || "Invalid credentials"
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            </div>
            <div className="font-bold text-4xl tracking-tight text-primary">NexusCRM</div>
          </div>
        </div>
        <p className="text-center text-muted-foreground mb-8">Sign in to your workspace</p>
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account? <Link href="/register" className="text-primary hover:underline font-medium">Register</Link>
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm border text-center">
              <p className="font-semibold mb-1">Demo Admin Credentials:</p>
              <p className="text-muted-foreground">Email: <span className="font-medium text-foreground">admin@crm.com</span></p>
              <p className="text-muted-foreground">Password: <span className="font-medium text-foreground">demo1234</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
