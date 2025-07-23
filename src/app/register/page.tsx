"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useExam } from "@/context/exam-context";
import { Loader2, Mail, Phone } from "lucide-react";
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

const EDUCATION_LEVELS = [
    { value: "senior", label: "Senior Secondary" },
    { value: "secondary", label: "Secondary" },
    { value: "graduation", label: "Graduation" },
    { value: "post-graduation", label: "Post Graduation" },
    { value: "others", label: "Others" }
];

const EXAM_CATEGORIES = [
    { id: "jee-mains", label: "JEE Mains" },
    { id: "neet", label: "NEET" },
    { id: "rpsc", label: "RPSC" },
    { id: "upsc", label: "UPSC" },
    { id: "ssc", label: "SSC" },
    { id: "sch-lecturer", label: "SCH Lecturer" },
    { id: "patwari", label: "Patwari" },
    { id: "reet", label: "REET" },
    { id: "ras", label: "RAS" },
    { id: "jee-advance", label: "JEE Advance" },
    { id: "aen", label: "AEN" },
    { id: "aso", label: "ASO" },
    { id: "raj-police", label: "RAJ Police" }
];

type RegistrationStep = "credentials" | "education" | "verification";

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { registerUser, loginWithGoogle, registerWithPhone, verifyOTP, resendOTP } = useExam();

    // Form state
    const [activeTab, setActiveTab] = useState("email");
    const [currentStep, setCurrentStep] = useState<RegistrationStep>("credentials");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "+91",
        education: "",
        examCategories: [] as string[],
    });

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isPhoneLoading, setIsPhoneLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // OTP states
    const [otp, setOtp] = useState("");
    const [verificationId, setVerificationId] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

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

    const handleGoogleSignup = async () => {
        try {
            setIsGoogleLoading(true);
            await loginWithGoogle();

            // Check if we need to redirect to a shared exam
            const sharedExamId = localStorage.getItem('shared_exam_id');
            if (sharedExamId) {
                // We don't need to navigate here as the exam context provider
                // will automatically redirect based on the shared_exam_id in localStorage
                toast({
                    title: "Registration complete",
                    description: "Redirecting you to the shared exam...",
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
                    title: "Registration failed",
                    description: error.message || "Failed to register with Google. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleEmailRegistration = async () => {
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "Please make sure your passwords match",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            await registerUser(formData.name, formData.email, formData.password);
            // Send verification email here
            setCurrentStep("education");
        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error.message || "Failed to create account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneRegistration = async () => {
        try {
            setIsPhoneLoading(true);

            // Validate name
            if (!formData.name.trim()) {
                throw new Error("Please enter your name");
            }

            const formattedNumber = formData.phoneNumber.startsWith("+91")
                ? formData.phoneNumber
                : `+91${formData.phoneNumber}`;

            if (!isValidPhoneNumber(formattedNumber)) {
                throw new Error("Please enter a valid Indian phone number");
            }

            const parsedNumber = parsePhoneNumber(formattedNumber);
            if (!parsedNumber) {
                throw new Error("Could not parse phone number");
            }

            // Set phone registration flag
            localStorage.setItem('is_phone_registration', 'true');

            // Clear any existing verification state
            setVerificationId("");
            setOtp("");

            // Store name for registration since this is a new registration
            const vid = await registerWithPhone(parsedNumber.format("E.164"), formData.name);
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
            const formattedNumber = formData.phoneNumber.startsWith("+91")
                ? formData.phoneNumber
                : `+91${formData.phoneNumber}`;

            const vid = await resendOTP(formattedNumber);
            setVerificationId(vid);
            setResendTimer(30);

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

            const success = await verifyOTP(verificationId, otp);
            if (success) {
                // Check if there's a shared exam link
                const sharedExamId = localStorage.getItem('shared_exam_id');
                if (sharedExamId) {
                    // If using phone registration with a shared link, 
                    // we can redirect directly without the education step
                    toast({
                        title: "Registration complete",
                        description: "Redirecting you to the shared exam...",
                    });
                    // The context provider will handle the redirect
                } else {
                    // Regular flow - continue to education step
                    setCurrentStep("education");
                }
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Invalid OTP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleEducationSubmit = async () => {
        try {
            setIsLoading(true);
            // Update user profile with education and exam preferences

            // Check if we need to redirect to a shared exam
            const sharedExamId = localStorage.getItem('shared_exam_id');
            if (sharedExamId) {
                // Navigation will be handled by the context provider
                // which will detect the shared_exam_id and redirect
                toast({
                    title: "Registration complete",
                    description: "Redirecting you to the shared exam...",
                });
            } else {
                // Regular navigation to dashboard
                router.push("/dashboard");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderCredentialsStep = () => (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                </TabsTrigger>
            </TabsList>

            <div className="grid gap-6">
                <Button
                    variant="outline"
                    onClick={handleGoogleSignup}
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

            <TabsContent value="email" className="space-y-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleEmailRegistration}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </Button>
                </div>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
                {!verificationId ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (!value.startsWith("+91")) {
                                        value = "+91" + value.replace("+91", "");
                                    }
                                    setFormData({ ...formData, phoneNumber: value });
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
                            onClick={handlePhoneRegistration}
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
    );

    const renderEducationStep = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="education">Education Level</Label>
                <Select
                    value={formData.education}
                    onValueChange={(value) => setFormData({ ...formData, education: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select your education level" />
                    </SelectTrigger>
                    <SelectContent>
                        {EDUCATION_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                                {level.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Exam Categories</Label>
                <div className="grid grid-cols-2 gap-4">
                    {EXAM_CATEGORIES.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={category.id}
                                checked={formData.examCategories.includes(category.id)}
                                onCheckedChange={(checked) => {
                                    setFormData({
                                        ...formData,
                                        examCategories: checked
                                            ? [...formData.examCategories, category.id]
                                            : formData.examCategories.filter((id) => id !== category.id)
                                    });
                                }}
                            />
                            <Label htmlFor={category.id}>{category.label}</Label>
                        </div>
                    ))}
                </div>
            </div>

            <Button
                className="w-full"
                onClick={handleEducationSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing Registration...
                    </>
                ) : (
                    "Complete Registration"
                )}
            </Button>
        </div>
    );

    return (
        <div className="container mx-auto flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                    <CardDescription>
                        {currentStep === "credentials"
                            ? "Choose your preferred registration method"
                            : "Tell us more about yourself"}
                    </CardDescription>

                    {isFromSharedLink && (
                        <div className="bg-yellow-50 text-yellow-800 p-3 mt-4 rounded-md text-sm border border-yellow-200">
                            <p>You'll be redirected to the shared exam after registration.</p>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div id="recaptcha-container" className="invisible h-0"></div>
                    {currentStep === "credentials" && renderCredentialsStep()}
                    {currentStep === "education" && renderEducationStep()}
                </CardContent>
                <CardFooter>
                    <div className="text-center w-full text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}