import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, mode: 'login' | 'register') => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      toast.success(mode === 'login' ? 'Login successful' : 'Registration successful', {
        description: mode === 'login' ? 'Welcome back!' : 'Your account has been created',
      });
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error(error);
    //   toast.error('Error', {
    //     description: error.message,
    //   });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs defaultValue="login">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, 'login')}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="register">
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, 'register')}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Register'}
                </Button>
              </div>
            </form>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}