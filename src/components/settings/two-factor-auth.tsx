"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExam } from "@/context/exam-context";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TwoFactorAuthDialog() {
  const { enable2FA, verify2FA, disable2FA, is2FAEnabled } = useExam();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"initial" | "enableSetup" | "verifyCode" | "disableConfirm">("initial");

  useEffect(() => {
    // Reset state when dialog is opened
    if (open) {
      setVerificationCode("");
      setQrCode("");
      setError("");
      setStep("initial");
    }
  }, [open]);

  const handleEnableSetup = async () => {
    try {
      setLoading(true);
      setError("");
      
      // In a real app, this would return a QR code to scan
      await enable2FA();
      setQrCode("MOCK_SECRET_CODE_123456");
      setStep("verifyCode");
    } catch (error: any) {
      setError(error.message || "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!verificationCode) {
        setError("Verification code is required");
        return;
      }
      
      const result = await verify2FA(verificationCode);
      
      if (result) {
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been enabled for your account.",
        });
        setOpen(false);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (error: any) {
      setError(error.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      setError("");
      
      await disable2FA();
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
      });
      
      setOpen(false);
    } catch (error: any) {
      setError(error.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {is2FAEnabled ? "Manage" : "Enable"} Two-Factor Authentication
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            {is2FAEnabled 
              ? "Manage your two-factor authentication settings."
              : "Add an extra layer of security to your account."}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {step === "initial" && (
          <div className="py-4">
            <div className="flex items-center justify-center mb-6">
              {is2FAEnabled ? (
                <div className="flex flex-col items-center">
                  <ShieldCheck className="h-16 w-16 text-green-500 mb-2" />
                  <p className="font-medium text-lg">2FA is currently enabled</p>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Your account is protected with two-factor authentication.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Shield className="h-16 w-16 text-muted-foreground mb-2" />
                  <p className="font-medium text-lg">2FA is currently disabled</p>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Enable two-factor authentication to increase your account security.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              {is2FAEnabled ? (
                <Button 
                  variant="destructive" 
                  onClick={() => setStep("disableConfirm")}
                >
                  Disable 2FA
                </Button>
              ) : (
                <Button 
                  onClick={() => setStep("enableSetup")}
                >
                  Enable 2FA
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
        
        {step === "enableSetup" && (
          <div className="py-4">
            <div className="space-y-4">
              <p>To enable two-factor authentication:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Scan the QR code or enter the provided code</li>
                <li>Enter the verification code from the app</li>
              </ol>
              
              <div className="flex justify-center py-4">
                <Button onClick={handleEnableSetup} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Setup Code
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("initial")}>
                Back
              </Button>
            </DialogFooter>
          </div>
        )}
        
        {step === "verifyCode" && (
          <div className="py-4">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md flex justify-center">
                <div className="bg-gray-100 p-4 rounded-md border border-gray-300">
                  <p className="text-center break-all font-mono">{qrCode}</p>
                  <p className="text-xs text-center mt-2">
                    Scan this code with your authenticator app
                  </p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="verification-code">Enter 6-digit verification code</Label>
                <Input
                  id="verification-code"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setStep("enableSetup")}>
                Back
              </Button>
              <Button onClick={handleVerifyCode} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
            </DialogFooter>
          </div>
        )}
        
        {step === "disableConfirm" && (
          <div className="py-4">
            <div className="flex items-center justify-center mb-6">
              <div className="flex flex-col items-center">
                <ShieldAlert className="h-16 w-16 text-destructive mb-2" />
                <p className="font-medium text-lg">Disable 2FA?</p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  This will remove an important security layer from your account.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("initial")}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDisable2FA} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Disable 2FA
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 