import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api";

type Step = 'request' | 'verify' | 'reset' | 'success';

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>('request');
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = {};
      if (contactMethod === "email") {
        data.email = formData.email;
      } else {
        data.phone = formData.phone;
      }

      const response = await apiClient.requestPasswordReset(data);
      
      toast({
        title: "Reset Code Sent",
        description: response.message,
      });

      // In development, show the code
      if (response.resetCode) {
        toast({
          title: "Development Mode",
          description: `Your reset code is: ${response.resetCode}`,
          duration: 10000,
        });
      }

      setStep('verify');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request password reset.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = { resetCode: formData.resetCode };
      if (contactMethod === "email") {
        data.email = formData.email;
      } else {
        data.phone = formData.phone;
      }

      await apiClient.verifyResetCode(data);
      
      toast({
        title: "Code Verified",
        description: "Please enter your new password.",
      });

      setStep('reset');
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired reset code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        resetCode: formData.resetCode,
        newPassword: formData.newPassword
      };
      if (contactMethod === "email") {
        data.email = formData.email;
      } else {
        data.phone = formData.phone;
      }

      const response = await apiClient.resetPassword(data);
      
      toast({
        title: "Success!",
        description: response.message,
      });

      setStep('success');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'request':
        return (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <Tabs value={contactMethod} onValueChange={(value) => setContactMethod(value as "email" | "phone")} className="mb-6">
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

            {contactMethod === "email" ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll send a reset code to this email address.
                </p>
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
                <p className="text-xs text-muted-foreground">
                  We'll send a reset code to this phone number via SMS.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        );

      case 'verify':
        return (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetCode">Reset Code</Label>
              <Input
                id="resetCode"
                name="resetCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={formData.resetCode}
                onChange={handleInputChange}
                required
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code sent to your {contactMethod === "email" ? "email" : "phone"}.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto"
              >
                <ArrowLeft size={16} />
                Back to previous step
              </button>
            </div>
          </form>
        );

      case 'reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
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
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setStep('verify')}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto"
              >
                <ArrowLeft size={16} />
                Back to previous step
              </button>
            </div>
          </form>
        );

      case 'success':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle2 size={64} className="text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Password Reset Successful!</h3>
              <p className="text-muted-foreground">
                Your password has been successfully reset. You can now login with your new password.
              </p>
            </div>

            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        );
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'request':
        return "Forgot Password";
      case 'verify':
        return "Verify Reset Code";
      case 'reset':
        return "Set New Password";
      case 'success':
        return "All Done!";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'request':
        return "Enter your email or phone number to receive a reset code";
      case 'verify':
        return "Check your email or phone for the verification code";
      case 'reset':
        return "Choose a strong password for your account";
      case 'success':
        return "Your password has been updated";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:justify-start p-4 relative">
      {/* Background Image - Hidden on mobile, visible on desktop */}
      <div 
        className="hidden lg:block absolute inset-0 lg:left-1/2"
        style={{
          backgroundImage: 'url(uploads/c6613390-5270-4cf0-bbeb-3b5c5c7195bf.png)',
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
            <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
            
            {/* Progress indicator */}
            {step !== 'success' && (
              <div className="flex justify-center gap-2 mt-4">
                <div className={`h-2 w-2 rounded-full ${step === 'request' ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`h-2 w-2 rounded-full ${step === 'verify' ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`h-2 w-2 rounded-full ${step === 'reset' ? 'bg-primary' : 'bg-muted'}`} />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

