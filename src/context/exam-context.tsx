"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config";
import type { Category } from "@/types/category";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  Timestamp,
  onSnapshot,
  limit,
  deleteDoc,
  deleteField
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type User as FirebaseUser,
  updatePassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { calculateMarks } from "@/lib/exam-utils";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string
  name: string
  email?: string
  phoneNumber?: string
  photoURL?: string
  createdAt: Date
  isAdmin: boolean
}

type Subject = {
  id: string
  examId: string
  name: string
  totalQuestions: number
  totalMarks: number
  language: "english" | "hindi" | "both"
}

type Exam = {
  id: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  isActive: boolean
  startDate: Date | null
  endDate: Date | null
  isCompleted: boolean
  isResultReleased: boolean
  subjects: Subject[]
  thumbnailUrl?: string
  rewardsDistributed?: boolean
  rewardsDistributedAt?: any
  categoryId?: string
  category?: Category
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
}

type Question = {
  id: string
  examId: string
  subjectId: string
  question: string
  options: string[]
  correctAnswer: number
  correctAnswers?: number[]
  type: "single" | "multiple" | "integer"
  explanation?: string
  imageUrl?: string
  youtubeUrl?: string
  marks: number
  negativeMark: number
  questionHindi?: string
  optionsHindi?: string[]
  explanationHindi?: string
  // Solution fields for both languages
  solution?: string
  solutionHindi?: string
  // Image fields for both languages
  questionImageUrl?: string
  questionImageUrlHindi?: string
}

type UserAnswer = {
  questionId: string
  answer: number[]
  marksEarned: number
  status?: string
}

type ExamAttempt = {
  id: string
  examId: string
  userId: string
  startTime: Date
  endTime?: Date
  isSubmitted: boolean
  score?: number
  totalMarks?: number
  answers: UserAnswer[]
  questionStatus?: Record<string, string>
}

type Ranking = {
  userId: string
  userName: string
  examId: string
  score: number
  rank: number
}

type ExamContextType = {
  user: User | null
  exams: Exam[]
  categories: Category[]
  currentExam: Exam | null
  currentQuestions: Question[]
  currentAttempt: ExamAttempt | null
  rankings: Ranking[]
  isAttemptingExam: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithPhone: (phoneNumber: string) => Promise<string>
  verifyOTP: (verificationId: string, otp: string) => Promise<boolean>
  resendOTP: (phoneNumber: string) => Promise<string>
  registerWithPhone: (phoneNumber: string, name: string) => Promise<string>
  logout: () => Promise<void>
  registerUser: (name: string, email: string, password: string) => Promise<void>
  startExam: (examId: string) => Promise<void>
  submitAnswer: (questionId: string, answer: number[]) => Promise<void>
  submitExam: () => Promise<void>
  getRankings: (examId: string) => Promise<Ranking[]>
  loading: boolean
  authInitialized: boolean
  isExamCompletedByUser: (examId: string, userId: string) => Promise<boolean>
  checkUserExistsByPhone: (phoneNumber: string) => Promise<boolean>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>
  enable2FA: () => Promise<void>
  verify2FA: (code: string) => Promise<boolean>
  disable2FA: () => Promise<void>
  getConnectedDevices: () => Promise<any[]>
  removeConnectedDevice: (deviceId: string) => Promise<void>
  is2FAEnabled: boolean
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const convertTimestamp = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  if (typeof timestamp === 'number') return new Date(timestamp);
  return null;
};

const examCache = new Map<string, {
  exam: Exam;
  questions: Question[];
  timestamp: number;
}>();

// Increase cache timeout to reduce Firebase operations
const CACHE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const USER_CACHE_KEY = 'PrepForAll-user';
const EXAMS_CACHE_KEY = 'PrepForAll-exams';
const SUBJECTS_CACHE_KEY = 'PrepForAll-subjects';
const LOCAL_ANSWERS_KEY = 'PrepForAll-answers';

// Utility function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Track reCAPTCHA verification attempts
let recaptchaAttempts = 0;
const MAX_RECAPTCHA_ATTEMPTS = 3;
let lastRecaptchaAttempt = 0;
const RECAPTCHA_COOLDOWN = 30000; // 30 seconds cooldown

const setupRecaptcha = async (phoneNumber: string) => {
  try {
    const now = Date.now();

    // Check if we've hit the rate limit recently
    if (recaptchaAttempts >= MAX_RECAPTCHA_ATTEMPTS && (now - lastRecaptchaAttempt) < RECAPTCHA_COOLDOWN) {
      const remainingTime = Math.ceil((RECAPTCHA_COOLDOWN - (now - lastRecaptchaAttempt)) / 1000);
      throw new Error(`Too many verification attempts. Please try again in ${remainingTime} seconds.`);
    }

    // Reset attempts if cooldown has passed
    if ((now - lastRecaptchaAttempt) > RECAPTCHA_COOLDOWN) {
      recaptchaAttempts = 0;
    }

    // Clean up any existing verifier
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Error clearing existing reCAPTCHA:", e);
      }
      delete window.recaptchaVerifier;
    }

    // Clean any existing reCAPTCHA iframes
    const iframes = document.querySelectorAll('iframe[src*="recaptcha"]');
    iframes.forEach(iframe => iframe.remove());

    // Get the reCAPTCHA container
    const container = document.getElementById('recaptcha-container');
    if (!container) {
      throw new Error("reCAPTCHA container not found. Please refresh the page.");
    }

    // Clear container
    container.innerHTML = '';

    // Create new reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => { },
      'expired-callback': () => { }
    });

    await recaptchaVerifier.render();
    window.recaptchaVerifier = recaptchaVerifier;

    // Add a small delay to ensure reCAPTCHA is properly initialized
    await delay(1000);

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      lastRecaptchaAttempt = Date.now();
      recaptchaAttempts++;
      return confirmationResult.verificationId;
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/too-many-requests') {
        recaptchaAttempts = MAX_RECAPTCHA_ATTEMPTS;
        lastRecaptchaAttempt = Date.now();
        throw new Error("Too many verification attempts. Please try again after some time.");
      } else if (error.code === 'auth/captcha-check-failed') {
        throw new Error("reCAPTCHA verification failed. Please refresh the page and try again.");
      } else if (error.code === 'auth/invalid-phone-number') {
        throw new Error("The phone number format is incorrect. Please enter a valid phone number.");
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error in setupRecaptcha:", error);
    // Clean up in case of error
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        // Ignore cleanup errors
      }
      delete window.recaptchaVerifier;
    }
    throw error;
  }
};

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

// Add a timeout wrapper for Firestore operations
const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number = 10000, fallback?: T): Promise<T> => {
  let timeoutId: NodeJS.Timeout;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    console.error('Operation timed out or failed:', error);
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
};

// Retry operation with exponential backoff
const retryOperation = async <T,>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  timeoutMs: number = 10000
): Promise<T> => {
  let lastError: any;
  let currentDelay = initialDelay;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await withTimeout(operation(), timeoutMs);
    } catch (error) {
      console.warn(`Operation attempt ${attempt + 1}/${maxRetries} failed:`, error);
      lastError = error;

      if (attempt < maxRetries - 1) {
        await delay(currentDelay);
        currentDelay *= 1.5; // Exponential backoff
      }
    }
  }

  throw lastError || new Error(`Operation failed after ${maxRetries} attempts`);
};

export function ExamProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isAttemptingExam, setIsAttemptingExam] = useState(false);
  const firestoreListenersRef = useRef<(() => void)[]>([]);
  const authStateChecked = useRef(false);
  const router = useRouter();
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [twoFAStep, setTwoFAStep] = useState<"disabled" | "verify" | "enabled">("disabled");

  const isExamCompletedByUser = useCallback(async (examId: string, userId: string) => {
    if (!userId) return false;

    try {
      const attemptsQuery = query(
        collection(db, "examAttempts"),
        where("examId", "==", examId),
        where("userId", "==", userId),
        where("isSubmitted", "==", true)
      );

      const attemptsSnapshot = await getDocs(attemptsQuery);
      return !attemptsSnapshot.empty;
    } catch (error) {
      console.error("Error checking exam completion:", error);
      return false;
    }
  }, []);

  const checkAuthState = useCallback(async (firebaseUser: FirebaseUser | null) => {
    try {
      if (!firebaseUser) {
        firestoreListenersRef.current.forEach(unsubscribe => unsubscribe());
        firestoreListenersRef.current = [];

        setUser(null);
        setExams([]);
        setCategories([]);
        setRankings([]);
        setCurrentExam(null);
        setCurrentQuestions([]);
        setCurrentAttempt(null);

        examCache.clear();
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(EXAMS_CACHE_KEY);
      } else {
        const cachedUser = localStorage.getItem(USER_CACHE_KEY);
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            if (userData.id === firebaseUser.uid) {
              setUser(userData);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing cached user:", e);
          }
        }

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const user = {
            id: firebaseUser.uid,
            name: userData.name,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            photoURL: userData.photoURL,
            createdAt: convertTimestamp(userData.createdAt) || new Date(),
            isAdmin: userData.isAdmin || false
          };
          setUser(user);

          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
        }
      }
    } catch (error) {
      console.error("Error in auth state change:", error);
      setUser(null);
    } finally {
      setLoading(false);
      setAuthInitialized(true);
      authStateChecked.current = true;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await checkAuthState(firebaseUser);
    });

    return () => unsubscribe();
  }, [checkAuthState]);

  useEffect(() => {
    if (!user || !authInitialized) return;

    firestoreListenersRef.current.forEach(unsubscribe => unsubscribe());
    firestoreListenersRef.current = [];

    const cachedExams = localStorage.getItem(EXAMS_CACHE_KEY);
    if (cachedExams) {
      try {
        const examsData = JSON.parse(cachedExams);
        setExams(examsData);
      } catch (e) {
        console.error("Error parsing cached exams:", e);
      }
    }

    // Load categories - only when user is fully authenticated
    const unsubscribeCategories = onSnapshot(
      collection(db, "categories"),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;

        const categoriesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            icon: data.icon || '',
            color: data.color || '',
            isActive: data.isActive !== undefined ? data.isActive : true,
            order: data.order || 0,
            ...data,
            createdAt: convertTimestamp(data.createdAt) || new Date(),
            updatedAt: convertTimestamp(data.updatedAt),
            type: data.type || 'main',
            slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || doc.id
          } as Category;
        });

        setCategories(categoriesData.sort((a, b) => a.order - b.order));
      },
      (error) => {
        console.error("Error listening to categories:", error);
        if (error.code === 'permission-denied') {
          console.warn("Permission denied for categories. Please check Firestore security rules.");
          console.warn("Run 'npm run deploy-rules' to deploy security rules, or check TROUBLESHOOTING.md");
        }
        // Set empty array on error to prevent app crash
        setCategories([]);
      }
    );

    const unsubscribeExams = onSnapshot(
      collection(db, "exams"),
      { includeMetadataChanges: true },
      async (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;

        const examsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: convertTimestamp(data.startDate),
            endDate: convertTimestamp(data.endDate)
          };
        }) as Exam[];

        if (user && user.id) {
          const updatedExams = await Promise.all(
            examsData.map(async (exam) => {
              const isCompleted = await isExamCompletedByUser(exam.id, user.id);
              return { ...exam, isCompleted };
            })
          );
          setExams(updatedExams);

          localStorage.setItem(EXAMS_CACHE_KEY, JSON.stringify(updatedExams));
        } else {
          setExams(examsData);
        }

        examsData.forEach(exam => {
          if (examCache.has(exam.id)) {
            examCache.set(exam.id, {
              ...examCache.get(exam.id)!,
              exam,
              timestamp: Date.now()
            });
          }
        });
      },
      (error) => {
        console.error("Error listening to exams:", error);
        if (error.code === 'permission-denied') {
          console.warn("Permission denied for exams. Please check Firestore security rules.");
        }
        // Set empty array on error to prevent app crash
        setExams([]);
      }
    );

    firestoreListenersRef.current.push(unsubscribeExams);
    firestoreListenersRef.current.push(unsubscribeCategories);

    return () => {
      unsubscribeExams();
      unsubscribeCategories();
    };
  }, [user, authInitialized, isExamCompletedByUser]);

  const startExam = useCallback(async (examId: string) => {
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      const isCompleted = await isExamCompletedByUser(examId, user.id);
      if (isCompleted) {
        router.push(`/results/${examId}`);
        return;
      }

      // Get the exam document first to validate time constraints
      const examDoc = await getDoc(doc(db, "exams", examId));

      if (!examDoc.exists()) {
        throw new Error("Exam not found");
      }

      const examData = examDoc.data();
      const examStartDate = convertTimestamp(examData.startDate);
      const examEndDate = convertTimestamp(examData.endDate);

      if (!examStartDate || !examEndDate) {
        throw new Error("Invalid exam dates");
      }

      const now = new Date();

      // Check if the exam has started
      if (now < examStartDate) {
        throw new Error("Exam has not started yet");
      }

      // Check if the exam has ended
      if (now > examEndDate) {
        throw new Error("Exam has already ended");
      }

      // Calculate grace period end time (3 minutes after exam starts)
      const gracePeriodEnd = new Date(examStartDate);
      gracePeriodEnd.setMinutes(gracePeriodEnd.getMinutes() + 3);

      // Server-side validation: Check if we're past the grace period
      if (now > gracePeriodEnd) {
        throw new Error("The grace period for starting this exam has expired");
      }

      const cached = examCache.get(examId);
      const nowTimestamp = Date.now();

      if (cached && (nowTimestamp - cached.timestamp) < CACHE_TIMEOUT) {
        setCurrentExam(cached.exam);
        setCurrentQuestions(cached.questions);

        const newAttempt: ExamAttempt = {
          id: `attempt-${nowTimestamp}`,
          examId,
          userId: user?.id || "",
          startTime: now,
          isSubmitted: false,
          answers: []
        };

        setCurrentAttempt(newAttempt);
        setIsAttemptingExam(true);

        await setDoc(doc(db, "examAttempts", newAttempt.id), {
          ...newAttempt,
          startTime: Timestamp.fromDate(newAttempt.startTime)
        });
        return;
      }

      const questionsSnapshot = await getDocs(query(collection(db, "questions"), where("examId", "==", examId)));

      if (examDoc.exists()) {
        const examDataWithDates = {
          id: examDoc.id,
          ...examData,
          startDate: examStartDate,
          endDate: examEndDate
        } as Exam;

        const questionsData = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Question[];

        examCache.set(examId, {
          exam: examDataWithDates,
          questions: questionsData,
          timestamp: nowTimestamp
        });

        setCurrentExam(examDataWithDates);
        setCurrentQuestions(questionsData);

        const newAttempt: ExamAttempt = {
          id: `attempt-${nowTimestamp}`,
          examId,
          userId: user?.id || "",
          startTime: now,
          isSubmitted: false,
          answers: []
        };

        setCurrentAttempt(newAttempt);
        setIsAttemptingExam(true);

        await setDoc(doc(db, "examAttempts", newAttempt.id), {
          ...newAttempt,
          startTime: Timestamp.fromDate(newAttempt.startTime)
        });
      } else {
        throw new Error("Exam not found");
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      throw error;
    } finally {
      toast({
        title: "Exam Started",
        description: "The exam has started successfully.",
        variant: "default",
        duration: 5000,
      });
    }
  }, [user, isExamCompletedByUser, router]);

  const submitAnswer = async (questionId: string, answer: number[]) => {
    if (!currentAttempt || !currentQuestions.length) return;

    try {
      const question = currentQuestions.find(q => q.id === questionId);
      if (!question) return;

      const result = calculateMarks(question, answer);

      const updatedAnswers = [...currentAttempt.answers];
      const existingAnswerIndex = updatedAnswers.findIndex(a => a.questionId === questionId);

      if (existingAnswerIndex >= 0) {
        updatedAnswers[existingAnswerIndex] = {
          questionId,
          answer,
          marksEarned: result.marks
        };
      } else {
        updatedAnswers.push({
          questionId,
          answer,
          marksEarned: result.marks
        });
      }

      const updatedAttempt = {
        ...currentAttempt,
        answers: updatedAnswers
      };

      // Store answer in local storage as backup
      const localAnswersKey = `${LOCAL_ANSWERS_KEY}-${currentAttempt.id}`;
      localStorage.setItem(localAnswersKey, JSON.stringify(updatedAnswers));

      // Update Firestore with retry and timeout
      await retryOperation(
        () => updateDoc(doc(db, "examAttempts", currentAttempt.id), {
          answers: updatedAnswers
        }),
        3,  // max retries
        1000, // initial delay
        15000 // timeout
      );

      setCurrentAttempt(updatedAttempt);
    } catch (error) {
      console.error("Error submitting answer:", error);
      // Don't throw, just log - this prevents UI disruption on temporary network issues
    }
  };

  const submitExam = async () => {
    if (!currentAttempt || !currentExam || !currentQuestions.length) return;

    try {
      setLoading(true);

      const totalPossibleMarks = currentQuestions.reduce((total, q) => total + q.marks, 0);

      const totalEarnedMarks = currentAttempt.answers.reduce((total, answer) => total + answer.marksEarned, 0);

      const score = (totalEarnedMarks / totalPossibleMarks) * 100;

      const endTime = new Date();

      // Get question status from localStorage
      const visitedKey = `PrepForAll-visited-${currentAttempt.id}`;
      const reviewKey = `PrepForAll-review-${currentAttempt.id}`;

      let visitedQuestions: string[] = [];
      let reviewQuestions: string[] = [];

      try {
        const visitedData = localStorage.getItem(visitedKey);
        const reviewData = localStorage.getItem(reviewKey);

        if (visitedData) {
          visitedQuestions = JSON.parse(visitedData);
        }

        if (reviewData) {
          reviewQuestions = JSON.parse(reviewData);
        }
      } catch (err) {
        console.error('Error retrieving question status:', err);
      }

      // Enhanced answers with status
      const enhancedAnswers = currentAttempt.answers.map(answer => {
        // Default status is 'answered' for any question with an answer
        let status = 'answered';

        // Override with 'marked-review' if question is in review set
        if (reviewQuestions.includes(answer.questionId)) {
          status = 'marked-review';
        }

        return {
          ...answer,
          status
        };
      });

      // Add visited but not answered questions to the answers array with status
      visitedQuestions.forEach(qId => {
        // Skip if this question already has an answer
        if (enhancedAnswers.some(a => a.questionId === qId)) {
          return;
        }

        // Add a visited-only entry
        enhancedAnswers.push({
          questionId: qId,
          answer: [],
          marksEarned: 0,
          status: reviewQuestions.includes(qId) ? 'marked-review' : 'visited'
        });
      });

      // Add not-visited questions
      currentQuestions.forEach(q => {
        // Skip if this question already has an entry in enhancedAnswers
        if (enhancedAnswers.some(a => a.questionId === q.id)) {
          return;
        }

        // Add a not-attempted entry
        enhancedAnswers.push({
          questionId: q.id,
          answer: [],
          marksEarned: 0,
          status: 'not-attempted'
        });
      });

      const completedAttempt = {
        ...currentAttempt,
        endTime,
        isSubmitted: true,
        score,
        totalMarks: totalEarnedMarks,
        answers: enhancedAnswers
      };

      // Try harder for the final submission
      await retryOperation(
        () => updateDoc(doc(db, "examAttempts", currentAttempt.id), {
          ...completedAttempt,
          endTime: Timestamp.fromDate(endTime)
        }),
        5, // More retries for final submission
        1000,
        30000 // Longer timeout
      );

      // Clear local backup
      const localAnswersKey = `${LOCAL_ANSWERS_KEY}-${currentAttempt.id}`;
      localStorage.removeItem(localAnswersKey);
      localStorage.removeItem(visitedKey);
      localStorage.removeItem(reviewKey);

      setCurrentAttempt(completedAttempt);
      setIsAttemptingExam(false);
      setCurrentExam(null);
      setCurrentQuestions([]);
    } catch (error) {
      console.error("Error submitting exam:", error);
      throw error;
    } finally {
      toast({
        title: "Exam Submitted",
        description: "The exam has been submitted successfully.",
        variant: "default",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  const getRankings = async (examId: string) => {
    try {
      const rankingsSnapshot = await getDocs(query(
        collection(db, "rankings"),
        where("examId", "==", examId)
      ));

      const rankingsData = rankingsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || "",
          userName: data.userName || "",
          examId: data.examId || "",
          score: data.score || 0,
          rank: data.rank || 0,
          ...data
        };
      });

      return rankingsData as Ranking[];
    } catch (error) {
      console.error("Error getting rankings:", error);
      throw error;
    }
  };

  const checkUserExistsByPhone = async (phoneNumber: string): Promise<boolean> => {
    try {
      // Query users collection where phoneNumber matches
      const usersQuery = query(
        collection(db, "users"),
        where("phoneNumber", "==", phoneNumber),
        limit(1)
      );

      const querySnapshot = await getDocs(usersQuery);

      // Return true if at least one user found, false otherwise
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking if user exists:", error);
      throw error;
    }
  };

  const loginWithPhone = useCallback(async (phoneNumber: string) => {
    try {
      // First, check if a user with this phone number exists
      const userExists = await checkUserExistsByPhone(phoneNumber);

      if (!userExists) {
        throw new Error("No account found with this phone number. Please register first.");
      }

      // User exists, proceed with OTP verification
      localStorage.removeItem('pending_phone_user_name');
      localStorage.setItem('is_phone_registration', 'false');
      localStorage.setItem('attempted_phone_number', phoneNumber);
      return await setupRecaptcha(phoneNumber);
    } catch (error: any) {
      console.error("Error in phone login:", error);
      throw error;
    }
  }, []);

  const verifyOTP = useCallback(async (verificationId: string, otp: string) => {
    try {
      if (!window.confirmationResult) {
        throw new Error("No confirmation result found. Please resend OTP.");
      }

      const result = await window.confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      // Check if this is a registration or login flow
      const isRegistration = localStorage.getItem('is_phone_registration') === 'true';
      const pendingName = localStorage.getItem('pending_phone_user_name') || '';
      const attemptedPhoneNumber = localStorage.getItem('attempted_phone_number') || '';

      // Create a retry function for Firebase operations
      const retryOperation = async (operation: Function, maxRetries = 3, delay = 1000) => {
        let lastError;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await operation();
          } catch (error: any) {
            console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}):`, error);
            lastError = error;
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            // Increase delay for next attempt
            delay *= 1.5;
          }
        }
        throw lastError;
      };

      // Check if user document exists
      const userDocRef = doc(db, "users", firebaseUser.uid);

      // Try to get user document with retry logic
      let userData;
      await retryOperation(async () => {
        try {
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // If this is a login attempt but no user document exists
            if (!isRegistration) {
              // Check if user was trying to login with a different phone number
              if (attemptedPhoneNumber && attemptedPhoneNumber !== firebaseUser.phoneNumber) {
                throw new Error(`No account found with phone number ${attemptedPhoneNumber}. Please register first.`);
              } else {
                throw new Error("User account not found. Please register first.");
              }
            }

            // For registration, create the user document
            await setDoc(userDocRef, {
              name: pendingName,
              phoneNumber: firebaseUser.phoneNumber,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              isAdmin: false,
              provider: "phone"
            });
            console.log("Created new user document during registration");
          } else {
            // Update existing user's last login time
            await updateDoc(userDocRef, {
              lastLogin: serverTimestamp()
            });
            console.log("Updated existing user document");
          }
        } catch (error: any) {
          console.error("Error creating/updating user document:", error);
          throw error;
        }
      });

      // Try to get user data with retry logic
      userData = await retryOperation(async () => {
        const updatedUserDoc = await getDoc(userDocRef);
        if (!updatedUserDoc.exists()) {
          throw new Error("User document still not available after creation");
        }
        return updatedUserDoc.data();
      });

      // Create user object
      const user = {
        id: firebaseUser.uid,
        name: userData?.name || pendingName,
        phoneNumber: userData?.phoneNumber || firebaseUser.phoneNumber || "",
        email: userData?.email,
        photoURL: userData?.photoURL,
        createdAt: convertTimestamp(userData?.createdAt) || new Date(),
        isAdmin: userData?.isAdmin || false
      };

      setUser(user);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));

      // Clean up
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn("Error clearing reCAPTCHA verifier:", e);
        }
        delete window.recaptchaVerifier;
      }
      delete window.confirmationResult;
      localStorage.removeItem('pending_phone_user_name');
      localStorage.removeItem('is_phone_registration');
      localStorage.removeItem('attempted_phone_number');

      return true;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  }, []);

  const resendOTP = useCallback(async (phoneNumber: string) => {
    try {
      // For resend, we should respect the cooldown period more strictly
      const now = Date.now();
      if (recaptchaAttempts >= MAX_RECAPTCHA_ATTEMPTS && (now - lastRecaptchaAttempt) < RECAPTCHA_COOLDOWN) {
        const remainingTime = Math.ceil((RECAPTCHA_COOLDOWN - (now - lastRecaptchaAttempt)) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before requesting another OTP.`);
      }

      // Clear existing reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn("Error clearing existing reCAPTCHA:", e);
        }
        delete window.recaptchaVerifier;
      }

      return await setupRecaptcha(phoneNumber);
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      throw error;
    }
  }, []);

  const registerWithPhone = useCallback(async (phoneNumber: string, name: string) => {
    try {
      // Store the name in localStorage for later use during OTP verification
      localStorage.setItem('pending_phone_user_name', name);
      localStorage.setItem('is_phone_registration', 'true');
      return await setupRecaptcha(phoneNumber);
    } catch (error: any) {
      // Pass through the user-friendly error message from setupRecaptcha
      console.error("Error in phone registration:", error);
      throw error;
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Clear existing state
      firestoreListenersRef.current.forEach(unsubscribe => unsubscribe());
      firestoreListenersRef.current = [];
      setExams([]);
      setRankings([]);
      setCurrentExam(null);
      setCurrentQuestions([]);
      setCurrentAttempt(null);
      examCache.clear();

      // Attempt to sign in with Firebase Auth
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authError: any) {
        // Handle Firebase auth-specific errors first
        if (authError.code === 'auth/wrong-password') {
          throw new Error("Incorrect password. Please try again.");
        } else if (authError.code === 'auth/user-not-found') {
          throw new Error("No account found with this email. Please register first.");
        } else if (authError.code === 'auth/too-many-requests') {
          throw new Error("Too many failed login attempts. Please try again later or reset your password.");
        } else if (authError.code === 'auth/invalid-credential') {
          throw new Error("Invalid login credentials. Please check your email and password.");
        } else if (authError.code === 'auth/invalid-email') {
          throw new Error("Invalid email format. Please enter a valid email address.");
        } else {
          console.error("Firebase auth error:", authError);
          throw new Error(authError.message || "Failed to sign in. Please try again.");
        }
      }

      const firebaseUser = userCredential.user;

      // Now check if the user document exists in Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // If user authenticated with Firebase but has no document in Firestore
        // This is an unusual case - we should log the user out
        await signOut(auth);
        throw new Error("Account exists but is not properly set up. Please register or contact support.");
      }

      // User exists, proceed with login
      const userData = userDoc.data();
      setUser({
        id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        photoURL: userData.photoURL,
        createdAt: convertTimestamp(userData.createdAt) || new Date(),
        isAdmin: userData.isAdmin || false
      });

      // Update last login time
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp()
      });
    } catch (error: any) {
      console.error("Login error:", error);
      // Just re-throw the error as we've already handled specific cases
      throw error;
    } finally {
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
        variant: "default",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);

      // Clear existing state
      firestoreListenersRef.current.forEach(unsubscribe => unsubscribe());
      firestoreListenersRef.current = [];
      setExams([]);
      setRankings([]);
      setCurrentExam(null);
      setCurrentQuestions([]);
      setCurrentAttempt(null);
      examCache.clear();

      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      if (!firebaseUser.email) {
        throw new Error("No email provided from Google account");
      }

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // User exists, proceed with login
        const userData = userDoc.data();
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          photoURL: firebaseUser.photoURL || userData.photoURL,
          name: firebaseUser.displayName || userData.name
        });

        setUser({
          id: firebaseUser.uid,
          name: userData.name || firebaseUser.displayName || "",
          email: userData.email || firebaseUser.email,
          phoneNumber: userData.phoneNumber,
          photoURL: userData.photoURL || firebaseUser.photoURL,
          createdAt: convertTimestamp(userData.createdAt) || new Date(),
          isAdmin: userData.isAdmin || false
        });
      } else {
        // No user document found - create new user
        const newUser = {
          name: firebaseUser.displayName || "",
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || "",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          isAdmin: false,
          provider: "google"
        };

        await setDoc(userDocRef, newUser);

        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
          isAdmin: false
        });
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      if (error.code === 'auth/popup-blocked') {
        throw new Error("Popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign in was cancelled.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error("An account already exists with the same email address but different sign-in credentials.");
      } else {
        throw new Error("Failed to sign in with Google. Please try again.");
      }
    } finally {
      toast({
        title: "Google Sign In Successful",
        description: "You have been signed in with Google successfully.",
        variant: "default",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      firestoreListenersRef.current.forEach(unsubscribe => unsubscribe());
      firestoreListenersRef.current = [];

      setExams([]);
      setRankings([]);
      setCurrentExam(null);
      setCurrentQuestions([]);
      setCurrentAttempt(null);

      examCache.clear();

      await signOut(auth);
      setUser(null);
      router.push("/login");
    } finally {
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
        variant: "default",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  const registerUser = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        name,
        email,
        createdAt: serverTimestamp(),
        isAdmin: false
      });

      setUser({
        id: firebaseUser.uid,
        name,
        email,
        createdAt: new Date(),
        isAdmin: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Auth state monitoring
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        setLoading(true);
        setAuthInitialized(true);

        if (authUser) {
          // Fetch user data
          const userRef = doc(db, "users", authUser.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            setUser({ id: authUser.uid, ...docSnap.data() } as User);
          } else {
            // Create user doc if it doesn't exist
            const newUser: User = {
              id: authUser.uid,
              name: authUser.displayName || "User",
              email: authUser.email || "",
              isAdmin: false,
              createdAt: new Date(),
            };

            await setDoc(doc(db, "users", authUser.uid), newUser);
            setUser(newUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error setting up auth:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle shared exam redirect - separate from auth state to prevent race conditions
  useEffect(() => {
    // Only process shared exam redirects when user is authenticated and loaded
    if (user && !loading) {
      const sharedExamId = localStorage.getItem('shared_exam_id');
      if (sharedExamId) {
        // Clear the shared exam ID
        localStorage.removeItem('shared_exam_id');

        // Brief delay to ensure everything is loaded
        setTimeout(() => {
          window.location.href = `/exams/${sharedExamId}`;
        }, 500);
      }
    }
  }, [user, loading]);

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !auth.currentUser?.email) throw new Error("User not authenticated");

    try {
      setLoading(true);

      // Re-authenticate user with current password
      const credentials = await signInWithEmailAndPassword(
        auth,
        auth.currentUser.email,
        currentPassword
      );

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      return { success: true, message: "Password updated successfully" };
    } catch (error: any) {
      console.error("Error changing password:", error);

      if (error.code === 'auth/wrong-password') {
        throw new Error("Current password is incorrect");
      } else {
        throw new Error("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset password with email
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);

      return { success: true, message: "Reset email sent. Check your inbox." };
    } catch (error: any) {
      console.error("Password reset error:", error);

      if (error.code === 'auth/user-not-found') {
        throw new Error("No account found with this email");
      } else {
        throw new Error("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Add generateTwoFASecret and verifyTwoFACode functions
  const generateTwoFASecret = async (userId: string): Promise<{
    success: boolean;
    secret?: string;
    qrCodeUrl?: string;
    error?: string;
  }> => {
    // Mock implementation - would be replaced with actual API call
    try {
      // In a real implementation, this would call a server API
      return {
        success: true,
        secret: "EXAMPLESECRETSAMPLE234",
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/PrepForAll:${userId}?secret=EXAMPLESECRETSAMPLE234&issuer=PrepForAll`
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to generate 2FA secret"
      };
    }
  };

  const verifyTwoFACode = async (userId: string, secret: string, code: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    // Mock implementation - would be replaced with actual verification
    try {
      // In a real implementation, this would validate the OTP code
      const isValid = code.length === 6 && /^\d+$/.test(code);

      return {
        success: isValid,
        error: isValid ? undefined : "Invalid verification code"
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to verify code"
      };
    }
  };

  // Enable 2FA
  const enable2FA = async () => {
    if (!auth.currentUser) return;

    try {
      // Generate QR code secret
      const response = await generateTwoFASecret(auth.currentUser.uid);

      if (response.success && response.secret) {
        setQrCodeUrl(response.qrCodeUrl || "");
        setSecret(response.secret);
        setTwoFAStep("verify");
      } else {
        throw new Error(response.error || "Failed to generate 2FA secret");
      }
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast({
        title: "2FA Setup Failed",
        description: "There was an error setting up two-factor authentication. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      setTwoFAStep("disabled");
    }
  };

  // Verify 2FA code
  const verify2FA = async (code: string) => {
    if (!auth.currentUser || !secret) return false;

    try {
      const response = await verifyTwoFACode(auth.currentUser.uid, secret, code);

      if (response.success) {
        // Update Firestore
        try {
          const userSettingsRef = doc(db, "userSettings", auth.currentUser.uid);
          await setDoc(userSettingsRef, {
            twoFactorEnabled: true,
            twoFactorSecret: secret,
            updatedAt: serverTimestamp()
          }, { merge: true });

          setIs2FAEnabled(true);
          setTwoFAStep("enabled");

          toast({
            title: "2FA Enabled",
            description: "Two-factor authentication has been successfully enabled.",
            variant: "default",
            duration: 5000,
          });

          return true;
        } catch (firestoreError) {
          console.error("Error updating 2FA status in Firestore:", firestoreError);
          throw new Error("Failed to save 2FA settings");
        }
      } else {
        throw new Error(response.error || "Invalid verification code");
      }
    } catch (error: any) {
      console.error("Error verifying 2FA code:", error);

      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
        duration: 5000,
      });

      return false;
    }
  };

  // Disable 2FA
  const disable2FA = async () => {
    if (!auth.currentUser) return;

    try {
      const userSettingsRef = doc(db, "userSettings", auth.currentUser.uid);

      await setDoc(userSettingsRef, {
        twoFactorEnabled: false,
        twoFactorSecret: deleteField(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      setIs2FAEnabled(false);
      setTwoFAStep("disabled");
      setSecret("");
      setQrCodeUrl("");

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
        variant: "default",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error disabling 2FA:", error);

      toast({
        title: "Error Disabling 2FA",
        description: "There was an error disabling two-factor authentication. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Get connected devices
  const getConnectedDevices = async (): Promise<any[]> => {
    if (!user || !auth.currentUser) throw new Error("User not authenticated");

    try {
      setLoading(true);

      // Get devices reference
      const devicesRef = collection(db, "users", auth.currentUser.uid, "devices");
      const snapshot = await getDocs(devicesRef);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Get devices error:", error);
      throw new Error("Failed to retrieve connected devices.");
    } finally {
      setLoading(false);
    }
  };

  // Remove connected device
  const removeConnectedDevice = async (deviceId: string): Promise<void> => {
    if (!user || !auth.currentUser) throw new Error("User not authenticated");

    try {
      setLoading(true);

      // Get device reference
      const deviceRef = doc(db, "users", auth.currentUser.uid, "devices", deviceId);

      // Delete device
      await deleteDoc(deviceRef);
    } catch (error) {
      console.error("Remove device error:", error);
      throw new Error("Failed to remove device. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check 2FA status on login
  useEffect(() => {
    if (user && auth.currentUser) {
      const fetchTwoFAStatus = async () => {
        try {
          const twoFARef = doc(db, "userSettings", auth.currentUser!.uid);

          try {
            const twoFADoc = await getDoc(twoFARef);

            if (twoFADoc.exists()) {
              setIs2FAEnabled(twoFADoc.data()?.twoFactorEnabled || false);
            } else {
              // If the document doesn't exist, create it with default settings
              try {
                await setDoc(twoFARef, {
                  twoFactorEnabled: false,
                  updatedAt: serverTimestamp()
                });
              } catch (createError) {
                console.error("Error creating initial 2FA settings:", createError);
                // Continue even if creation fails - just use the default state
              }
              setIs2FAEnabled(false);
            }
          } catch (firestoreError: any) {
            console.error("Error fetching 2FA status:", firestoreError);

            // Check if this is a permissions error
            if (firestoreError.code === 'permission-denied') {
              console.warn("Permission denied for 2FA settings, using default state");
            }

            // Default to disabled if we can't access the settings
            setIs2FAEnabled(false);
          }
        } catch (error) {
          console.error("Unexpected error in 2FA status check:", error);
          setIs2FAEnabled(false);
        }
      };

      fetchTwoFAStatus();
    }
  }, [user]);

  return (
    <ExamContext.Provider
      value={{
        user,
        exams,
        categories,
        currentExam,
        currentQuestions,
        currentAttempt,
        rankings,
        isAttemptingExam,
        login,
        loginWithGoogle,
        loginWithPhone,
        verifyOTP,
        resendOTP,
        registerWithPhone,
        logout,
        registerUser,
        startExam,
        submitAnswer,
        submitExam,
        getRankings,
        loading,
        authInitialized,
        isExamCompletedByUser,
        checkUserExistsByPhone,
        changePassword,
        resetPassword,
        enable2FA,
        verify2FA,
        disable2FA,
        getConnectedDevices,
        removeConnectedDevice,
        is2FAEnabled
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error("useExam must be used within an ExamProvider");
  }
  return context;
}