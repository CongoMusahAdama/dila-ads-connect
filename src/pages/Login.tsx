
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: ""
  });
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithPhone, user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect based on user role
      if (profile.role === 'advertiser') {
        navigate('/advertiser');
      } else if (profile.role === 'owner') {
        navigate('/dashboard');
      }
    }
    
    // Auto-fill from signup redirect
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    if (email) {
      setFormData(prev => ({ ...prev, email, password: password || '' }));
      setAuthMethod('email');
    }
  }, [user, profile, loading, navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let result;
    if (authMethod === "email") {
      result = await signIn(formData.email, formData.password);
    } else {
      result = await signInWithPhone(formData.phone, formData.password);
    }
    
    if (result.error) {
      toast({
        title: "Login Failed",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:justify-start p-4 relative">
      {/* Background Image - Hidden on mobile, visible on desktop */}
      <div 
        className="hidden lg:block absolute inset-0 lg:left-1/2"
        style={{
          backgroundImage: 'url(/lovable-uploads/c6613390-5270-4cf0-bbeb-3b5c5c7195bf.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      {/* Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10 lg:bg-background lg:min-h-screen">
        <Card className="w-full max-w-md shadow-2xl border border-border/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your DilaAds account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as "email" | "phone")} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone size={16} />
                  Phone
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
            {authMethod === "email" ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
