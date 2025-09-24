"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, Clock, Edit, Plus, Trash, Eye, 
  CheckCircle, XCircle, Play, Pause, Award, 
  Search, Filter, ExternalLink, List, Table as TableIcon,
  Trophy, Medal, DollarSign, Loader2, Check, FileText, Upload, AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  updateDoc, 
  where,
  orderBy,
  addDoc,
  setDoc,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { convertFirebaseTimestamp } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuestionMath } from "@/components/ui/math-content";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { formatFileSize } from "@/lib/utils";

// Add an interface for the subject type
interface Subject {
  id?: string;
  name: string;
  language: "english" | "hindi" | "both";  // Added language support
}

// Helper function to safely format dates
const formatDisplayDate = (date: any, isAnytime?: boolean): string => {
  if (isAnytime) return "Anytime";
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

// Determine if an exam is ongoing, upcoming, or completed based on dates
const getExamStatus = (exam: any): 'ongoing' | 'upcoming' | 'completed' => {
  // If exam is set to anytime, it's always ongoing
  if (exam.isAnytime) return 'ongoing';
  
  const now = new Date();
  const startDate = convertFirebaseTimestamp(exam.startDate);
  const endDate = convertFirebaseTimestamp(exam.endDate);
  
  if (!startDate || !endDate) return 'ongoing';
  
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'completed';
  return 'ongoing';
};

// Component for exam status badge
const ExamStatusBadge = ({ status, isActive }: { status: string, isActive: boolean }) => {
  if (!isActive) return <Badge variant="outline" className="bg-gray-100 text-gray-800">Inactive</Badge>;
  
  switch (status) {
    case 'ongoing':
      return <Badge className="bg-green-100 text-green-800">Ongoing</Badge>;
    case 'upcoming':
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    case 'completed':
      return <Badge className="bg-purple-100 text-purple-800">Completed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default function AdminExamsPage() {
  const router = useRouter();
  const { exams, user, categories } = useExam();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [filteredExams, setFilteredExams] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<
    'activate' | 'deactivate' | 'release' | 'unreleased' | 'delete' | 'deleteSubject' | null
  >(null);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [participantsCount, setParticipantsCount] = useState<{[examId: string]: number}>({});
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);
  const [selectedExamForRewards, setSelectedExamForRewards] = useState<any>(null);
  const [examToppers, setExamToppers] = useState<any[]>([]);
  const [rewardAmounts, setRewardAmounts] = useState<{[userId: string]: number}>({});
  const [loadingToppers, setLoadingToppers] = useState(false);
  const [rewardsDistributed, setRewardsDistributed] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateExamDialog, setShowCreateExamDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    startDate: "",
    endDate: "",
    subjects: [{ name: "", language: "english" } as Subject],
    thumbnailUrl: "",
    isAnytime: false,
    categoryId: "",
    subcategoryId: "",
    examType: "test-series" // Default to test-series
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [selectedSubjectForDeletion, setSelectedSubjectForDeletion] = useState<{id: string, name: string, index: number} | null>(null);
  
  // JSON to Exam functionality state
  const [showJsonToExamDialog, setShowJsonToExamDialog] = useState(false);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [uploadingJson, setUploadingJson] = useState(false);
  const [jsonPreviewStep, setJsonPreviewStep] = useState<'upload' | 'preview' | 'edit' | 'topics'>('upload');
  
  // Topic mapping states
  const [topicFile, setTopicFile] = useState<File | null>(null);
  const [topicData, setTopicData] = useState<any>(null);
  const [topicError, setTopicError] = useState<string | null>(null);
  const [uploadingTopics, setUploadingTopics] = useState(false);
  
  // Load and filter exams when data changes
  useEffect(() => {
    filterExams();
    loadParticipantsCounts();
  }, [exams, currentTab, searchQuery, statusFilter]);
  
  // Filter exams based on current filters
  const filterExams = () => {
    let filtered = [...exams];
    
    // Apply search filter if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exam => 
        exam.title.toLowerCase().includes(query) || 
        exam.description.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filter
    if (currentTab === "active") {
      filtered = filtered.filter(exam => exam.isActive);
    } else if (currentTab === "inactive") {
      filtered = filtered.filter(exam => !exam.isActive);
    } else if (currentTab === "released") {
      filtered = filtered.filter(exam => exam.isResultReleased);
    } else if (currentTab === "unreleased") {
      filtered = filtered.filter(exam => !exam.isResultReleased);
    } else if (currentTab === "rewards") {
      filtered = filtered.filter(exam => exam.rewardsDistributed);
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(exam => getExamStatus(exam) === statusFilter);
    }
    
    // Sort exams: first by dates, then by title
    filtered.sort((a, b) => {
      const aDate = convertFirebaseTimestamp(a.endDate) || new Date(0);
      const bDate = convertFirebaseTimestamp(b.endDate) || new Date(0);
      
      // Sort by end date (newest first)
      const dateComparison = bDate.getTime() - aDate.getTime();
      if (dateComparison !== 0) return dateComparison;
      
      // If dates are the same, sort alphabetically by title
      return a.title.localeCompare(b.title);
    });
    
    setFilteredExams(filtered);
  };
  
  // Load the number of participants for each exam
  const loadParticipantsCounts = async () => {
    const counts: {[examId: string]: number} = {};
    
    for (const exam of exams) {
      try {
        const attemptsQuery = query(
          collection(db, "examAttempts"),
          where("examId", "==", exam.id),
          where("isSubmitted", "==", true)
        );
        
        const snapshot = await getDocs(attemptsQuery);
        counts[exam.id] = snapshot.size;
      } catch (error) {
        console.error(`Error loading participant count for exam ${exam.id}:`, error);
        counts[exam.id] = 0;
      }
    }
    
    setParticipantsCount(counts);
  };
  
  // Toggle exam active status
  const toggleExamActive = async (exam: any) => {
    try {
      setLoading(true);
      const newStatus = !exam.isActive;
      
      await updateDoc(doc(db, "exams", exam.id), {
        isActive: newStatus
      });
      
      toast({
        title: "Success",
        description: `Exam ${newStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
    } catch (error) {
      console.error("Error updating exam status:", error);
      toast({
        title: "Error",
        description: "Failed to update exam status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };
  
  // Toggle result release status
  const toggleResultReleased = async (exam: any) => {
    try {
      setLoading(true);
      const newStatus = !exam.isResultReleased;
      
      await updateDoc(doc(db, "exams", exam.id), {
        isResultReleased: newStatus
      });
      
      toast({
        title: "Success",
        description: `Exam results ${newStatus ? 'released' : 'hidden'} successfully`,
      });
      
    } catch (error) {
      console.error("Error updating result status:", error);
      toast({
        title: "Error",
        description: "Failed to update result status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };
  
  // Delete an exam
  const deleteExam = async (examId: string) => {
    try {
      setLoading(true);
      
      // First, fetch all subjects for this exam
      const subjectsQuery = query(
        collection(db, "subjects"),
        where("examId", "==", examId)
      );
      
      const subjectsSnapshot = await getDocs(subjectsQuery);
      const subjectIds = subjectsSnapshot.docs.map(doc => doc.id);
      
      // For each subject, delete all questions
      const deleteQuestionsPromises = subjectIds.map(async (subjectId) => {
        const questionsQuery = query(
          collection(db, "questions"),
          where("subjectId", "==", subjectId)
        );
        
        const questionsSnapshot = await getDocs(questionsQuery);
        return Promise.all(questionsSnapshot.docs.map(doc => deleteDoc(doc.ref)));
      });
      
      // Wait for all question deletions to complete
      await Promise.all(deleteQuestionsPromises);
      
      // Delete all subjects
      const deleteSubjectsPromises = subjectsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteSubjectsPromises);
      
      // Delete all exam attempts
      const attemptsQuery = query(
        collection(db, "examAttempts"),
        where("examId", "==", examId)
      );
      
      const attemptsSnapshot = await getDocs(attemptsQuery);
      const deleteAttemptsPromises = attemptsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteAttemptsPromises);
      
      // Delete all rewards associated with this exam
      const rewardsQuery = query(
        collection(db, "rewards"),
        where("examId", "==", examId)
      );
      
      const rewardsSnapshot = await getDocs(rewardsQuery);
      const deleteRewardsPromises = rewardsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteRewardsPromises);
      
      // Finally, delete the exam itself
      await deleteDoc(doc(db, "exams", examId));
      
      toast({
        title: "Success",
        description: "Exam has been permanently deleted",
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
      setShowConfirmDialog(false);
    }
  };
  
  // Handle confirmation dialog actions
  const handleConfirmAction = async () => {
    if (!selectedExam && actionType !== 'deleteSubject') return;
    
    switch (actionType) {
      case 'activate':
        await toggleExamActive(selectedExam);
        break;
      case 'deactivate':
        await toggleExamActive(selectedExam);
        break;
      case 'release':
        await toggleResultReleased(selectedExam);
        break;
      case 'unreleased':
        await toggleResultReleased(selectedExam);
        break;
      case 'delete':
        await deleteExam(selectedExam.id);
        break;
      case 'deleteSubject':
        await deleteSubject();
        break;
    }
  };
  
  // Show confirm dialog before taking an action
  const showConfirm = (exam: any, action: 'activate' | 'deactivate' | 'release' | 'unreleased' | 'delete') => {
    setSelectedExam(exam);
    setActionType(action);
    setShowConfirmDialog(true);
  };
  
  // Quick toggle functions with confirmation
  const handleActivateExam = (exam: any) => {
    showConfirm(exam, exam.isActive ? 'deactivate' : 'activate');
  };
  
  const handleReleaseResults = (exam: any) => {
    showConfirm(exam, exam.isResultReleased ? 'unreleased' : 'release');
  };
  
  // Get confirmation dialog content based on action type
  const getConfirmationContent = () => {
    if (actionType === 'deleteSubject') {
      if (!selectedSubjectForDeletion) return null;
      return {
        title: 'Delete Subject',
        description: `Are you sure you want to delete the subject "${selectedSubjectForDeletion.name}"? This will also delete all questions associated with this subject. This action cannot be undone.`
      };
    }
    
    if (!selectedExam || !actionType) return null;
    
    const contents: {[key: string]: {title: string, description: string}} = {
      'activate': {
        title: 'Activate Exam',
        description: `Are you sure you want to activate "${selectedExam.title}"? This will make the exam visible to all users.`
      },
      'deactivate': {
        title: 'Deactivate Exam',
        description: `Are you sure you want to deactivate "${selectedExam.title}"? This will hide the exam from users.`
      },
      'release': {
        title: 'Release Exam Results',
        description: `Are you sure you want to release results for "${selectedExam.title}"? This will make all scores and rankings visible to participants.`
      },
      'unreleased': {
        title: 'Hide Exam Results',
        description: `Are you sure you want to hide results for "${selectedExam.title}"? This will prevent participants from seeing their scores and rankings.`
      },
      'delete': {
        title: 'Delete Exam Permanently',
        description: `Are you sure you want to permanently delete "${selectedExam.title}"? This will delete the exam and all associated data including subjects, questions, attempts, and rewards. This action CANNOT be undone.`
      }
    };
    
    return contents[actionType];
  };
  
  const confirmationContent = getConfirmationContent();
  
  // Load the top performing users for an exam
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
  
  // Function to prepare exam for editing
  const prepareExamForEdit = async (exam: any) => {
    setSelectedExam(exam);
    
    // Format dates for datetime-local input
    const formatDate = (timestamp: any): string => {
      if (!timestamp) return '';
      const date = convertFirebaseTimestamp(timestamp);
      if (!date) return '';
      
      return date.toISOString().slice(0, 16); // Format to YYYY-MM-DDThh:mm
    };
    
    // Load subjects for this exam
    try {
      // Query for all subjects for this exam regardless of deletion status first
      const subjectsQuery = query(
        collection(db, "subjects"),
        where("examId", "==", exam.id)
      );
      
      const subjectsSnapshot = await getDocs(subjectsQuery);
      
      // Filter out deleted subjects in the client
      const subjectsData = subjectsSnapshot.docs
        .filter(doc => doc.data().isDeleted !== true) // Only include non-deleted subjects
        .map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unnamed Subject',
          language: (doc.data().language || "english") as "english" | "hindi" | "both"
        }));
      
      
      // If no subjects were found, initialize with an empty one
      const subjects = subjectsData.length > 0 ? subjectsData : [{ name: "", language: "english" as "english" | "hindi" | "both" }];
      
      // Reset form data completely before setting new data
      setFormData({
        title: "",
        description: "",
        duration: 60,
        startDate: "",
        endDate: "",
        subjects: [{ name: "", language: "english" }],
        thumbnailUrl: "",
        isAnytime: false,
        categoryId: "",
        subcategoryId: "",
        examType: "test-series"
      });
      
      // Then set the actual form data with a slight delay to ensure state update
      setTimeout(() => {
        setFormData({
          title: exam.title || "",
          description: exam.description || "",
          duration: exam.duration || 60,
          startDate: formatDate(exam.startDate),
          endDate: formatDate(exam.endDate),
          subjects: subjects,
          thumbnailUrl: exam.thumbnailUrl || "",
          isAnytime: exam.isAnytime || false,
          categoryId: exam.categoryId || "",
          subcategoryId: exam.subcategoryId || "",
          examType: exam.examType || "test-series"
        });
        
        
        // Open the edit dialog
        setShowEditDialog(true);
      }, 50);
      
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast({
        title: "Error",
        description: "Failed to load exam subjects",
        variant: "destructive",
      });
    }
  };

  // Function to confirm subject deletion
  const confirmSubjectDeletion = (subjectId: string, subjectName: string, index: number) => {
    setSelectedSubjectForDeletion({ id: subjectId, name: subjectName, index });
    setActionType('deleteSubject');
    setShowConfirmDialog(true);
  };

  // Handle deletion of a subject and its questions
  const deleteSubject = async () => {
    if (!selectedSubjectForDeletion) return;
    
    try {
      setLoading(true);
      
      // Get the subject ID and update local state first
      const { id, index } = selectedSubjectForDeletion;
      
      const updatedSubjects = [...formData.subjects];
      updatedSubjects.splice(index, 1);
      
      // If no subjects would remain, add an empty one
      if (updatedSubjects.length === 0) {
        updatedSubjects.push({ name: "", language: "english" });
      }
      
      setFormData({ ...formData, subjects: updatedSubjects });
      
      // Permanently delete the subject from the database if it exists
      if (id) {
        // First, count how many questions will be affected
        const questionsQuery = query(
          collection(db, "questions"),
          where("subjectId", "==", id)
        );
        
        const questionsSnapshot = await getDocs(questionsQuery);
        const questionsCount = questionsSnapshot.size;
        
        // Delete subject from the database
        await deleteDoc(doc(db, "subjects", id));
        
        // Delete all questions in this subject from the database
        const deleteQuestionsPromises = questionsSnapshot.docs.map(questionDoc => 
          deleteDoc(questionDoc.ref)
        );
        
        await Promise.all(deleteQuestionsPromises);
        
        toast({
          title: "Subject Deleted",
          description: `Subject and ${questionsCount} questions have been permanently deleted`,
        });
      }
      
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
      setSelectedSubjectForDeletion(null);
    }
  };

  // Handle deletion directly in the edit form
  const handleSubjectRemoval = async (subjectId: string | undefined, subjectName: string, index: number) => {
    // If subject has no ID, just remove it from the form (it doesn't exist in DB yet)
    if (!subjectId) {
      const updatedSubjects = [...formData.subjects];
      updatedSubjects.splice(index, 1);
      
      // If no subjects would remain, add an empty one
      if (updatedSubjects.length === 0) {
        updatedSubjects.push({ name: "", language: "english" });
      }
      
      setFormData({ ...formData, subjects: updatedSubjects });
      return;
    }
    
    // Otherwise, show confirmation dialog for existing subjects
    confirmSubjectDeletion(subjectId, subjectName, index);
  };

  // Function to handle editing an exam
  const handleEditExam = async () => {
    if (!selectedExam) return;

    try {
      setLoading(true);

      // Prepare update data
      const updateData: {
        title: string;
        description: string;
        duration: number;
        examType: string;
        isAnytime: boolean;
        startDate: Date | null;
        endDate: Date | null;
        categoryId: string | null;
        subcategoryId: string | null;
        updatedAt: Date;
        thumbnailUrl?: string;
      } = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        examType: formData.examType,
        isAnytime: formData.isAnytime,
        startDate: formData.isAnytime ? null : (formData.startDate ? new Date(formData.startDate) : null),
        endDate: formData.isAnytime ? null : (formData.endDate ? new Date(formData.endDate) : null),
        categoryId: formData.categoryId || null,
        subcategoryId: formData.subcategoryId || null,
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
        }
      }

      // Update exam document
      const examRef = doc(db, "exams", selectedExam.id);
      await updateDoc(examRef, updateData);

      // Process new/updated subjects
      // Process each subject in the form
      const processSubjectPromises = formData.subjects.map(async (subject) => {
        // Skip empty subject names
        if (!subject.name.trim()) return;
        
        // If the subject already has an ID, it's already been processed
        if (subject.id) {
          // We only need to update existing subjects if they were edited
          return updateDoc(doc(db, "subjects", subject.id), {
            name: subject.name,
            language: subject.language || "english",
            updatedAt: new Date()
          });
        } else {
          // Create new subject
          return addDoc(collection(db, "subjects"), {
            examId: selectedExam.id,
            name: subject.name,
            language: subject.language || "english",
            totalQuestions: 0,
            totalMarks: 0,
            createdAt: new Date()
          });
        }
      });
      
      // Execute all promises
      await Promise.all(processSubjectPromises.filter(Boolean));

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

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size exceeds 2MB limit",
          variant: "destructive",
        });
        return;
      }
      
      setThumbnailFile(file);
    }
  };

  // Upload thumbnail to Firebase Storage
  const uploadThumbnail = async (examId: string): Promise<string | null> => {
    if (!thumbnailFile) return null;
    
    try {
      setUploadingThumbnail(true);
      
      // Create a storage reference
      const storageRef = ref(storage, `exam-thumbnails/${examId}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, thumbnailFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      throw error;
    } finally {
      setUploadingThumbnail(false);
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

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Render exam card for grid view
  const renderExamCard = (exam: any) => {
    const examStatus = getExamStatus(exam);
    const participantCount = participantsCount[exam.id] || 0;
    
    return (
      <Card key={exam.id}>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle className="truncate">{exam.title}</CardTitle>
            <div className="flex space-x-1">
              <ExamStatusBadge status={examStatus} isActive={exam.isActive} />
              {exam.isResultReleased && (
                <Badge className="bg-blue-100 text-blue-800">Results Released</Badge>
              )}
              {exam.rewardsDistributed && (
                <Badge className="bg-green-100 text-green-800">
                  <Trophy className="h-3 w-3 mr-1" /> Rewards Distributed
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="line-clamp-2">{exam.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm">{exam.duration} minutes</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm">
                {formatDisplayDate(exam.startDate, exam.isAnytime)} - {formatDisplayDate(exam.endDate, exam.isAnytime)}
              </span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm">{participantCount} participants</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id={`active-${exam.id}`} 
                checked={exam.isActive}
                onCheckedChange={() => handleActivateExam(exam)}
              />
              <Label htmlFor={`active-${exam.id}`} className="text-sm">
                {exam.isActive ? "Active" : "Inactive"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id={`results-${exam.id}`} 
                checked={exam.isResultReleased}
                onCheckedChange={() => handleReleaseResults(exam)}
              />
              <Label htmlFor={`results-${exam.id}`} className="text-sm">
                {exam.isResultReleased ? "Results Visible" : "Results Hidden"}
              </Label>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => prepareExamForEdit(exam)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1" 
            onClick={() => router.push(`/exams/${exam.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" /> View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1" 
            onClick={() => {
              setSelectedExamForRewards(exam);
              loadExamToppers(exam.id);
              setShowRewardsDialog(true);
            }}
            title={exam.rewardsDistributed ? "Rewards already distributed" : "Manage rewards"}
            disabled={exam.rewardsDistributed}
          >
            {exam.rewardsDistributed ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" /> Distributed
              </>
            ) : (
              <>
                <Award className="mr-2 h-4 w-4" /> Rewards
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1" 
            onClick={() => showConfirm(exam, 'delete')}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // Render exam row for table view
  const renderExamRow = (exam: any) => {
    const examStatus = getExamStatus(exam);
    const participantCount = participantsCount[exam.id] || 0;
    
    return (
      <TableRow key={exam.id}>
        <TableCell className="font-medium">
          <div className="flex flex-col">
            <span>{exam.title}</span>
            {exam.rewardsDistributed && (
              <span className="text-xs text-green-600 mt-1 flex items-center">
                <Trophy className="h-3 w-3 mr-1" /> Rewards Distributed
              </span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <ExamStatusBadge status={examStatus} isActive={exam.isActive} />
        </TableCell>
        <TableCell>
          {formatDisplayDate(exam.startDate, exam.isAnytime)} - {formatDisplayDate(exam.endDate, exam.isAnytime)}
        </TableCell>
        <TableCell>{exam.duration} mins</TableCell>
        <TableCell>{participantCount}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Switch 
              id={`table-active-${exam.id}`} 
              checked={exam.isActive}
              onCheckedChange={() => handleActivateExam(exam)}
            />
            <Label htmlFor={`table-active-${exam.id}`} className="text-sm">
              {exam.isActive ? "Active" : "Inactive"}
            </Label>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Switch 
              id={`table-results-${exam.id}`} 
              checked={exam.isResultReleased}
              onCheckedChange={() => handleReleaseResults(exam)}
            />
            <Label htmlFor={`table-results-${exam.id}`} className="text-sm">
              {exam.isResultReleased ? "Visible" : "Hidden"}
            </Label>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => prepareExamForEdit(exam)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push(`/exams/${exam.id}`)}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant={exam.rewardsDistributed ? "ghost" : "ghost"}
              size="icon"
              onClick={() => {
                setSelectedExamForRewards(exam);
                loadExamToppers(exam.id);
                setShowRewardsDialog(true);
              }}
              className={exam.rewardsDistributed ? "text-green-500" : ""}
              title={exam.rewardsDistributed ? "Rewards already distributed" : "Manage rewards"}
              disabled={exam.rewardsDistributed}
            >
              {exam.rewardsDistributed ? <Check className="h-4 w-4" /> : <Award className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => showConfirm(exam, 'delete')}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };
  
  // Add handleCreateExam function
  const handleCreateExam = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Exam title is required",
          variant: "destructive",
        });
        return;
      }

      // Only validate dates if not anytime
      if (!formData.isAnytime && (!formData.startDate || !formData.endDate)) {
        toast({
          title: "Error",
          description: "Start and end dates are required for scheduled exams",
          variant: "destructive",
        });
        return;
      }

      if (formData.subjects.length === 0 || !formData.subjects[0].name.trim()) {
        toast({
          title: "Error",
          description: "At least one subject is required",
          variant: "destructive",
        });
        return;
      }

      // Prepare exam data
      const examData = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        examType: formData.examType,
        isAnytime: formData.isAnytime,
        startDate: formData.isAnytime ? null : (formData.startDate ? new Date(formData.startDate) : null),
        endDate: formData.isAnytime ? null : (formData.endDate ? new Date(formData.endDate) : null),
        categoryId: formData.categoryId || null,
        subcategoryId: formData.subcategoryId || null,
        isActive: true,
        isCompleted: false,
        isResultReleased: false,
        totalQuestions: 0,
        createdAt: serverTimestamp(),
      };

      // Create the exam document
      const examRef = await addDoc(collection(db, "exams"), examData);

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
            description: "Exam details were updated but thumbnail upload failed",
            variant: "destructive",
          });
        }
      }

      // Create subjects for the exam
      const subjectPromises = formData.subjects
        .filter(subject => subject.name.trim() !== '')
        .map(subject =>
          addDoc(collection(db, "subjects"), {
            examId: examRef.id,
            name: subject.name,
            language: subject.language || "english",
            totalQuestions: 0,
            totalMarks: 0,
            createdAt: serverTimestamp()
          })
        );

      await Promise.all(subjectPromises);

      toast({
        title: "Success",
        description: "Exam created successfully",
      });

      // Reset form and close dialog
      setShowCreateExamDialog(false);
      setFormData({
        title: "",
        description: "",
        duration: 60,
        startDate: "",
        endDate: "",
        subjects: [{ name: "", language: "english" } as Subject],
        thumbnailUrl: "",
        isAnytime: false,
        categoryId: "",
        subcategoryId: "",
        examType: "test-series"
      });
      setThumbnailFile(null);

      // Refresh the exams list
      filterExams();
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

  // Clear form data when edit dialog is closed
  const handleEditDialogChange = (open: boolean) => {
    if (!open) {
      // Reset only after closing
      setTimeout(() => {
        setSelectedExam(null);
        setThumbnailFile(null);
        setFormData({
          title: "",
          description: "",
          duration: 60,
          startDate: "",
          endDate: "",
          subjects: [{ name: "", language: "english" }],
          thumbnailUrl: "",
          isAnytime: false,
          categoryId: "",
          subcategoryId: "",
          examType: "test-series"
        });
      }, 100);
    }
    setShowEditDialog(open);
  };

  // JSON to Exam functionality
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setJsonFile(file);
    setJsonError(null);
    setJsonData(null);
    
    if (!file) return;
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setJsonError("Please select a valid JSON file.");
      return;
    }
    
    setUploadingJson(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonContent = JSON.parse(event.target?.result as string);
        
        if (!jsonContent.questions || !Array.isArray(jsonContent.questions)) {
          throw new Error("Invalid JSON format. Expected 'questions' array not found.");
        }
        
        setJsonData(jsonContent);
        setJsonPreviewStep('preview');
        setJsonError(null);
        
        // Auto-fill exam details from JSON
        const examDetails = jsonContent.examDetails || {};
        const sectionsFromJson = extractSectionsFromJson(jsonContent);
        
        setFormData({
          title: examDetails.title || "",
          description: `Imported from ${examDetails.course || 'Testbook'} - ${examDetails.title || 'Exam'}`,
          duration: examDetails.duration ? Math.floor(examDetails.duration / 60) : 60,
          startDate: "",
          endDate: "",
          subjects: sectionsFromJson,
          thumbnailUrl: "",
          isAnytime: true,
          categoryId: "",
          subcategoryId: "",
          examType: "pyp" // PYP for imported exams
        });
        
      } catch (error: any) {
        setJsonError(error.message || "Failed to parse JSON file");
        setJsonData(null);
      } finally {
        setUploadingJson(false);
      }
    };
    
    reader.onerror = () => {
      setJsonError("Error reading file");
      setUploadingJson(false);
    };
    
    reader.readAsText(file);
  };

  // Topic mapping functionality
  const handleTopicFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setTopicFile(file);
    setTopicError(null);
    setTopicData(null);
    
    if (!file) return;
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setTopicError("Please select a valid JSON file.");
      return;
    }
    
    setUploadingTopics(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const topicContent = JSON.parse(event.target?.result as string);
        
        if (!topicContent.questionsInOrder || !Array.isArray(topicContent.questionsInOrder)) {
          throw new Error("Invalid JSON format. Expected 'questionsInOrder' array not found.");
        }
        
        setTopicData(topicContent);
        setTopicError(null);
        
        toast({
          title: "Success", 
          description: `Loaded topic mapping for ${topicContent.questionsInOrder.length} questions`
        });
        
      } catch (error: any) {
        setTopicError(error.message || "Failed to parse topic JSON file");
        setTopicData(null);
      } finally {
        setUploadingTopics(false);
      }
    };
    
    reader.onerror = () => {
      setTopicError("Error reading topic file");
      setUploadingTopics(false);
    };
    
    reader.readAsText(file);
  };

  // Handle JSON dialog close and reset all states
  const handleJsonDialogClose = (open: boolean) => {
    if (!open) {
      // Reset all JSON-related states
      setJsonData(null);
      setJsonFile(null);
      setJsonError(null);
      setTopicData(null);
      setTopicFile(null);
      setTopicError(null);
      setJsonPreviewStep('upload');
      setUploadingJson(false);
      setUploadingTopics(false);
    }
    setShowJsonToExamDialog(open);
  };

  // Update questions with topic information
  const updateQuestionsWithTopics = async (examId: string) => {
    if (!topicData || !topicData.questionsInOrder) {
      throw new Error("No topic data available");
    }

    console.log(`🏷️ Updating questions with topic information...`);
    
    try {
      // Get all questions for this exam
      const questionsQuery = query(
        collection(db, "questions"), 
        where("examId", "==", examId)
      );
      const questionsSnapshot = await getDocs(questionsQuery);
      
      // Create mapping from questionId to topic info - only extract topic names
      const topicMapping: {[questionId: string]: any} = {};
      topicData.questionsInOrder.forEach((topicItem: any) => {
        topicMapping[topicItem.questionId] = {
          topicName: topicItem.topicName,
          questionNo: topicItem.questionNo,
          sectionNo: topicItem.sectionNo,
          questionNoInSection: topicItem.questionNoInSection
        };
      });

      // Update questions in batches
      const batchSize = 25;
      const questionsData = questionsSnapshot.docs;
      let updatedCount = 0;
      
      for (let i = 0; i < questionsData.length; i += batchSize) {
        const batch = questionsData.slice(i, i + batchSize);
        
        const updatePromises = batch.map(async (questionDoc) => {
          const questionData = questionDoc.data();
          const originalQuestionId = questionData.extractorMetadata?.originalQuestionId;
          
          if (originalQuestionId && topicMapping[originalQuestionId]) {
            const topicInfo = topicMapping[originalQuestionId];
            
            await updateDoc(questionDoc.ref, {
              topic: topicInfo.topicName,
              chapter: topicInfo.topicName, // Also store as chapter for compatibility
              topicMetadata: {
                topicName: topicInfo.topicName,
                questionNo: topicInfo.questionNo,
                sectionNo: topicInfo.sectionNo,
                questionNoInSection: topicInfo.questionNoInSection
              }
            });
            
            updatedCount++;
          }
        });
        
        await Promise.all(updatePromises);
        
        // Only log progress every 5 batches or final batch
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(questionsData.length / batchSize);
        if (batchNumber % 5 === 0 || batchNumber === totalBatches) {
          console.log(`✅ Topic update progress: ${updatedCount} questions updated`);
        }
      }
      
      console.log(`🎉 Topic update completed: ${updatedCount} questions updated`);
      return updatedCount;
      
    } catch (error) {
      console.error("❌ Error updating questions with topics:", error);
      throw error;
    }
  };

  const extractSectionsFromJson = (jsonData: any): Subject[] => {
    const sections = new Set<string>();
    
    // Extract unique section titles from questions
    jsonData.questions.forEach((question: any) => {
      if (question.sectionTitle) {
        sections.add(question.sectionTitle);
      }
    });
    
    // Convert to subjects array with bilingual support
    return Array.from(sections).map(sectionName => ({
      name: sectionName,
      language: "both" as const // Support both languages for imported exams
    }));
  };

  const handleCreateExamFromJson = async () => {
    if (!jsonData || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please provide exam title and ensure JSON data is loaded",
        variant: "destructive"
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: "Error", 
        description: "Please select a category for the exam",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create the exam first
      const examData = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        isActive: true,
        isResultReleased: false,
        createdBy: user?.id,
        createdAt: serverTimestamp(),
        maxMarks: calculateMaxMarks(jsonData.questions),
        totalQuestions: jsonData.questions.length,
        thumbnailUrl: formData.thumbnailUrl,
        isAnytime: formData.isAnytime,
        startDate: formData.isAnytime ? null : new Date(formData.startDate),
        endDate: formData.isAnytime ? null : new Date(formData.endDate),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || null,
        examType: formData.examType,
        // Additional metadata from JSON
        importedFrom: "html-extractor",
        originalExamId: jsonData.examDetails?.examId || null,
        originalCourse: jsonData.examDetails?.course || null,
        importDate: serverTimestamp()
      };
      
      const examRef = await addDoc(collection(db, "exams"), examData);
      const examId = examRef.id;
      
      // Create subjects from sections
      const subjectIds: string[] = [];
      for (const subject of formData.subjects) {
        const subjectData = {
          name: subject.name,
          language: subject.language,
          examId: examId,
          createdAt: serverTimestamp(),
          // Add section metadata
          isImported: true,
          questionCount: jsonData.questions.filter((q: any) => q.sectionTitle === subject.name).length
        };
        
        const subjectRef = await addDoc(collection(db, "subjects"), subjectData);
        subjectIds.push(subjectRef.id);
      }
      
      // Process and upload questions
      await uploadQuestionsFromJson(jsonData, examId, subjectIds);
      
      // Update questions with topic information if available
      let topicUpdateCount = 0;
      if (topicData) {
        try {
          topicUpdateCount = await updateQuestionsWithTopics(examId);
        } catch (error) {
          console.error("Error updating topics:", error);
          // Don't fail the exam creation if topic update fails
        }
      }
      
      toast({
        title: "Success",
        description: topicData 
          ? `Exam "${formData.title}" created successfully with ${jsonData.questions.length} questions and ${topicUpdateCount} topic assignments!`
          : `Exam "${formData.title}" created successfully with ${jsonData.questions.length} questions!`
      });
      
      // Reset states and close dialog
      setShowJsonToExamDialog(false);
      setJsonData(null);
      setJsonFile(null);
      setTopicData(null);
      setTopicFile(null);
      setTopicError(null);
      setJsonPreviewStep('upload');
      setFormData({
        title: "",
        description: "",
        duration: 60,
        startDate: "",
        endDate: "",
        subjects: [{ name: "", language: "english" }],
        thumbnailUrl: "",
        isAnytime: false,
        categoryId: "",
        subcategoryId: "",
        examType: "test-series"
      });
      
      // Refresh exams list
      window.location.reload();
      
    } catch (error: any) {
      console.error("Error creating exam from JSON:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create exam from JSON",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMaxMarks = (questions: any[]): number => {
    return questions.reduce((total, question) => {
      const marks = question.marks || 2;
      return total + marks;
    }, 0);
  };

  const uploadQuestionsFromJson = async (jsonData: any, examId: string, subjectIds: string[]) => {
    // Create subject name to ID mapping
    const subjectMapping: {[sectionName: string]: string} = {};
    formData.subjects.forEach((subject, index) => {
      subjectMapping[subject.name] = subjectIds[index];
    });

    console.log(`🔄 Processing ${jsonData.questions.length} questions for upload...`);
    
    // Process questions using the same logic as in questions page
    const processedQuestions = jsonData.questions.map((item: any, index: number) => {
      // Convert correct answer from letter to index
      let correctAnswerIndex = 0;
      if (item.correctAnswer) {
        const answerLetter = item.correctAnswer.toUpperCase();
        correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(answerLetter);
        if (correctAnswerIndex === -1) correctAnswerIndex = 0;
      }

      // Extract options from HTML format - preserve HTML for MathJax
      const extractOptions = (optionsHTML: any[]) => {
        if (!optionsHTML || !Array.isArray(optionsHTML)) return ['', '', '', ''];
        
        return optionsHTML.map(option => {
          // Return the text directly without removing HTML - MathJax needs it
          return option.text || option.html || '';
        });
      };

      // NO PROCESSING - Return raw HTML for MathJax to handle directly
      const cleanHtml = (html: string) => {
        if (!html) return '';
        // Return exactly as-is - let MathJax handle the math rendering
        return html;
      };

      // Extract image URL from HTML content
      const extractImageUrl = (html: string): string => {
        if (!html) return '';
        const imgRegex = /<img[^>]+src="([^"]+)"/i;
        const match = html.match(imgRegex);
        if (match && match[1]) {
          let src = match[1];
          if (src.startsWith('//storage.googleapis.com')) {
            src = 'https:' + src;
          }
          return src;
        }
        return '';
      };

      // Build question object with Firestore-safe defaults
      const questionData = {
        examId: examId,
        subjectId: subjectMapping[item.sectionTitle] || subjectIds[0], // Fallback to first subject
        createdAt: new Date(),
        
        // Basic question data - with Firestore-safe defaults
        question: cleanHtml(item.english?.questionText || '') || 'Question text not available',
        type: 'single', // Always single for MCQ questions from Testbook
        options: extractOptions(item.english?.optionsText || []).filter(opt => opt.trim() !== '').concat(['', '', '', '']).slice(0, 4),
        correctAnswer: correctAnswerIndex,
        correctAnswers: [], // Always empty array for single-choice questions
        
        // Scoring - ensure numbers not undefined
        marks: Number(item.marks) || 2,
        negativeMark: Math.abs(Number(item.negativeMarks) || 0.5),
        
        // Solutions and explanations - ensure strings not undefined
        explanation: cleanHtml(item.english?.solutionHTML || item.english?.solutionText || '') || '',
        solution: cleanHtml(item.english?.solutionHTML || item.english?.solutionText || '') || '',
        
        // Hindi content - ensure strings not undefined
        questionHindi: cleanHtml(item.hindi?.questionText || '') || '',
        optionsHindi: extractOptions(item.hindi?.optionsText || []).filter(opt => opt.trim() !== '').concat(['', '', '', '']).slice(0, 4),
        explanationHindi: cleanHtml(item.hindi?.solutionHTML || item.hindi?.solutionText || '') || '',
        solutionHindi: cleanHtml(item.hindi?.solutionHTML || item.hindi?.solutionText || '') || '',
        
        // Comprehension passages - ensure strings not undefined
        comprehensionPassage: cleanHtml(item.english?.comprehensionHTML || '') || '',
        comprehensionPassageHindi: cleanHtml(item.hindi?.comprehensionHTML || '') || '',
        
        // Image URLs - ensure strings not undefined
        questionImageUrl: extractImageUrl(item.english?.questionText || '') || '',
        questionImageUrlHindi: extractImageUrl(item.hindi?.questionText || '') || '',
        
        // Metadata - with proper null checks for Firestore
        extractorMetadata: {
          originalQuestionId: item.questionId || '',
          sectionTitle: item.sectionTitle || '',
          questionNo: item.questionNo || 0,
          sectionNo: item.sectionNo || 0,
          extractionStatus: item.extractionStatus || 'unknown',
          // Only include features and properties if they contain actual data
          ...(item.features && Object.keys(item.features).length > 0 && { features: item.features }),
          ...(item.properties && Object.keys(item.properties).length > 0 && { properties: item.properties })
        }
      };

      // Remove any undefined values recursively and validate data
      const cleanedData = JSON.parse(JSON.stringify(questionData, (key, value) => {
        if (value === undefined) return null;
        if (value === null) return '';
        return value;
      }));

      // Final validation - log any potential issues
      if (!cleanedData.question || cleanedData.question.trim() === '') {
        console.warn(`⚠️ Question ${item.questionNo}: Empty question text`);
      }
      
      if (!cleanedData.options || (cleanedData.options as string[]).filter(opt => opt.trim() !== '').length < 2) {
        console.warn(`⚠️ Question ${item.questionNo}: Insufficient options`);
      }

      return cleanedData;
    });

    // Upload questions in batches
    const batchSize = 25;
    console.log(`📤 Uploading ${processedQuestions.length} questions...`);
    
    for (let i = 0; i < processedQuestions.length; i += batchSize) {
      const batch = processedQuestions.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(processedQuestions.length / batchSize);
      
      try {
        // Upload batch without individual question logs
        for (const question of batch) {
          await addDoc(collection(db, "questions"), question);
        }
        
        // Only log every 10th batch or final batch
        if (batchNumber % 10 === 0 || batchNumber === totalBatches) {
          console.log(`✅ Uploaded ${Math.min(i + batchSize, processedQuestions.length)}/${processedQuestions.length} questions`);
        }
        
      } catch (error) {
        console.error(`❌ Error in batch ${batchNumber}:`, error);
        throw error;
      }
    }
    
    console.log(`🎉 Upload completed: ${processedQuestions.length} questions`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Manage Exams</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowJsonToExamDialog(true)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" /> JSON to Exam
          </Button>
        <Button onClick={() => setShowCreateExamDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create New Exam
        </Button>
        </div>
      </div>
      
      <div className="bg-muted rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search exams..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-md">
              <Button 
                variant={viewMode === "grid" ? "secondary" : "ghost"} 
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "table" ? "secondary" : "ghost"} 
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Exams</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="released">Results Released</TabsTrigger>
          <TabsTrigger value="unreleased">Results Pending</TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center">
            <Trophy className="mr-1 h-4 w-4" />
            Rewards
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredExams.length === 0 ? (
        <div className="text-center p-12 border rounded-lg">
          <p className="text-lg font-medium mb-2">No exams found</p>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? "Try adjusting your search or filters." : "Create your first exam to get started."}
          </p>
          <Button onClick={() => setShowCreateExamDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create New Exam
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map(renderExamCard)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map(renderExamRow)}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {confirmationContent && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmationContent.title}</DialogTitle>
              <DialogDescription>{confirmationContent.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant={actionType === 'delete' ? 'destructive' : 'default'} 
                onClick={handleConfirmAction}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Rewards Dialog */}
      <Dialog open={showRewardsDialog} onOpenChange={setShowRewardsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Exam Rewards</DialogTitle>
            <DialogDescription>
              {selectedExamForRewards ? 
                `Distribute rewards for ${selectedExamForRewards.title}` : 
                'Select an exam to distribute rewards'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedExamForRewards ? (
            <ScrollArea className="max-h-[60vh]">
              <div>
                {loadingToppers ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : examToppers.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No completed attempts found for this exam
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">Top Performers</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter the reward amount for each participant. Leave blank or enter 0 for no reward.
                      </p>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Reward (₹)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {examToppers.slice(0, 10).map((topper) => (
                            <TableRow key={topper.userId}>
                              <TableCell className="flex items-center gap-2 font-medium">
                                {getRewardIcon(topper.rank)}
                                {topper.rank}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={topper.photoURL} />
                                    <AvatarFallback>{topper.userName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{topper.userName}</p>
                                    <p className="text-xs text-muted-foreground">{topper.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{topper.score.toFixed(1)}%</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  value={rewardAmounts[topper.userId] || ""}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    setRewardAmounts({
                                      ...rewardAmounts,
                                      [topper.userId]: value
                                    });
                                  }}
                                  className="w-24 text-right ml-auto"
                                  min="0"
                                  step="10"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md mb-6">
                      <p className="font-medium">Note:</p>
                      <ul className="list-disc ml-4 mt-1 space-y-1">
                        <li>Rewards will be marked as "pending" until they are claimed by students</li>
                        <li>Students must have bank details or UPI information in their profile to receive payments</li>
                        <li>The final reward values can be adjusted before distribution</li>
                      </ul>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setShowRewardsDialog(false)}>
                    Cancel
                  </Button>
                  {rewardsDistributed ? (
                    <Button variant="outline" disabled className="gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Already Distributed
                    </Button>
                  ) : (
                    <Button 
                      onClick={distributeRewards} 
                      disabled={loading || loadingToppers || examToppers.length === 0}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Distribute Rewards
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Please select an exam to manage rewards
            </div>
          )}
          
          {rewardsDistributed && selectedExamForRewards && (
            <div className="py-3 px-4 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center text-green-700 dark:text-green-400">
                <Check className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Rewards Already Distributed</h3>
              </div>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                Rewards for this exam have already been distributed. You can view the distribution details but cannot modify them.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-green-600/80 dark:text-green-500/80">
                {selectedExamForRewards.rewardsDistributedAt && (
                  <div>
                    <span className="font-medium">Date:</span> {formatDisplayDate(selectedExamForRewards.rewardsDistributedAt)}
                  </div>
                )}
                {selectedExamForRewards.totalRewardsDistributed !== undefined && (
                  <div>
                    <span className="font-medium">Total Amount:</span> ₹{selectedExamForRewards.totalRewardsDistributed}
                  </div>
                )}
                {selectedExamForRewards.rewardsDistributionSummary?.totalRewarded !== undefined && (
                  <div>
                    <span className="font-medium">Recipients:</span> {selectedExamForRewards.rewardsDistributionSummary.totalRewarded} students
                  </div>
                )}
                {selectedExamForRewards.distributedBy && (
                  <div>
                    <span className="font-medium">Distributed by:</span> Admin
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleEditDialogChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>Update the exam details.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-4 py-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              {/* Exam Type Selection */}
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <RadioGroup
                  value={formData.examType}
                  onValueChange={(value) => setFormData({ ...formData, examType: value })}
                  className="flex flex-row space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="test-series" id="edit-test-series" />
                    <Label htmlFor="edit-test-series">Test Series</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pyp" id="edit-pyp" />
                    <Label htmlFor="edit-pyp">PYP (Previous Year Paper)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </div>
              
              {/* Anytime Option */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-anytime"
                    checked={formData.isAnytime}
                    onCheckedChange={(checked) => {
                      setFormData({ 
                        ...formData, 
                        isAnytime: checked,
                        // Clear dates when switching to anytime
                        startDate: checked ? "" : formData.startDate,
                        endDate: checked ? "" : formData.endDate
                      });
                    }}
                  />
                  <Label htmlFor="edit-anytime">Available Anytime</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, users can take this exam at any time without date restrictions
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-thumbnail">Thumbnail Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="flex-1"
                  />
                  {uploadingThumbnail && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 16:9 aspect ratio, max 2MB
                </p>
                {renderThumbnailPreview(formData.thumbnailUrl)}
              </div>
              
                             {/* Category Selection */}
               <div className="space-y-2">
                 <Label htmlFor="edit-category">Category</Label>
                 <Select
                   value={formData.categoryId}
                   onValueChange={(value) => {
                     setFormData({ 
                       ...formData, 
                       categoryId: value,
                       subcategoryId: "" // Reset subcategory when category changes
                     });
                   }}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select a category" />
                   </SelectTrigger>
                   <SelectContent>
                     {categories
                       .filter(cat => (cat as any).type === 'main')
                       .map(category => (
                         <SelectItem key={category.id} value={category.id}>
                           {category.name}
                         </SelectItem>
                       ))}
                   </SelectContent>
                 </Select>
               </div>

               {/* Subcategory Selection */}
               {formData.categoryId && (
                 <div className="space-y-2">
                   <Label htmlFor="edit-subcategory">Subcategory (Optional)</Label>
                   <Select
                     value={formData.subcategoryId}
                     onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select a subcategory" />
                     </SelectTrigger>
                     <SelectContent>
                       {categories
                         .filter(cat => (cat as any).type === 'sub' && (cat as any).parentCategoryId === formData.categoryId)
                         .map(subcategory => (
                           <SelectItem key={subcategory.id} value={subcategory.id}>
                             {subcategory.name}
                           </SelectItem>
                         ))}
                     </SelectContent>
                   </Select>
                 </div>
               )}
              
              {!formData.isAnytime && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-startDate">Start Date</Label>
                    <Input
                      id="edit-startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-endDate">End Date</Label>
                    <Input
                      id="edit-endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Subjects</Label>
                {formData.subjects.map((subject, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={subject.name}
                      onChange={(e) => {
                        const updatedSubjects = [...formData.subjects];
                        updatedSubjects[index].name = e.target.value;
                        setFormData({ ...formData, subjects: updatedSubjects });
                      }}
                      placeholder="Subject name"
                      className="flex-1"
                    />
                    <Select
                      value={subject.language || "english"}
                      onValueChange={(value: "english" | "hindi" | "both") => {
                        const updatedSubjects = [...formData.subjects];
                        updatedSubjects[index].language = value;
                        setFormData({ ...formData, subjects: updatedSubjects });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        // Use the new handler function
                        handleSubjectRemoval(subject.id, subject.name, index);
                      }}
                      disabled={formData.subjects.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      subjects: [...formData.subjects, { name: "", language: "english" }]
                    });
                  }}
                >
                  Add Subject
                </Button>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-4 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditExam} disabled={loading || uploadingThumbnail}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Exam Dialog */}
      <Dialog open={showCreateExamDialog} onOpenChange={setShowCreateExamDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <DialogDescription>Create a new exam with subjects.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-4 py-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="create-title">Title</Label>
                <Input
                  id="create-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter exam title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Input
                  id="create-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter exam description"
                />
              </div>
              
              {/* Exam Type Selection */}
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <RadioGroup
                  value={formData.examType}
                  onValueChange={(value) => setFormData({ ...formData, examType: value })}
                  className="flex flex-row space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="test-series" id="create-test-series" />
                    <Label htmlFor="create-test-series">Test Series</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pyp" id="create-pyp" />
                    <Label htmlFor="create-pyp">PYP (Previous Year Paper)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-duration">Duration (minutes)</Label>
                <Input
                  id="create-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  placeholder="60"
                />
              </div>
              
              {/* Anytime Option */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-anytime"
                    checked={formData.isAnytime}
                    onCheckedChange={(checked) => {
                      setFormData({ 
                        ...formData, 
                        isAnytime: checked,
                        // Clear dates when switching to anytime
                        startDate: checked ? "" : formData.startDate,
                        endDate: checked ? "" : formData.endDate
                      });
                    }}
                  />
                  <Label htmlFor="create-anytime">Available Anytime</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, users can take this exam at any time without date restrictions
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-thumbnail">Thumbnail Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="create-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="flex-1"
                  />
                  {uploadingThumbnail && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 16:9 aspect ratio, max 2MB
                </p>
                {renderThumbnailPreview()}
              </div>
              
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="create-category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    setFormData({ 
                      ...formData, 
                      categoryId: value,
                      subcategoryId: "" // Reset subcategory when category changes
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => (cat as any).type === 'main')
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory Selection */}
              {formData.categoryId && (
                <div className="space-y-2">
                  <Label htmlFor="create-subcategory">Subcategory (Optional)</Label>
                  <Select
                    value={formData.subcategoryId}
                    onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => (cat as any).type === 'sub' && (cat as any).parentCategoryId === formData.categoryId)
                        .map(subcategory => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {!formData.isAnytime && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="create-startDate">Start Date</Label>
                    <Input
                      id="create-startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-endDate">End Date</Label>
                    <Input
                      id="create-endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Subjects</Label>
                {formData.subjects.map((subject, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={subject.name}
                      onChange={(e) => {
                        const updatedSubjects = [...formData.subjects];
                        updatedSubjects[index].name = e.target.value;
                        setFormData({ ...formData, subjects: updatedSubjects });
                      }}
                      placeholder="Subject name"
                      className="flex-1"
                    />
                    <Select
                      value={subject.language || "english"}
                      onValueChange={(value: "english" | "hindi" | "both") => {
                        const updatedSubjects = [...formData.subjects];
                        updatedSubjects[index].language = value;
                        setFormData({ ...formData, subjects: updatedSubjects });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        // Use the new handler function
                        handleSubjectRemoval(subject.id, subject.name, index);
                      }}
                      disabled={formData.subjects.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      subjects: [...formData.subjects, { name: "", language: "english" }]
                    });
                  }}
                >
                  Add Subject
                </Button>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-4 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateExam} disabled={loading || uploadingThumbnail}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : "Create Exam"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* JSON to Exam Dialog */}
      <Dialog open={showJsonToExamDialog} onOpenChange={handleJsonDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Create Exam from JSON</DialogTitle>
            <DialogDescription>
              Import exam data from HTML Extractor JSON files. Upload a JSON file to automatically create an exam with questions and subjects.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {jsonPreviewStep === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Upload JSON File</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a JSON file generated by the Ultimate HTML Testbook Extractor
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleJsonFileUpload}
                    className="mt-4 max-w-sm mx-auto"
                    disabled={uploadingJson}
                  />
                  {uploadingJson && (
                    <div className="flex items-center justify-center mt-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Processing JSON file...</span>
                    </div>
                  )}
                </div>

                {jsonError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{jsonError}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Supported JSON Format</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload JSON files from the Ultimate HTML Testbook Extractor with the following features:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      <span>Complete exam metadata</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      <span>Bilingual questions (EN/HI)</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      <span>HTML content preservation</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      <span>Automatic subject creation</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      <span>Solution explanations</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      <span>Comprehensive metadata</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {jsonPreviewStep === 'preview' && jsonData && (
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">JSON File Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Exam Title:</span>
                      <div className="text-muted-foreground">{jsonData.examDetails?.title || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Course:</span>
                      <div className="text-muted-foreground">{jsonData.examDetails?.course || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Total Questions:</span>
                      <div className="text-muted-foreground">{jsonData.questions?.length || 0}</div>
                    </div>
                    <div>
                      <span className="font-medium">Sections:</span>
                      <div className="text-muted-foreground">{jsonData.examDetails?.totalSections || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Detected Sections (Will become Subjects)</h3>
                  <div className="grid gap-2">
                    {formData.subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                        <div>
                          <span className="font-medium">{subject.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({jsonData.questions.filter((q: any) => q.sectionTitle === subject.name).length} questions)
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subject.language === 'both' ? 'English + Hindi' : subject.language}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Question Preview (First 3 Questions)</h3>
                  <div className="space-y-3">
                    {jsonData.questions.slice(0, 3).map((question: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 bg-background">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Q{question.questionNo}: {question.sectionTitle}</div>
                          <div className="text-sm text-muted-foreground">Answer: {question.correctAnswer}</div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <QuestionMath 
                            content={question.english?.questionText?.substring(0, 150) + '...' || 'No preview available'} 
                            className="text-sm"
                          />
                        </div>
                        <div className="flex gap-3 text-xs">
                          <span className={question.hindi?.questionText ? "text-green-600" : "text-muted-foreground"}>
                            {question.hindi?.questionText ? "✓" : "✗"} Hindi
                          </span>
                          <span className={question.english?.comprehensionHTML ? "text-green-600" : "text-muted-foreground"}>
                            {question.english?.comprehensionHTML ? "✓" : "✗"} Comprehension
                          </span>
                          <span className="text-muted-foreground">
                            {question.properties?.scoring?.posMarks || 2} marks
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setJsonPreviewStep('upload');
                      setJsonData(null);
                      setJsonFile(null);
                    }}
                  >
                    Upload Different File
                  </Button>
                  <Button onClick={() => setJsonPreviewStep('edit')}>
                    Continue to Edit Details
                  </Button>
                </div>
              </div>
            )}

            {jsonPreviewStep === 'edit' && jsonData && (
              <div className="space-y-4">
                <h3 className="font-medium mb-4">Edit Exam Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="json-title">Exam Title</Label>
                    <Input
                      id="json-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter exam title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="json-duration">Duration (minutes)</Label>
                    <Input
                      id="json-duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="json-description">Description</Label>
                  <Input
                    id="json-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter exam description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="json-category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => {
                        setFormData({ 
                          ...formData, 
                          categoryId: value,
                          subcategoryId: "" 
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(cat => (cat as any).type === 'main')
                          .map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.categoryId && (
                    <div className="space-y-2">
                      <Label htmlFor="json-subcategory">Subcategory (Optional)</Label>
                      <Select
                        value={formData.subcategoryId}
                        onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter(cat => (cat as any).type === 'sub' && (cat as any).parentCategoryId === formData.categoryId)
                            .map(subcategory => (
                              <SelectItem key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Exam Type</Label>
                  <RadioGroup
                    value={formData.examType}
                    onValueChange={(value) => setFormData({ ...formData, examType: value })}
                    className="flex flex-row space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="test-series" id="json-test-series" />
                      <Label htmlFor="json-test-series">Test Series</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pyp" id="json-pyp" />
                      <Label htmlFor="json-pyp">PYP (Previous Year Paper)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Subjects (Auto-generated from JSON sections)</Label>
                  <div className="space-y-2">
                    {formData.subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="font-medium">{subject.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({jsonData.questions.filter((q: any) => q.sectionTitle === subject.name).length} questions)
                          </span>
                        </div>
                        <div className="text-sm">
                          Language: {subject.language === 'both' ? 'English + Hindi' : subject.language}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This will create an exam with {jsonData.questions.length} questions across {formData.subjects.length} subjects. 
                    All questions will include both English and Hindi content where available.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setJsonPreviewStep('preview')}
                  >
                    Back to Preview
                  </Button>
                  <Button 
                    onClick={() => setJsonPreviewStep('topics')} 
                    disabled={!formData.title.trim() || !formData.categoryId}
                  >
                    Next: Upload Topics
                  </Button>
                </div>
              </div>
            )}

            {jsonPreviewStep === 'topics' && jsonData && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="font-medium text-lg mb-2">Upload Question Topics</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a topic mapping JSON file to assign topics to all {jsonData.questions.length} questions
                  </p>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <div className="text-center space-y-2">
                    <h4 className="font-medium">Upload Topic Mapping JSON</h4>
                    <p className="text-xs text-muted-foreground">
                      Select the questions_ordered_with_topics JSON file
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleTopicFileUpload}
                    className="mt-3 max-w-sm mx-auto"
                    disabled={uploadingTopics}
                  />
                  {uploadingTopics && (
                    <div className="flex items-center justify-center mt-3">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Processing topic file...</span>
                    </div>
                  )}
                </div>

                {topicError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{topicError}</AlertDescription>
                  </Alert>
                )}

                {topicData && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        <h4 className="font-medium text-green-800">Topic Mapping Loaded Successfully</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-700">
                        <div>
                          <span className="font-medium">Total Questions:</span>
                          <div>{topicData.questionsInOrder?.length || 0}</div>
                        </div>
                        <div>
                          <span className="font-medium">Total Topics:</span>
                          <div>{topicData.metadata?.totalTopics || 0}</div>
                        </div>
                        <div>
                          <span className="font-medium">Sections:</span>
                          <div>{new Set(topicData.questionsInOrder?.map((q: any) => q.sectionTitle)).size || 0}</div>
                        </div>
                        <div>
                          <span className="font-medium">Format:</span>
                          <div>{topicData.metadata?.format || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Topic Preview (First 5 & Last 5 Questions)</h4>
                      
                      {/* First 5 Questions */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-blue-600">First 5 Questions:</h5>
                        <div className="grid gap-2">
                          {topicData.questionsInOrder?.slice(0, 5).map((q: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded text-sm">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">Q{q.questionNo}</Badge>
                                <span className="font-medium">{q.topicName}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {q.sectionTitle} • Section {q.sectionNo}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Last 5 Questions */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-blue-600">Last 5 Questions:</h5>
                        <div className="grid gap-2">
                          {topicData.questionsInOrder?.slice(-5).map((q: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded text-sm">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">Q{q.questionNo}</Badge>
                                <span className="font-medium">{q.topicName}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {q.sectionTitle} • Section {q.sectionNo}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setJsonPreviewStep('edit')}
                  >
                    Back to Edit
                  </Button>
                  <Button 
                    onClick={handleCreateExamFromJson} 
                    disabled={loading || !topicData}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating Exam...
                      </>
                    ) : (
                      `Create Exam with Topics (${jsonData.questions.length} questions)`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => handleJsonDialogClose(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 