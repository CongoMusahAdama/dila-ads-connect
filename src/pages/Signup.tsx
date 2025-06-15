
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "advertiser"
  });
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, signUpWithPhone, user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect based on user role
      if (profile.role === 'advertiser') {
        navigate('/advertiser');
      } else if (profile.role === 'owner') {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords don't match!",
        variant: "destructive",
      });
      return;
    }

    let result;
    if (authMethod === "email") {
      result = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.role
      );
    } else {
      result = await signUpWithPhone(
        formData.phone,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.role
      );
    }

    if (result.error) {
      toast({
        title: "Signup Failed",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      if (authMethod === "email") {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
        navigate(`/login?email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}`);
      } else {
        toast({
          title: "Verification Code Sent!",
          description: "Please check your phone for the verification code.",
        });
        navigate(`/verify-phone?phone=${encodeURIComponent(formData.phone)}`);
      }
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
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join DilaAds and start connecting</CardDescription>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {authMethod === "email" ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
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
                  placeholder="Create a password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Sign up as:</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                className="grid grid-cols-1 gap-3"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="advertiser" id="signup-advertiser" />
                  <div>
                    <Label htmlFor="signup-advertiser" className="cursor-pointer font-medium">
                      Advertiser
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Book billboard spaces for your campaigns
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="owner" id="signup-owner" />
                  <div>
                    <Label htmlFor="signup-owner" className="cursor-pointer font-medium">
                      Billboard Owner
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      List your billboards and earn revenue
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full">
              Create Account
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
