"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  Clock, 
  Edit, 
  Plus, 
  Trash, 
  Image, 
  Loader2, 
  Trophy, 
  DollarSign, 
  Medal, 
  Award, 
  Check,
  Users,
  ListChecks,
  FileQuestion,
  BarChart3,
  LayoutDashboard,
  BookOpen
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, deleteDoc, doc, updateDoc, getDoc, query, where, getDocs, serverTimestamp, setDoc, orderBy, limit, Timestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { formatFileSize } from "@/lib/utils";
import { convertFirebaseTimestamp } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type ExamFormData = {
  title: string;
  description: string;
  duration: number;
  startDate: string;
  endDate: string;
  subjects: { name: string }[];
  thumbnailUrl?: string;
};

// Helper function to safely format dates
const formatDisplayDate = (date: any): string => {
  if (!date) return "No date set";
  
  // If it's already a Date object
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  
  // Try to convert Firebase timestamp to Date
  try {
    const convertedDate = convertFirebaseTimestamp(date);
    return convertedDate ? convertedDate.toLocaleDateString() : "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

// Format date for input fields
const formatDateForInput = (date: any): string => {
  if (!date) return '';
  
  try {
    // If it's a Date object
    if (date instanceof Date) {
      return date.toISOString().slice(0, 16);
    }
    
    // Try to convert Firebase timestamp to Date
    const convertedDate = convertFirebaseTimestamp(date);
    return convertedDate ? convertedDate.toISOString().slice(0, 16) : '';
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return '';
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const { exams, user } = useExam();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [formData, setFormData] = useState<ExamFormData>({
    title: "",
    description: "",
    duration: 60,
    startDate: "",
    endDate: "",
    subjects: []
  });
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);
  const [selectedExamForRewards, setSelectedExamForRewards] = useState<any>(null);
  const [examToppers, setExamToppers] = useState<any[]>([]);
  const [rewardAmounts, setRewardAmounts] = useState<{[userId: string]: number}>({});
  const [loadingToppers, setLoadingToppers] = useState(false);
  const [rewardsDistributed, setRewardsDistributed] = useState(false);
  const [stats, setStats] = useState({
    totalExams: 0,
    activeExams: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalRegistrations: 0,
    recentRegistrations: [] as any[],
    upcomingExams: [] as any[],
    totalRewards: 0,
    pendingRewards: 0,
    usersWithBank: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, [exams]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Count active exams from context
      const now = new Date();
      const activeExams = exams.filter(exam => {
        const startDate = exam.startDate instanceof Date 
          ? exam.startDate 
          : (exam.startDate ? new Date(exam.startDate) : new Date());
        
        const endDate = exam.endDate instanceof Date 
          ? exam.endDate 
          : (exam.endDate ? new Date(exam.endDate) : new Date());
          
        return startDate <= now && endDate >= now && exam.isActive;
      });

      // Get upcoming exams
      const upcomingExams = exams
        .filter(exam => {
          const startDate = exam.startDate instanceof Date 
            ? exam.startDate 
            : (exam.startDate ? new Date(exam.startDate) : new Date());
          return startDate > now && exam.isActive;
        })
        .sort((a, b) => {
          const aDate = a.startDate instanceof Date ? a.startDate : (a.startDate ? new Date(a.startDate) : new Date());
          const bDate = b.startDate instanceof Date ? b.startDate : (b.startDate ? new Date(b.startDate) : new Date());
          return aDate.getTime() - bDate.getTime();
        })
        .slice(0, 5);

      // Get user count and active users
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;
      
      // Count active users (users who are marked as online)
      let activeUsers = 0;
      let totalRewards = 0;
      let pendingRewards = 0;
      let usersWithBank = 0;
      
      // Additional user statistics
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.isOnline) {
          activeUsers++;
        }
        
        // Check for bank details
        const bankDetailsDoc = await getDoc(doc(db, "bankDetails", userDoc.id));
        if (bankDetailsDoc.exists()) {
          usersWithBank++;
        }
        
        // Get user stats if they exist
        const userStatsDoc = await getDoc(doc(db, "userStats", userDoc.id));
        if (userStatsDoc.exists()) {
          const statsData = userStatsDoc.data();
          totalRewards += statsData.totalRewards || 0;
          pendingRewards += statsData.pendingRewards || 0;
        }
      }

      // Get registrations count and recent registrations
      const registrationsQuery = query(
        collection(db, "examRegistrations"),
        orderBy("registeredAt", "desc"),
        limit(5)
      );
      const registrationsSnapshot = await getDocs(registrationsQuery);
      const totalRegistrations = registrationsSnapshot.size;
      
      const recentRegistrations = registrationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registeredAt: data.registeredAt?.toDate ? data.registeredAt.toDate() : new Date()
        };
      });

      setStats({
        totalExams: exams.length,
        activeExams: activeExams.length,
        totalUsers,
        activeUsers,
        totalRegistrations,
        recentRegistrations,
        upcomingExams,
        totalRewards,
        pendingRewards,
        usersWithBank
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size - limit to 2MB
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setThumbnailFile(file);
    }
  };

  const uploadThumbnail = async (examId: string): Promise<string | null> => {
    if (!thumbnailFile) return null;
    
    try {
      setUploadingThumbnail(true);
      
      // Create a reference to the exam thumbnail location
      const storageRef = ref(storage, `exam-thumbnails/${examId}`);
      
      // Add metadata to the upload
      const metadata = {
        contentType: thumbnailFile.type,
        customMetadata: {
          'uploadedBy': user?.id || 'unknown',
          'examId': examId
        }
      };
      
      // Upload the file with metadata
      await uploadBytes(storageRef, thumbnailFile, metadata);
      
      // Get the download URL
      const thumbnailUrl = await getDownloadURL(storageRef);
      
      return thumbnailUrl;
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast({
        title: "Error uploading thumbnail",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingThumbnail(false);
      setThumbnailFile(null);
    }
  };

  const handleCreateExam = async () => {
    try {
      setLoading(true);

      const examData = {
        ...formData,
        isActive: true,
        isCompleted: false,
        isResultReleased: false,
        totalQuestions: 0,
        createdAt: new Date(),
      };

      const examRef = await addDoc(collection(db, "exams"), examData);

      // Create subjects for the exam
      const subjectPromises = formData.subjects.map(subject =>
        addDoc(collection(db, "subjects"), {
          examId: examRef.id,
          name: subject.name,
          totalQuestions: 0,
          totalMarks: 0
        })
      );

      await Promise.all(subjectPromises);
      
      // Upload thumbnail if provided
      if (thumbnailFile) {
        try {
          const thumbnailUrl = await uploadThumbnail(examRef.id);
          if (thumbnailUrl) {
            await updateDoc(doc(db, "exams", examRef.id), {
              thumbnailUrl
            });
          }
        } catch (error) {
          console.error("Error uploading thumbnail:", error);
          toast({
            title: "Warning",
            description: "Exam was created but thumbnail upload failed",
            variant: "destructive",
          });
          // Don't try to update with undefined thumbnailUrl
        }
      }

      toast({
        title: "Success",
        description: "Exam created successfully",
      });

      setShowCreateDialog(false);
      setFormData({
        title: "",
        description: "",
        duration: 60,
        startDate: "",
        endDate: "",
        subjects: []
      });
      setThumbnailFile(null);
    } catch (error) {
      console.error("Error creating exam:", error);
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditExam = async () => {
    if (!selectedExam) return;

    try {
      setLoading(true);

      // Prepare update data
      const updateData = {
        ...formData,
        updatedAt: new Date(),
      };
      
      // Upload thumbnail if a new one was selected
      if (thumbnailFile) {
        try {
          const thumbnailUrl = await uploadThumbnail(selectedExam.id);
          if (thumbnailUrl) {
            updateData.thumbnailUrl = thumbnailUrl;
          }
        } catch (error) {
          console.error("Error uploading thumbnail:", error);
          toast({
            title: "Warning",
            description: "Exam details were updated but thumbnail upload failed",
            variant: "destructive",
          });
          // Don't add thumbnailUrl to updateData if upload failed
        }
      }

      const examRef = doc(db, "exams", selectedExam.id);
      await updateDoc(examRef, updateData);

      // Update existing subjects and create new ones
      const existingSubjects = selectedExam.subjects || [];
      const updatedSubjects = formData.subjects;

      // Create new subjects
      const newSubjects = updatedSubjects.filter(subject => 
        !existingSubjects.find((s: any) => s.name === subject.name)
      );

      const subjectPromises = newSubjects.map(subject =>
        addDoc(collection(db, "subjects"), {
          examId: selectedExam.id,
          name: subject.name,
          totalQuestions: 0,
          totalMarks: 0
        })
      );

      await Promise.all(subjectPromises);

      toast({
        title: "Success",
        description: "Exam updated successfully",
      });

      setShowEditDialog(false);
      setSelectedExam(null);
      setThumbnailFile(null);
    } catch (error) {
      console.error("Error updating exam:", error);
      toast({
        title: "Error",
        description: "Failed to update exam",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      setLoading(true);
      
      // Delete thumbnail from storage if it exists
      try {
        const examDocRef = doc(db, "exams", examId);
        const examDoc = await getDoc(examDocRef);
        
        if (examDoc.exists() && examDoc.data().thumbnailUrl) {
          const storageRef = ref(storage, `exam-thumbnails/${examId}`);
          await deleteObject(storageRef);
        }
      } catch (error) {
        console.error("Error deleting thumbnail:", error);
        // Continue with deleting the exam document even if thumbnail deletion fails
      }
      
      // Delete exam document
      await deleteDoc(doc(db, "exams", examId));

      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a thumbnail preview box in the create/edit dialog
  const renderThumbnailPreview = (existingUrl?: string) => {
    if (thumbnailFile) {
      return (
        <div className="mt-2 relative">
          <img 
            src={URL.createObjectURL(thumbnailFile)} 
            alt="Thumbnail Preview" 
            className="max-h-48 rounded-md object-cover"
          />
          <div className="mt-1 text-xs text-muted-foreground">
            {thumbnailFile.name} ({formatFileSize(thumbnailFile.size)})
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            className="absolute top-0 right-0 w-8 h-8 p-0 rounded-full"
            onClick={() => setThumbnailFile(null)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    } else if (existingUrl) {
      return (
        <div className="mt-2 relative">
          <img 
            src={existingUrl} 
            alt="Current Thumbnail" 
            className="max-h-48 rounded-md object-cover"
          />
          <div className="mt-1 text-xs text-muted-foreground">
            Current thumbnail image
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Function to load top performing users for an exam
  const loadExamToppers = async (examId: string) => {
    try {
      setLoadingToppers(true);
      setExamToppers([]);
      setRewardsDistributed(false);
      
      // Clear previous rewards data
      setRewardAmounts({});
      
      // Query all completed attempts for this exam
      const attemptsQuery = query(
        collection(db, "examAttempts"),
        where("examId", "==", examId),
        where("isSubmitted", "==", true)
      );
      
      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      if (attemptsSnapshot.empty) {
        toast({
          title: "No Results",
          description: "No completed attempts found for this exam",
          variant: "destructive",
        });
        return;
      }
      
      // Get user details and create ranking
      const toppersList = await Promise.all(
        attemptsSnapshot.docs.map(async (docSnapshot) => {
          const attemptData = docSnapshot.data();
          const userDocRef = doc(db, "users", attemptData.userId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          return {
            userId: attemptData.userId,
            userName: userData?.name || "Anonymous",
            email: userData?.email || "N/A",
            score: attemptData.score || 0,
            totalMarks: attemptData.totalMarks || 0,
            earnedMarks: attemptData.earnedMarks || 0,
            photoURL: userData?.photoURL,
            rank: 0 // Will calculate this after sorting
          };
        })
      );
      
      // Sort by score (highest first) and assign ranks
      toppersList.sort((a, b) => b.score - a.score);
      toppersList.forEach((topper, index) => {
        topper.rank = index + 1;
      });
      
      // Check if rewards have already been assigned
      const rewardsQuery = query(
        collection(db, "rewards"),
        where("examId", "==", examId)
      );
      
      const rewardsSnapshot = await getDocs(rewardsQuery);
      const existingRewards: {[userId: string]: number} = {};
      
      if (!rewardsSnapshot.empty) {
        rewardsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          existingRewards[data.userId] = data.amount;
        });
        
        // Check if rewards have been distributed (if any rewards exist)
        setRewardsDistributed(rewardsSnapshot.size > 0);
      }
      
      // Set default rewards for top 3, or use existing values
      const defaultRewards: {[userId: string]: number} = {};
      
      // Only assign to top 3 if they exist
      if (toppersList.length > 0 && toppersList[0]) {
        defaultRewards[toppersList[0].userId] = existingRewards[toppersList[0].userId] || 1000; // 1st place: ₹1000
      }
      
      if (toppersList.length > 1 && toppersList[1]) {
        defaultRewards[toppersList[1].userId] = existingRewards[toppersList[1].userId] || 500; // 2nd place: ₹500
      }
      
      if (toppersList.length > 2 && toppersList[2]) {
        defaultRewards[toppersList[2].userId] = existingRewards[toppersList[2].userId] || 250; // 3rd place: ₹250
      }
      
      setExamToppers(toppersList);
      setRewardAmounts(defaultRewards);
      
      // Also check if the exam has the rewardsDistributed flag
      const examDocRef = doc(db, "exams", examId);
      const examDoc = await getDoc(examDocRef);
      if (examDoc.exists() && examDoc.data().rewardsDistributed === true) {
        setRewardsDistributed(true);
      }
      
    } catch (error) {
      console.error("Error loading exam toppers:", error);
      toast({
        title: "Error",
        description: "Failed to load top performing users",
        variant: "destructive",
      });
    } finally {
      setLoadingToppers(false);
    }
  };

  // Function to update or distribute rewards
  const distributeRewards = async () => {
    try {
      setLoading(true);
      
      if (!selectedExamForRewards) {
        throw new Error("No exam selected for reward distribution");
      }
      
      // Check if rewards have already been distributed
      if (rewardsDistributed) {
        toast({
          title: "Already Distributed",
          description: "Rewards have already been distributed for this exam.",
          variant: "destructive",
        });
        setShowRewardsDialog(false);
        return;
      }
      
      // Get all user IDs with reward amounts
      const userIds = Object.keys(rewardAmounts);
      
      if (userIds.length === 0) {
        toast({
          title: "No Rewards",
          description: "No rewards specified to distribute. Please assign rewards to at least one participant.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate reward amounts
      const invalidAmounts = userIds.filter(id => {
        const amount = rewardAmounts[id];
        return amount <= 0 || isNaN(amount);
      });
      
      if (invalidAmounts.length > 0) {
        toast({
          title: "Invalid Reward Amounts",
          description: `${invalidAmounts.length} user(s) have invalid reward amounts. Please provide positive numbers only.`,
          variant: "destructive",
        });
        return;
      }
      
      // Show confirmation toast
      toast({
        title: "Processing Rewards",
        description: "Starting reward distribution process...",
      });
      
      // Check existing rewards to update or create new ones
      const rewardsQuery = query(
        collection(db, "rewards"),
        where("examId", "==", selectedExamForRewards.id)
      );
      
      const rewardsSnapshot = await getDocs(rewardsQuery);
      const existingRewards = new Map();
      
      rewardsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        existingRewards.set(data.userId, {
          docId: doc.id,
          status: data.status
        });
      });
      
      // Track successful and failed operations
      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };
      
      // Create or update reward documents
      const promises = userIds.map(async (userId) => {
        const amount = rewardAmounts[userId];
        
        // Skip users with zero amount
        if (!amount || amount <= 0) {
          return;
        }
        
        try {
          // Find user's rank
          const userRank = examToppers.find(topper => topper.userId === userId)?.rank || 0;
          const userEmail = examToppers.find(topper => topper.userId === userId)?.email || 'User';
          
          // Prepare the reward data
          const rewardData = {
            examId: selectedExamForRewards.id,
            examTitle: selectedExamForRewards.title,
            userId,
            userEmail,
            amount,
            rank: userRank,
            status: "pending",
            description: `Reward for ${userRank}${getOrdinalSuffix(userRank)} place in ${selectedExamForRewards.title} exam`,
            createdAt: new Date(),
            claimable: true,
            distributedBy: user?.id || 'admin'
          };
          
          let rewardDocId;
          
          if (existingRewards.has(userId)) {
            const existingReward = existingRewards.get(userId);
            
            // Only update if not already claimed or paid
            if (existingReward.status === "pending") {
              await updateDoc(doc(db, "rewards", existingReward.docId), rewardData);
              rewardDocId = existingReward.docId;
            } else {
              // Log that we're skipping an already processed reward
              console.log(`Skipping reward update for user ${userId} as it's already in ${existingReward.status} state`);
              results.errors.push(`Reward for rank ${userRank} is already in ${existingReward.status} state`);
              return;
            }
          } else {
            // Create new reward
            const newRewardRef = await addDoc(collection(db, "rewards"), rewardData);
            rewardDocId = newRewardRef.id;
          }
          
          // Update user stats with pending reward amount
          if (rewardDocId) {
            const statsRef = doc(db, "userStats", userId);
            const statsSnap = await getDoc(statsRef);
            
            if (statsSnap.exists()) {
              // Add to existing pending rewards
              const currentPending = statsSnap.data().pendingRewards || 0;
              const totalRewards = statsSnap.data().totalRewards || 0;
              
              await updateDoc(statsRef, {
                pendingRewards: currentPending + amount,
                totalRewards: totalRewards + amount,
                lastRewardAt: serverTimestamp(),
                lastRewardAmount: amount,
                lastRewardExamId: selectedExamForRewards.id,
                lastRewardExamTitle: selectedExamForRewards.title
              });
            } else {
              // Create new user stats document if it doesn't exist
              await setDoc(statsRef, {
                pendingRewards: amount,
                processingRewards: 0,
                totalRewards: amount,
                createdAt: serverTimestamp(),
                lastRewardAt: serverTimestamp(),
                lastRewardAmount: amount,
                lastRewardExamId: selectedExamForRewards.id,
                lastRewardExamTitle: selectedExamForRewards.title
              });
            }
            
            // Create a notification for the user
            await addDoc(collection(db, "notifications"), {
              userId,
              title: "New Reward Available!",
              message: `You've received a reward of ₹${amount} for your ${userRank}${getOrdinalSuffix(userRank)} place finish in ${selectedExamForRewards.title}.`,
              type: "reward",
              examId: selectedExamForRewards.id,
              rewardId: rewardDocId,
              amount,
              read: false,
              createdAt: serverTimestamp()
            });
            
            results.successful++;
          }
        } catch (error) {
          console.error(`Error processing reward for user ${userId}:`, error);
          results.failed++;
          results.errors.push(`Failed to process reward for user ranking ${examToppers.find(topper => topper.userId === userId)?.rank || 'unknown'}`);
        }
      });
      
      // Wait for all reward distribution to complete
      await Promise.all(promises);
      
      // Calculate total rewards distributed
      let totalDistributed = 0;
      for (const userId of userIds) {
        totalDistributed += rewardAmounts[userId] || 0;
      }
      
      // Update the exam to mark rewards as distributed
      await updateDoc(doc(db, "exams", selectedExamForRewards.id), {
        rewardsDistributed: true,
        rewardsDistributedAt: serverTimestamp(),
        distributedBy: user?.id || 'admin',
        totalRewardsDistributed: totalDistributed,
        rewardsDistributionSummary: {
          successCount: results.successful,
          failureCount: results.failed,
          totalParticipants: examToppers.length,
          totalRewarded: userIds.length
        }
      });
      
      // Add an admin log entry
      await addDoc(collection(db, "adminLogs"), {
        action: "distribute_rewards",
        examId: selectedExamForRewards.id,
        examTitle: selectedExamForRewards.title,
        adminId: user?.id,
        timestamp: serverTimestamp(),
        details: {
          successCount: results.successful,
          failureCount: results.failed,
          totalAmount: totalDistributed,
          errors: results.errors
        }
      });
      
      // Update state
      setRewardsDistributed(true);

      // Show success or partial success toast
      if (results.failed > 0) {
        toast({
          title: "Partially Completed",
          description: `Distributed ${results.successful} rewards successfully. ${results.failed} failed.`,
          variant: "default"
        });
      } else {
      toast({
        title: "Success",
          description: `Rewards distributed successfully to ${results.successful} participants`,
      });
      }
      
      setShowRewardsDialog(false);
      
    } catch (error) {
      console.error("Error distributing rewards:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to distribute rewards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get ordinal suffix for ranks
  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };

  // Helper to get reward icon based on rank
  const getRewardIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2: return <Medal className="h-4 w-4 text-gray-400" />;
      case 3: return <Award className="h-4 w-4 text-amber-600" />;
      default: return <div className="w-4"></div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Exam Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalExams}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.activeExams} active exams
            </div>
          </CardContent>
        </Card>
        
        {/* User Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              {stats.activeUsers} users online now
            </div>
          </CardContent>
        </Card>
        
        {/* Registrations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRegistrations}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.recentRegistrations.length} recent registrations
            </div>
          </CardContent>
        </Card>
        
        {/* Rewards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{stats.totalRewards.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              ₹{stats.pendingRewards.toLocaleString()} pending payouts
                </div>
          </CardContent>
        </Card>
                </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Exams Section */}
        <Card className="lg:col-span-2">
          {/* ... existing code ... */}
        </Card>
        
        {/* Users Overview Section - New */}
        <Card>
          <CardHeader>
            <CardTitle>Users Overview</CardTitle>
            <CardDescription>User account statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Bank Details Added</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((stats.usersWithBank / stats.totalUsers) * 100)}%
                </div>
                </div>
                <Progress value={(stats.usersWithBank / stats.totalUsers) * 100} className="h-2" />
                </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Active Users Now</h4>
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{stats.activeUsers} Online</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total users
                      </div>
                  </div>
                </div>
      </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Recent User Activity</h4>
                  <Button variant="link" size="sm" className="h-6 p-0" onClick={() => router.push('/admin/users')}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {stats.recentRegistrations.map((reg, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{reg.userName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{reg.userName || 'Unknown User'}</div>
                        <div className="text-xs text-muted-foreground">
                          Registered for {reg.examTitle || 'an exam'}
              </div>
                </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(reg.registeredAt), { addSuffix: true })}
              </div>
                    </div>
                  ))}
                  
                  {stats.recentRegistrations.length === 0 && (
                    <div className="text-center py-3 text-muted-foreground text-sm">
                      No recent registrations
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
      
      {/* ... existing code ... */}
    </div>
  );
}