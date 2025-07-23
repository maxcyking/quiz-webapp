"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useExam } from "@/context/exam-context";
import { Loader2 } from "lucide-react";
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const { login, loginWithGoogle, loginWithPhone, verifyOTP, resendOTP, checkUserExistsByPhone } = useExam();

  // Check if this is a redirect from a shared exam link
  const [isFromSharedLink, setIsFromSharedLink] = useState(false);
  
  useEffect(() => {
    const sharedExamId = localStorage.getItem('shared_exam_id');
    setIsFromSharedLink(!!sharedExamId);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
        variant: "default",
      });
      
      // Check if there's a shared exam to redirect to
      const sharedExamId = localStorage.getItem('shared_exam_id');
      if (sharedExamId) {
        // Don't navigate - the context will handle redirection
        toast({
          title: "Redirecting",
          description: "Taking you to the shared exam...",
        });
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await loginWithGoogle();
      toast({
        title: "Login successful",
        description: "You have been logged in with Google successfully",
        variant: "default",
      });
      
      // Check if there's a shared exam to redirect to
      const sharedExamId = localStorage.getItem('shared_exam_id');
      if (sharedExamId) {
        // Don't navigate - the context will handle redirection
        toast({
          title: "Redirecting",
          description: "Taking you to the shared exam...",
        });
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      if (error.message.includes('Popup was blocked')) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site in your browser settings and try again",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Failed to login with Google. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    try {
      setIsPhoneLoading(true);

      const formattedNumber = phoneNumber.startsWith("+91") 
        ? phoneNumber
        : `+91${phoneNumber}`;

      if (!isValidPhoneNumber(formattedNumber)) {
        throw new Error("Please enter a valid Indian phone number");
      }

      const parsedNumber = parsePhoneNumber(formattedNumber);
      if (!parsedNumber) {
        throw new Error("Could not parse phone number");
      }

      const phoneNumberE164 = parsedNumber.format("E.164");
      
      // First check if the user exists
      const userExists = await checkUserExistsByPhone(phoneNumberE164);
      if (!userExists) {
        throw new Error("No account found with this phone number. Please register first.");
      }

      // Mark this as a login attempt, not registration
      localStorage.setItem('is_phone_registration', 'false');
      localStorage.removeItem('pending_phone_user_name');

      // Clear any existing verification state
      setVerificationId("");
      setOtp("");

      const vid = await loginWithPhone(phoneNumberE164);
      setVerificationId(vid);
      setResendTimer(30);
      
      toast({
        title: "OTP Sent Successfully",
        description: `A verification code has been sent to ${parsedNumber.formatInternational()}`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsPhoneLoading(true);
      
      const formattedNumber = phoneNumber.startsWith("+91") 
        ? phoneNumber 
        : `+91${phoneNumber}`;
      
      if (!isValidPhoneNumber(formattedNumber)) {
        throw new Error("Please enter a valid Indian phone number");
      }

      const parsedNumber = parsePhoneNumber(formattedNumber);
      if (!parsedNumber) {
        throw new Error("Could not parse phone number");
      }

      const phoneNumberE164 = parsedNumber.format("E.164");
      
      // First check if the user exists
      const userExists = await checkUserExistsByPhone(phoneNumberE164);
      if (!userExists) {
        throw new Error("No account found with this phone number. Please register first.");
      }
      
      const vid = await resendOTP(phoneNumberE164);
      setVerificationId(vid);
      setResendTimer(30); // Reset timer
      
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your phone",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsVerifying(true);
      
      if (!otp.trim()) {
        throw new Error("Please enter the OTP");
      }

      await verifyOTP(verificationId, otp);
      
      // Check if there's a shared exam to redirect to
      const sharedExamId = localStorage.getItem('shared_exam_id');
      if (sharedExamId) {
        // Don't navigate - the context will handle redirection
        toast({
          title: "Redirecting",
          description: "Taking you to the shared exam...",
        });
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      // If no account found, suggest registration
      if (error.message && error.message.includes("No account found")) {
        toast({
          title: "Account Not Found",
          description: "No account exists with this phone number. Please register first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Choose your preferred login method</CardDescription>
          
          {isFromSharedLink && (
            <div className="bg-yellow-50 text-yellow-800 p-3 mt-4 rounded-md text-sm border border-yellow-200">
              <p>You'll be redirected to the shared exam after signing in.</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div id="recaptcha-container" className="invisible"></div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="grid gap-6">
                <Button 
                  variant="outline" 
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="relative"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <svg
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="google"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 488 512"
                      >
                        <path
                          fill="currentColor"
                          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                        ></path>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login with Email"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              {!verificationId ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (!value.startsWith("+91")) {
                          value = "+91" + value.replace("+91", "");
                        }
                        setPhoneNumber(value);
                      }}
                      placeholder="+91 9876543210"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your Indian mobile number starting with +91
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handlePhoneLogin}
                    disabled={isPhoneLoading}
                  >
                    {isPhoneLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                    {resendTimer > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Resend OTP in {resendTimer} seconds
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setVerificationId("");
                        setOtp("");
                        setResendTimer(0);
                      }}
                    >
                      Change Number
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleVerifyOTP}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>
                  {resendTimer === 0 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleResendOTP}
                      disabled={isPhoneLoading}
                    >
                      {isPhoneLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        "Resend OTP"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="text-center w-full text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}