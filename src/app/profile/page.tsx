'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Mail, 
  User as UserIcon, 
  CreditCard, 
  Wallet, 
  AlertCircle, 
  Clock,
  Building2, 
  Award,
  Loader2,
  ArrowDownToLine
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc, orderBy, Timestamp, serverTimestamp, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { convertFirebaseTimestamp, formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import confetti from 'canvas-confetti';

type Reward = {
  id: string;
  userId: string;
  amount: number;
  description: string;
  createdAt: Timestamp;
  status: 'pending' | 'claimed' | 'processing';
  claimedAt?: Timestamp;
  examId?: string;
  examTitle?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useExam();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    bestScore: 0,
    bestExam: "",
    currentRank: 0,
    totalStudents: 0,
  });
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: ""
  });
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  
  // Helper functions for status display
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'claimed':
        return <Wallet className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'claimed':
        return 'Added to Wallet';
      default:
        return 'Unknown';
    }
  };
  
  // Load rewards function with useCallback
  const loadRewards = useCallback(async () => {
    if (!user) return;
    
    try {
      // Load user stats first for wallet balance
      const statsRef = doc(db, "userStats", user.id);
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        const statsData = statsSnap.data();
        setWalletBalance(statsData.wallet || 0);
      } else {
        setWalletBalance(0);
      }
      
      const rewardsRef = collection(db, "rewards");
      const q = query(
        rewardsRef, 
        where("userId", "==", user.id),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const rewardsData: Reward[] = [];
      let total = 0;
      let pending = 0;
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as Reward;
        rewardsData.push(data);
        
        total += data.amount;
        if (data.status === 'pending') {
          pending += data.amount;
        }
      });
      
      setRewards(rewardsData);
      setTotalEarned(total);
      setPendingAmount(pending);
    } catch (error) {
      console.error("Error loading rewards:", error);
      setRewards([]);
      setTotalEarned(0);
      setPendingAmount(0);
      setWalletBalance(0);
      
      if (error instanceof Error && error.message.includes("requires an index")) {
        console.warn("Rewards query requires a Firestore index. Please deploy the updated index.");
      }
    }
  }, [user]);

  // Withdraw money from wallet
  const handleWithdrawal = async () => {
    if (!user) return;
    
    if (!hasBankDetails) {
      toast({
        title: "Bank Details Required",
        description: "Please add your bank details before withdrawing funds.",
        variant: "destructive",
      });
      setShowBankDialog(true);
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > walletBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }
    
    setWithdrawLoading(true);
    
    try {
      // Create withdrawal request in Firestore
      await addDoc(collection(db, "withdrawals"), {
        userId: user.id,
        userName: user.name,
        amount: amount,
        status: "pending",
        createdAt: serverTimestamp(),
        notes: "Withdrawal request from wallet"
      });
      
      // Update user's wallet balance
      const statsRef = doc(db, "userStats", user.id);
      const statsSnap = await getDoc(statsRef);
      
      if (statsSnap.exists()) {
        await updateDoc(statsRef, {
          wallet: (statsSnap.data().wallet || 0) - amount
        });
      }
      
      // Refresh rewards data
      await loadRewards();
      
      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal request has been submitted",
      });
      
      setWithdrawAmount("");
      setShowWithdrawDialog(false);
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal request",
        variant: "destructive",
      });
    } finally {
      setWithdrawLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadStats = async () => {
      try {
        const attemptsQuery = query(
          collection(db, "examAttempts"),
          where("userId", "==", user.id),
          where("isSubmitted", "==", true)
        );
        const attemptsSnapshot = await getDocs(attemptsQuery);
        const attempts = attemptsSnapshot.docs.map(doc => doc.data());

        const totalExams = attempts.length;
        const scores = attempts.map(attempt => attempt.score || 0);
        const averageScore = totalExams > 0 ? scores.reduce((a, b) => a + b, 0) / totalExams : 0;
        const bestScore = Math.max(...scores, 0);

        let bestExam = "";
        if (bestScore > 0) {
          const bestAttempt = attempts.find(attempt => attempt.score === bestScore);
          if (bestAttempt) {
            const examDoc = await getDocs(query(
              collection(db, "exams"),
              where("id", "==", bestAttempt.examId)
            ));
            if (!examDoc.empty) {
              bestExam = examDoc.docs[0].data().title;
            }
          }
        }

        const rankingsQuery = query(collection(db, "rankings"));
        const rankingsSnapshot = await getDocs(rankingsQuery);
        const rankings = rankingsSnapshot.docs.map(doc => doc.data());
        const sortedRankings = rankings.sort((a, b) => b.score - a.score);
        const userRank = sortedRankings.findIndex(r => r.userId === user.id) + 1;
        const totalStudents = rankings.length;

        setStats({
          totalExams,
          averageScore: Math.round(averageScore),
          bestScore: Math.round(bestScore),
          bestExam,
          currentRank: userRank || 0,
          totalStudents,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
        toast({
          title: "Error",
          description: "Failed to load profile statistics",
          variant: "destructive",
        });
      }
    };

    const loadBankDetails = async () => {
      try {
        if (!user) return;
        
        const bankRef = doc(db, "bankDetails", user.id);
        const bankSnap = await getDoc(bankRef);
        
        setHasBankDetails(bankSnap.exists());
      } catch (error) {
        console.error("Error loading bank details:", error);
        setHasBankDetails(false);
        
        if (error instanceof Error && error.message.includes("insufficient permissions")) {
          console.warn("Bank details collection requires updated security rules. Please deploy the updated rules.");
        }
      }
    };

    loadBankDetails();
    loadRewards();
    loadStats();
  }, [user, router, toast, loadRewards]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const storageRef = ref(storage, `avatars/${user.id}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", user.id), {
        photoURL,
      });

      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error) {
      console.error("Error updating photo:", error);
      toast({
        title: "Error",
        description: "Failed to update profile photo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const userDocRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }

      const updateData = {
        name: formData.name,
        email: formData.email
      };

      await updateDoc(userDocRef, updateData);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankDetailsUpdate = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const userSettingsRef = doc(db, "userSettings", user.id);
      const settingsDoc = await getDoc(userSettingsRef);

      // Update or create settings document
      if (settingsDoc.exists()) {
        await updateDoc(userSettingsRef, {
          bankDetails: bankDetails,
          updatedAt: new Date()
        });
      } else {
        await setDoc(userSettingsRef, {
          bankDetails: bankDetails,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      toast({
        title: "Success",
        description: "Bank details updated successfully",
      });
      
      setShowBankDialog(false);
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast({
        title: "Error",
        description: "Failed to update bank details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <Tabs defaultValue="profile" className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            Bank Details
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center">
            <Award className="mr-2 h-4 w-4" />
            Rewards
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user.photoURL || "/placeholder.svg?height=128&width=128"} alt={user.name} />
                      <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="photo-upload"
                      onChange={handlePhotoChange}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("photo-upload")?.click()}
                      disabled={loading}
                    >
                      {loading ? "Uploading..." : "Change Photo"}
                    </Button>
                  </div>

                  <div className="flex-1 space-y-6">
                    <Dialog open={editMode} onOpenChange={setEditMode}>
                      <DialogTrigger asChild>
                        <Button className="mb-4">Edit Profile</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>
                            Make changes to your profile information here.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-4">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button onClick={handleProfileUpdate} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <UserIcon className="h-4 w-4" />
                        <span className="text-sm">Full Name</span>
                      </div>
                      <p className="text-lg font-medium">{user.name}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">Email Address</span>
                      </div>
                      <p className="text-lg font-medium">{user.email}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Member Since</span>
                      </div>
                      <p className="text-lg font-medium">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your exam performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Exams Taken</p>
                    <p className="text-2xl font-bold">{stats.totalExams}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                    <p className="text-2xl font-bold">{stats.averageScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Best Performance</p>
                    <p className="text-2xl font-bold">{stats.bestScore}%</p>
                    <p className="text-sm text-muted-foreground">{stats.bestExam}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Rank</p>
                    <p className="text-2xl font-bold">
                      #{stats.currentRank > 0 ? stats.currentRank : "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Among {stats.totalStudents} students
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="bank" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Your bank account and UPI details for rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bank Account</p>
                    {bankDetails.accountNumber ? (
                      <p className="font-medium">
                        {bankDetails.bankName}: ••••{bankDetails.accountNumber.slice(-4)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No bank account added</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">UPI ID</p>
                    {bankDetails.upiId ? (
                      <p className="font-medium">{bankDetails.upiId}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No UPI ID added</p>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setShowBankDialog(true)}
                >
                  {bankDetails.accountNumber || bankDetails.upiId ? "Update Payment Details" : "Add Payment Details"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rewards" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Rewards History
              </CardTitle>
              <CardDescription>
                View your rewards history and wallet balance. Rewards can be claimed directly from exam results pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Earned
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalEarned.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Wallet Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{walletBalance.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{pendingAmount.toFixed(2)}</div>
                    {pendingAmount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Claim these from the exam results page
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-lg font-medium mb-4">Rewards History</h3>
              {rewards.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewards.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell>{reward.description}</TableCell>
                        <TableCell>₹{reward.amount.toFixed(2)}</TableCell>
                        <TableCell>{formatDate(convertFirebaseTimestamp(reward.createdAt))}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(reward.status)}
                            <span className="ml-2">{getStatusText(reward.status)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You don&apos;t have any rewards yet. Complete exams to earn rewards which can be claimed from the exam results page.
                </div>
              )}
              
              {walletBalance > 0 && (
                <div className="mt-6 border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Withdraw Funds</h3>
                    <p className="text-sm text-muted-foreground">Available: <span className="font-semibold">₹{walletBalance.toFixed(2)}</span></p>
                  </div>
                  
                  {!hasBankDetails ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md flex items-start mb-4">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">Bank details required for withdrawals</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          You need to add your bank details before you can withdraw funds to your bank account.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setShowBankDialog(true)}
                        >
                          Add Bank Details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => setShowWithdrawDialog(true)}
                    >
                      <ArrowDownToLine className="mr-2 h-4 w-4" />
                      Withdraw to Bank Account
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bank Details Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Add your bank account or UPI details to receive exam rewards
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Holder Name</Label>
              <Input
                id="accountName"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                placeholder="Enter account holder's name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="Enter bank name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="Enter account number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                placeholder="Enter IFSC code"
              />
            </div>
            
            <div className="relative mt-6 pt-6 border-t">
              <p className="absolute -top-3 bg-background px-2 text-sm text-muted-foreground">Or add UPI details</p>
              
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={bankDetails.upiId}
                  onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                  placeholder="username@upi"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowBankDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBankDetailsUpdate} disabled={loading}>
              {loading ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Enter the amount you would like to withdraw from your wallet to your bank account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="withdrawAmount">Amount (₹)</Label>
              <p className="text-sm text-muted-foreground">Available: ₹{walletBalance.toFixed(2)}</p>
            </div>
            <Input
              id="withdrawAmount"
              type="number"
              placeholder="Enter amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              min="100"
              max={walletBalance.toString()}
              step="100"
            />
            
            <div className="text-sm text-muted-foreground space-y-2 mt-4">
              <p>• Minimum withdrawal amount is ₹100</p>
              <p>• Withdrawals are typically processed within 2-3 business days</p>
              <p>• The money will be sent to the bank account details you provided</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdrawal} disabled={withdrawLoading}>
              {withdrawLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}