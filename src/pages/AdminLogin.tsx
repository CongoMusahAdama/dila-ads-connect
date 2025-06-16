
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in and is admin
    if (!loading && user) {
      checkAdminStatus();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      navigate('/admin');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First try to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        toast({
          title: "Login Failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();
        
        if (adminData) {
          toast({
            title: "Welcome Admin!",
            description: "You have been signed in successfully.",
          });
          navigate('/admin');
        } else {
          // Sign out the non-admin user
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-md shadow-2xl border border-border/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="font-bold text-white text-sm">D</span>
            </div>
            <span className="font-bold text-xl">DilaAds Admin</span>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In as Admin"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">
                Back to Homepage
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
