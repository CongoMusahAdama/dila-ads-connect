
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VerifyPhone = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const phone = searchParams.get('phone') || '';

  useEffect(() => {
    if (!phone) {
      navigate('/signup');
    }
  }, [phone, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms'
      });

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Phone Verified!",
          description: "Your account has been verified successfully.",
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "An error occurred during verification.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'sms',
        phone,
      });

      if (error) {
        toast({
          title: "Resend Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your phone.",
        });
      }
    } catch (error) {
      toast({
        title: "Resend Failed",
        description: "Failed to resend verification code.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify Phone Number</CardTitle>
          <CardDescription>
            Enter the verification code sent to {phone}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="ghost"
                onClick={resendCode}
                className="text-sm"
              >
                Resend Code
              </Button>
              <div className="text-sm text-muted-foreground">
                Wrong number?{" "}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate('/signup')}
                  className="p-0 h-auto"
                >
                  Go back to signup
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPhone;
