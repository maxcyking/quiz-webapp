"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Head from "next/head";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, ChevronLeft, ChevronRight, Clock, RotateCcw, Check, X, MinusCircle, CheckCircle2, XCircle, Maximize, Minimize, Flag } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Subject } from "@/lib/exam-utils";
import { SuccessAnimation } from "@/components/ui/success-animation";
import { useToast } from "@/hooks/use-toast";
import { QuestionMath, OptionMath } from "@/components/ui/math-content";

export default function ExamAttemptPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const { toast } = useToast();
    const { user, currentExam, currentQuestions, currentAttempt, submitAnswer, submitExam } = useExam();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [subjectsLoading, setSubjectsLoading] = useState(false);
    const [subjectsError, setSubjectsError] = useState<string | null>(null);
    const subjectsLoadedRef = useRef(false);
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: number[] }>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSubmitWarning, setShowSubmitWarning] = useState(false);
    const [showRefreshWarning, setShowRefreshWarning] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [tabSwitchAttempts, setTabSwitchAttempts] = useState(0);
    const [navigationAttempts, setNavigationAttempts] = useState(0);
    const [showSecurityNotice, setShowSecurityNotice] = useState(true);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [orientationWarning, setOrientationWarning] = useState(false);
    const [escapeExitAttempts, setEscapeExitAttempts] = useState(0);
    const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
    const [reviewQuestions, setReviewQuestions] = useState<Set<string>>(new Set());
    const [selectedLanguage, setSelectedLanguage] = useState<"english" | "hindi">("english");
    const shouldSubmitRef = useRef(false);
    const maximumNavigationAttempts = 3;
    const maximumTabSwitchAttempts = 3;
    const maximumEscapeAttempts = 3;
    const securityNoticeShownRef = useRef(false);

    // Initialize language preference from localStorage on client side
    useEffect(() => {
        if (typeof window !== 'undefined' && id) {
            const savedLanguage = localStorage.getItem(`exam-language-${id}`) as "english" | "hindi" | null;
            if (savedLanguage) {
                setSelectedLanguage(savedLanguage);
            }
        }
    }, [id]);

    // Detect if user is on mobile device
    useEffect(() => {
        const checkIfMobile = () => {
            if (typeof window !== 'undefined') {
                const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
                const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
                setIsMobileDevice(mobileRegex.test(userAgent.toLowerCase()));
            }
        };

        checkIfMobile();
    }, []);

    // Handle screen orientation changes on mobile devices
    useEffect(() => {
        if (!isMobileDevice || typeof window === 'undefined') return;

        const handleOrientationChange = () => {
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;

            // If in landscape, clear orientation warning
            if (!isPortrait) {
                setOrientationWarning(false);
            } else {
                // Show warning if in portrait mode
                setOrientationWarning(true);
            }
        };

        // Initial check
        handleOrientationChange();

        // Add event listener
        window.addEventListener('orientationchange', handleOrientationChange);
        window.matchMedia("(orientation: portrait)").addEventListener('change', handleOrientationChange);

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.matchMedia("(orientation: portrait)").removeEventListener('change', handleOrientationChange);
        };
    }, [isMobileDevice]);

    // Force landscape and fullscreen on mobile when starting exam
    useEffect(() => {
        if (typeof window === 'undefined' || !isMobileDevice || !currentAttempt || currentAttempt.isSubmitted) return;

        // Try to force fullscreen on mobile
        const enterFullscreenMode = async () => {
            try {
                const options = { navigationUI: 'hide' as FullscreenOptions['navigationUI'] };

                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen(options);
                    setIsFullscreen(true);
                } else if ((document.documentElement as any).webkitRequestFullscreen) {
                    await (document.documentElement as any).webkitRequestFullscreen(options);
                    setIsFullscreen(true);
                } else if ((document.documentElement as any).mozRequestFullScreen) {
                    await (document.documentElement as any).mozRequestFullScreen(options);
                    setIsFullscreen(true);
                } else if ((document.documentElement as any).msRequestFullscreen) {
                    await (document.documentElement as any).msRequestFullscreen(options);
                    setIsFullscreen(true);
                }
            } catch (err) {
                console.error("Mobile fullscreen error:", err);
                toast({
                    title: "Warning",
                    description: "Please enable fullscreen mode for the best exam experience",
                    variant: "default",
                });
            }
        };

        enterFullscreenMode();

        // Check if screen is in portrait orientation and show warning
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;
        if (isPortrait) {
            setOrientationWarning(true);
        }
    }, [isMobileDevice, currentAttempt, toast]);

    // Display security notice when component mounts
    useEffect(() => {
        if (currentAttempt && !currentAttempt.isSubmitted && !securityNoticeShownRef.current) {
            setShowSecurityNotice(true);
            securityNoticeShownRef.current = true;

            // Automatically hide the notice after 8 seconds
            const timer = setTimeout(() => {
                setShowSecurityNotice(false);
            }, 8000);

            return () => clearTimeout(timer);
        }
    }, [currentAttempt]);

    // Fullscreen API handling
    const toggleFullscreen = useCallback(async () => {
        if (typeof window === 'undefined') return;

        if (!isFullscreen) {
            try {
                if (document.documentElement.requestFullscreen) {
                    // Use fullscreen options if available in the browser to make it harder to exit
                    const options = { navigationUI: 'hide' as FullscreenOptions['navigationUI'] };
                    await document.documentElement.requestFullscreen(options);
                    setIsFullscreen(true);
                }
            } catch (err) {
                console.error("Fullscreen error:", err);
            }
        } else {
            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    setIsFullscreen(false);
                }
            } catch (err) {
                console.error("Exit fullscreen error:", err);
            }
        }
    }, [isFullscreen]);

    // Monitor fullscreen changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            if (!document.fullscreenElement && currentAttempt && !currentAttempt.isSubmitted) {
                toast({
                    title: "Warning",
                    description: "Exiting fullscreen mode is not allowed during an exam. Returning to fullscreen...",
                    variant: "destructive",
                });

                // Automatically reenter fullscreen after a short delay
                setTimeout(async () => {
                    try {
                        if (document.documentElement.requestFullscreen) {
                            const options = { navigationUI: 'hide' as FullscreenOptions['navigationUI'] };
                            await document.documentElement.requestFullscreen(options);
                            setIsFullscreen(true);
                        }
                    } catch (err) {
                        console.error("Failed to reenter fullscreen:", err);
                    }
                }, 500);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [currentAttempt, toast]);

    // Specifically handle the Escape key to prevent exiting fullscreen
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const preventEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && currentAttempt && !currentAttempt.isSubmitted) {
                // Prevent default action and stop propagation
                e.preventDefault();
                e.stopPropagation();

                // If fullscreen was exited, immediately try to re-enter
                if (!document.fullscreenElement) {
                    try {
                        const options = { navigationUI: 'hide' as FullscreenOptions['navigationUI'] };
                        document.documentElement.requestFullscreen(options).catch(err => {
                            console.error("Failed to re-enter fullscreen after Escape key:", err);
                        });
                    } catch (error) {
                        console.error("Error re-entering fullscreen:", error);
                    }
                }

                // Track escape attempts
                setEscapeExitAttempts(prev => {
                    const newCount = prev + 1;
                    if (newCount >= maximumEscapeAttempts) {
                        toast({
                            title: "Warning",
                            description: `Multiple attempts to exit fullscreen detected. This activity will be logged.`,
                            variant: "destructive",
                        });
                    } else {
                        toast({
                            title: "Action Blocked",
                            description: `Escape key is disabled during the exam. Attempt ${newCount}/${maximumEscapeAttempts}`,
                            variant: "destructive",
                        });
                    }
                    return newCount;
                });

                return false;
            }
        };

        // Use capture phase to catch the event before it reaches other handlers
        window.addEventListener('keydown', preventEscapeKey, { capture: true });

        return () => {
            window.removeEventListener('keydown', preventEscapeKey, { capture: true });
        };
    }, [currentAttempt, toast, maximumEscapeAttempts]);

    // Block right-click to prevent context menu
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            toast({
                title: "Action Blocked",
                description: "Right-click is disabled during the exam.",
                variant: "destructive",
            });
            return false;
        };

        const preventKeyboardShortcuts = (e: KeyboardEvent) => {
            // Block ALL Control key combinations during exam
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                toast({
                    title: "Action Blocked",
                    description: "Keyboard shortcuts are disabled during the exam.",
                    variant: "destructive",
                });
                return false;
            }

            // Block all other potentially problematic keys
            const blockedKeys = [
                'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
                'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
                'Tab', 'Escape', 'Alt', 'AltGraph',
                'OS', 'ContextMenu', 'PrintScreen'
            ];

            if (blockedKeys.includes(e.key) || e.altKey) {
                e.preventDefault();
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText("").catch(() => {});
                }
                toast({
                    title: "Action Blocked",
                    description: "This key is disabled during the exam.",
                    variant: "destructive",
                });
                return false;
            }
        };

        // Prevent browser refresh via F5 or Ctrl+R
        const preventRefresh = (e: KeyboardEvent) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
                e.preventDefault();
                toast({
                    title: "Refresh Blocked",
                    description: "Refreshing the page is not allowed during the exam.",
                    variant: "destructive",
                });
                return false;
            }
        };

        // Prevent browser navigation via Alt+Left/Right arrows
        const preventBrowserNavigation = (e: KeyboardEvent) => {
            if ((e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) ||
                (e.ctrlKey && (e.key === '[' || e.key === ']'))) {
                e.preventDefault();
                toast({
                    title: "Navigation Blocked",
                    description: "Browser navigation is not allowed during the exam.",
                    variant: "destructive",
                });
                return false;
            }
        };

        window.addEventListener('contextmenu', preventContextMenu);
        window.addEventListener('keydown', preventKeyboardShortcuts);
        window.addEventListener('keydown', preventRefresh);
        window.addEventListener('keydown', preventBrowserNavigation);

        return () => {
            window.removeEventListener('contextmenu', preventContextMenu);
            window.removeEventListener('keydown', preventKeyboardShortcuts);
            window.removeEventListener('keydown', preventRefresh);
            window.removeEventListener('keydown', preventBrowserNavigation);
        };
    }, [toast]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (currentAttempt && !currentAttempt.isSubmitted) {
                const message = "Warning: Refreshing or leaving this page will submit your exam. Are you sure?";
                e.preventDefault();
                e.returnValue = message;

                setShowRefreshWarning(true);

                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('exam_refresh_attempt', Date.now().toString());
                }

                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [currentAttempt]);

    // Define submitExamOnLeavingAttempts as a separate function outside of the useEffect
    const submitExamOnMaxAttempts = useCallback(() => {
        if (currentAttempt && !currentAttempt.isSubmitted && !shouldSubmitRef.current) {
            shouldSubmitRef.current = true;
        }
    }, [currentAttempt]);

    // Handle submission when shouldSubmitRef is set to true (outside render cycle)
    useEffect(() => {
        if (shouldSubmitRef.current && currentAttempt && !currentAttempt.isSubmitted) {
            setLoading(true);
            submitExam()
                .then(() => {
                    setShowSuccess(true);
                    shouldSubmitRef.current = false;
                    // Clear language preference for this exam
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(`exam-language-${id}`);
                    }
                    toast({
                        title: "Exam Submitted",
                        description: `Your exam has been automatically submitted due to maximum navigation attempts.`,
                        variant: "destructive",
                    });
                })
                .catch(error => {
                    console.error("Error submitting exam:", error);
                    shouldSubmitRef.current = false;
                    toast({
                        title: "Error",
                        description: "Failed to submit exam. Please try again.",
                        variant: "destructive",
                    });
                })
                .finally(() => {
                    setLoading(false);
                    setShowSubmitDialog(false);
                });
        }
    }, [currentAttempt, submitExam, toast, id]);

    // Tab visibility change handling
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleVisibilityChange = () => {
            // Skip if this is a mobile device and might be rotating
            const isOrientationChange = isMobileDevice && window.matchMedia("(orientation: portrait)").matches;

            if (document.hidden && currentAttempt && !currentAttempt.isSubmitted && !isOrientationChange) {
                setTabSwitchAttempts(prev => {
                    const newCount = prev + 1;
                    if (newCount >= maximumTabSwitchAttempts) {
                        submitExamOnMaxAttempts();
                    } else {
                        toast({
                            title: "Warning",
                            description: `Please don't switch tabs during the exam. Warning ${newCount}/${maximumTabSwitchAttempts}`,
                            variant: "destructive",
                        });
                    }
                    return newCount;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentAttempt, toast, maximumTabSwitchAttempts, submitExamOnMaxAttempts, isMobileDevice]);

    // Handle back button and navigation attempts
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handlePopState = (e: PopStateEvent) => {
            if (currentAttempt && !currentAttempt.isSubmitted) {
                e.preventDefault();
                setNavigationAttempts(prev => {
                    const newCount = prev + 1;
                    // If too many navigation attempts, submit the exam
                    if (newCount >= maximumNavigationAttempts) {
                        submitExamOnMaxAttempts();
                    } else {
                        toast({
                            title: "Warning",
                            description: `Attempting to navigate away from the exam page. Warning ${newCount}/${maximumNavigationAttempts}`,
                            variant: "destructive",
                        });
                    }
                    return newCount;
                });
                setShowSubmitWarning(true);
                window.history.pushState(null, '', window.location.pathname);
            }
        };

        // Use multiple history states to make it harder to go back
        window.history.pushState(null, '', window.location.pathname);
        window.history.pushState(null, '', window.location.pathname);
        window.history.pushState(null, '', window.location.pathname);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [currentAttempt, navigationAttempts, maximumNavigationAttempts, toast, submitExamOnMaxAttempts]);

    // Try to enter fullscreen when component mounts
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Only attempt fullscreen if exam is active
        if (currentAttempt && !currentAttempt.isSubmitted && !isFullscreen) {
            const enterFullscreen = async () => {
                try {
                    if (document.documentElement.requestFullscreen) {
                        await document.documentElement.requestFullscreen();
                        setIsFullscreen(true);
                    }
                } catch (err) {
                    console.error("Failed to enter fullscreen:", err);
                    toast({
                        title: "Notice",
                        description: "Fullscreen mode is recommended for taking exams.",
                        variant: "default",
                    });
                }
            };

            // Small delay to ensure the component is fully mounted
            const timer = setTimeout(() => {
                enterFullscreen();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [currentAttempt, isFullscreen, toast]);

    useEffect(() => {
        if (!user || !currentExam || !currentAttempt) {
            router.push(`/exams/${id}`);
            return;
        }

        const loadSubjects = async () => {
            if (subjectsLoadedRef.current && subjects.length > 0) {
                if (!selectedSubject && subjects.length > 0) {
                    setSelectedSubject(subjects[0].id);
                    setCurrentQuestionIndex(0);
                }
                return;
            }

            try {
                setSubjectsLoading(true);
                setSubjectsError(null);

                const cachedSubjectsKey = `subjects-${id}`;
                const cachedSubjects = typeof window !== 'undefined' ? localStorage.getItem(cachedSubjectsKey) : null;

                if (cachedSubjects) {
                    try {
                        const parsedSubjects = JSON.parse(cachedSubjects) as Subject[];
                        setSubjects(parsedSubjects);

                        if (parsedSubjects.length > 0 && !selectedSubject) {
                            setSelectedSubject(parsedSubjects[0].id);
                            setCurrentQuestionIndex(0);
                        }

                        subjectsLoadedRef.current = true;
                        setSubjectsLoading(false);
                        return;
                    } catch (parseError) {
                        console.error("Error parsing cached subjects:", parseError);
                    }
                }

                let retryCount = 0;
                const maxRetries = 3;
                let delayMs = 1000;

                while (retryCount < maxRetries) {
                    try {
                        const subjectsQuery = query(
                            collection(db, "subjects"),
                            where("examId", "==", id)
                        );

                        const timeoutPromise = new Promise<never>((_, reject) => {
                            setTimeout(() => reject(new Error("Subjects query timed out")), 15000);
                        });

                        const snapshot = await Promise.race([
                            getDocs(subjectsQuery),
                            timeoutPromise
                        ]);

                        const subjectsData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as Subject[];

                        setSubjects(subjectsData);

                        if (typeof window !== 'undefined') {
                            localStorage.setItem(cachedSubjectsKey, JSON.stringify(subjectsData));
                        }

                        if (subjectsData.length > 0 && !selectedSubject) {
                            setSelectedSubject(subjectsData[0].id);
                            setCurrentQuestionIndex(0);
                        }

                        subjectsLoadedRef.current = true;
                        break;
                    } catch (error) {
                        console.error(`Error loading subjects (attempt ${retryCount + 1}/${maxRetries}):`, error);
                        retryCount++;

                        if (retryCount >= maxRetries) {
                            setSubjectsError("Failed to load subjects. Please refresh the page.");
                            toast({
                                title: "Error",
                                description: "Failed to load exam subjects. Please try refreshing the page.",
                                variant: "destructive",
                            });
                        } else {
                            await new Promise(resolve => setTimeout(resolve, delayMs));
                            delayMs *= 1.5;
                        }
                    }
                }
            } catch (error) {
                console.error("Error in loadSubjects:", error);
                setSubjectsError("Failed to load subjects. Please refresh the page.");
            } finally {
                setSubjectsLoading(false);
            }
        };

        loadSubjects();

        const duration = currentExam.duration * 60;
        const startTime = new Date(currentAttempt.startTime).getTime();
        const endTime = startTime + (duration * 1000);

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                submitExamOnMaxAttempts();
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        const initialAnswers: { [key: string]: number[] } = {};
        currentAttempt.answers.forEach(answer => {
            initialAnswers[answer.questionId] = answer.answer;
        });

        // Check if we have any locally cached answers
        if (typeof window !== 'undefined') {
            const localAnswersKey = `PrepForAll-answers-${currentAttempt.id}`;
            const localAnswersJson = localStorage.getItem(localAnswersKey);

            if (localAnswersJson) {
                try {
                    const localAnswers = JSON.parse(localAnswersJson);
                    if (Array.isArray(localAnswers) && localAnswers.length > currentAttempt.answers.length) {
                        console.log('Recovering answers from local storage');

                        // Restore answers from local storage
                        for (const item of localAnswers) {
                            if (item && item.questionId && Array.isArray(item.answer)) {
                                initialAnswers[item.questionId] = item.answer;
                            }
                        }

                        // Try to sync recovered answers back to Firestore
                        setTimeout(() => {
                            Object.entries(initialAnswers).forEach(([questionId, answer]) => {
                                try {
                                    submitAnswer(questionId, answer);
                                } catch (err) {
                                    console.error(`Failed to sync answer for question ${questionId}:`, err);
                                }
                            });
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Error parsing locally saved answers:', err);
                }
            }
        }

        setAnswers(initialAnswers);

        return () => clearInterval(timer);
    }, [user, currentExam, currentAttempt, id, router, selectedSubject, subjects.length, toast, submitExam]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const refreshAttempt = localStorage.getItem('exam_refresh_attempt');

        if (refreshAttempt) {
            localStorage.removeItem('exam_refresh_attempt');

            const refreshTime = parseInt(refreshAttempt);
            const now = Date.now();

            if (now - refreshTime < 2000) {
                setShowRefreshWarning(true);
            }
        }
    }, []);

    const handleAnswerChange = async (questionId: string, answer: number[]) => {
        // Don't refresh security notice when an answer changes
        const prevAnswers = { ...answers };

        try {
            setAnswers(prev => ({ ...prev, [questionId]: answer }));
            await submitAnswer(questionId, answer);
        } catch (error) {
            console.error("Error submitting answer:", error);
            // Restore previous answers on error
            setAnswers(prevAnswers);
        }
    };

    const handleResetAnswer = async (questionId: string) => {
        try {
            // Store a copy of the current answers for rollback if needed
            const previousAnswers = { ...answers };

            // Remove the answer immediately to update UI
            setAnswers(prev => {
                const newAnswers = { ...prev };
                delete newAnswers[questionId];
                return newAnswers;
            });

            // Note if question was marked for review before resetting
            const wasMarkedForReview = reviewQuestions.has(questionId);

            // Ensure it's still in the visited set (should already be there, but just to be safe)
            setVisitedQuestions(prev => {
                const updatedSet = new Set(prev);
                updatedSet.add(questionId);

                // Update visited questions in local storage
                if (typeof window !== 'undefined') {
                    const visitedKey = `PrepForAll-visited-${currentAttempt?.id}`;
                    try {
                        const visitedArray = Array.from(updatedSet);
                        localStorage.setItem(visitedKey, JSON.stringify(visitedArray));
                    } catch (err) {
                        console.error('Error saving visited questions:', err);
                    }
                }

                return updatedSet;
            });

            // Reset the UI elements
            if (currentQuestion?.type === "single") {
                const radioInputs = document.querySelectorAll(`input[name="radio-${questionId}"]`) as NodeListOf<HTMLInputElement>;
                radioInputs.forEach(input => {
                    input.checked = false;
                });
            }

            try {
                // Submit empty answer to server
                await submitAnswer(questionId, []);

                // Show appropriate feedback based on the question's status after reset
                if (wasMarkedForReview) {
                    toast({
                        title: "Answer reset",
                        description: "Your answer has been reset. Question remains marked for review.",
                        variant: "default",
                    });
                } else {
                    toast({
                        title: "Answer reset",
                        description: "Your answer has been reset. Question is now marked as visited.",
                        variant: "default",
                    });
                }
            } catch (error) {
                // If server submission fails, restore the previous answer state
                console.error("Error submitting reset to server:", error);
                setAnswers(previousAnswers);
                toast({
                    title: "Error",
                    description: "Failed to reset your answer. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error resetting answer:", error);
            toast({
                title: "Error",
                description: "Something went wrong while resetting your answer.",
                variant: "destructive",
            });
        }
    };

    const handleSubmitExam = async () => {
        try {
            setLoading(true);
            await submitExam();
            setShowSuccess(true);
            // Clear local backup
            if (currentAttempt && typeof window !== 'undefined') {
                const localAnswersKey = `PrepForAll-answers-${currentAttempt.id}`;
                const visitedKey = `PrepForAll-visited-${currentAttempt.id}`;
                const reviewKey = `PrepForAll-review-${currentAttempt.id}`;
                localStorage.removeItem(localAnswersKey);
                localStorage.removeItem(visitedKey);
                localStorage.removeItem(reviewKey);
            }
            // Clear language preference for this exam
            if (typeof window !== 'undefined') {
                localStorage.removeItem(`exam-language-${id}`);
            }
        } catch (error) {
            console.error("Error submitting exam:", error);
            toast({
                title: "Error",
                description: "Failed to submit exam. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setShowSubmitDialog(false);
        }
    };

    const handleSubmitWarning = async (confirmed: boolean) => {
        if (confirmed) {
            try {
                await submitExam();
                // Clear language preference for this exam
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(`exam-language-${id}`);
                }
                router.push(`/results/${id}`);
            } catch (error) {
                console.error('Error submitting exam:', error);
                toast({
                    title: "Error",
                    description: "Failed to submit exam. Please try again.",
                    variant: "destructive",
                });
            }
        }
        setShowSubmitWarning(false);
    };

    const handleRefreshWarning = async (confirmed: boolean) => {
        setShowRefreshWarning(false);

        if (confirmed) {
            try {
                setLoading(true);
                await submitExam();
                // Clear language preference for this exam
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(`exam-language-${id}`);
                }
                router.push(`/results/${id}`);
            } catch (error) {
                console.error("Error submitting exam after refresh:", error);
                toast({
                    title: "Error",
                    description: "Failed to submit exam. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubjectChange = (subjectId: string) => {
        if (subjectId !== selectedSubject) {
            setSelectedSubject(subjectId);
            setCurrentQuestionIndex(0);
        }
    };

    const handleNextQuestion = () => {
        // Logic for next question
        if (currentQuestionIndex < subjectQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (!isLastSubject) {
            // Move to first question of next subject
            const currentSubjectIndex = subjects.findIndex(s => s.id === selectedSubject);
            if (currentSubjectIndex < subjects.length - 1) {
                setSelectedSubject(subjects[currentSubjectIndex + 1].id);
                setCurrentQuestionIndex(0);
            }
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else {
            const currentSubjectIndex = subjects.findIndex(s => s.id === selectedSubject);
            if (currentSubjectIndex > 0) {
                const prevSubject = subjects[currentSubjectIndex - 1];
                const prevSubjectQuestions = currentQuestions.filter(q => q.subjectId === prevSubject.id);
                setSelectedSubject(prevSubject.id);
                setCurrentQuestionIndex(prevSubjectQuestions.length - 1);
            }
        }
    };

    // Function for detection of developer tools
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if DevTools is open
        const checkDevToolsStatus = () => {
            // Skip checks if on mobile device - mobile devices commonly have different window dimensions
            if (isMobileDevice) return;

            // Detect if dev tools are open using window size difference
            const threshold = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160;

            if (threshold && currentAttempt && !currentAttempt.isSubmitted) {
                // Additional check to avoid false positives
                const isLikelyMobileZoom =
                    (window.innerWidth < 500 && window.devicePixelRatio > 1) ||
                    (window.visualViewport && window.visualViewport.scale > 1);

                if (!isLikelyMobileZoom) {
                    toast({
                        title: "Warning",
                        description: "Developer tools detected. This action may be reported.",
                        variant: "destructive",
                    });

                    setNavigationAttempts(prev => {
                        const newCount = prev + 1;
                        if (newCount >= maximumNavigationAttempts) {
                            submitExamOnMaxAttempts();
                            return maximumNavigationAttempts;
                        }
                        return newCount;
                    });
                }
            }
        };

        const timer = setInterval(checkDevToolsStatus, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [currentAttempt, maximumNavigationAttempts, submitExamOnMaxAttempts, toast, isMobileDevice]);

    // Continuously focus the window to ensure the exam stays in focus
    useEffect(() => {
        if (typeof window === 'undefined' || !currentAttempt || currentAttempt.isSubmitted) return;

        const focusInterval = setInterval(() => {
            if (!document.hasFocus()) {
                // Try to regain focus
                window.focus();
            }
        }, 3000);

        return () => clearInterval(focusInterval);
    }, [currentAttempt]);

    // Disable copy, cut and paste
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const preventCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            toast({
                title: "Action Blocked",
                description: "Copy, cut and paste are disabled during the exam.",
                variant: "destructive",
            });
            return false;
        };

        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('cut', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);

        return () => {
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('cut', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
        };
    }, [toast]);

    // Disable text selection and drag/drop
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Apply CSS to disable text selection
        const style = document.createElement('style');
        style.innerHTML = `
      body * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
        document.head.appendChild(style);

        // Prevent drag and drop operations
        const preventDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        // Allow selection only in input elements
        const preventSelection = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('dragstart', preventDragStart);
        document.addEventListener('selectstart', preventSelection);

        return () => {
            document.head.removeChild(style);
            document.removeEventListener('dragstart', preventDragStart);
            document.removeEventListener('selectstart', preventSelection);
        };
    }, []);

    // Add event to catch when user tries to print the page
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const preventPrint = () => {
            toast({
                title: "Action Blocked",
                description: "Printing is not allowed during the exam.",
                variant: "destructive",
            });
            return false;
        };

        window.addEventListener('beforeprint', preventPrint);

        return () => {
            window.removeEventListener('beforeprint', preventPrint);
        };
    }, [toast]);

    // Add security meta tags to prevent indexing or social sharing
    const renderSecurityMetaTags = () => {
        return (
            <Head>
                {/* Prevent indexing */}
                <meta name="robots" content="noindex, nofollow" />
                <meta name="googlebot" content="noindex, nofollow" />

                {/* Prevent social media sharing */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Secure Exam Environment" />
                <meta property="og:description" content="This is a secure exam environment. Sharing is not allowed." />
                <meta property="og:image" content="" />

                {/* Prevent Twitter cards */}
                <meta name="twitter:card" content="none" />
                <meta name="twitter:title" content="Secure Exam Environment" />
                <meta name="twitter:description" content="This is a secure exam environment. Sharing is not allowed." />

                {/* Disable cache */}
                <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
                <meta httpEquiv="Pragma" content="no-cache" />
                <meta httpEquiv="Expires" content="0" />
            </Head>
        );
    };

    const handleDismissSecurityNotice = () => {
        setShowSecurityNotice(false);
        securityNoticeShownRef.current = true;
    };

    // Clean up security notice state when the component unmounts or the exam ends
    useEffect(() => {
        return () => {
            securityNoticeShownRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (currentAttempt?.isSubmitted) {
            securityNoticeShownRef.current = false;
        }
    }, [currentAttempt?.isSubmitted]);

    // Memoize the security notice to prevent re-renders
    const SecurityNotice = useMemo(() => {
        if (!showSecurityNotice) return null;

        return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded shadow-md">
                <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-yellow-500 mr-3 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-medium text-yellow-700">Exam Security Notice</h3>
                        <p className="text-sm text-yellow-600 mt-1">
                            This exam is secured with anti-cheating measures. Keyboard shortcuts, browser navigation,
                            tab switching, copying, and other actions are disabled. Any attempts to leave the exam
                            or use developer tools may result in automatic submission.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleDismissSecurityNotice}
                        >
                            Dismiss
                        </Button>
                    </div>
                </div>
            </div>
        );
    }, [showSecurityNotice, handleDismissSecurityNotice]);

    // Handle language change during exam
    const handleLanguageChange = (language: "english" | "hindi") => {
        setSelectedLanguage(language);
        // Update the saved preference
        if (typeof window !== 'undefined') {
            localStorage.setItem(`exam-language-${id}`, language);
        }
    };

    if (!user || !currentExam || !currentAttempt || !currentQuestions.length) {
        return null;
    }

    const subjectQuestions = currentQuestions.filter(q => q.subjectId === selectedSubject);
    const currentQuestion = subjectQuestions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion?.id] || [];

    // Calculate progress that only includes questions with answers that are NOT marked for review
    const isCountedAnswer = (questionId: string) => {
        // Only count the question if it has a valid answer AND is not marked for review
        return answers[questionId] &&
            answers[questionId].length > 0 &&
            !reviewQuestions.has(questionId);
    };

    const subjectAnswered = subjectQuestions.filter(q => isCountedAnswer(q.id)).length;
    const subjectProgress = (subjectAnswered / subjectQuestions.length) * 100;

    const totalAnswered = currentQuestions.filter(q => isCountedAnswer(q.id)).length;
    const totalProgress = (totalAnswered / currentQuestions.length) * 100;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const isLastSubject = subjects.findIndex(s => s.id === selectedSubject) === subjects.length - 1;
    const isLastQuestion = currentQuestionIndex === subjectQuestions.length - 1;
    const isLastQuestionOfLastSubject = isLastSubject && isLastQuestion;

    // Restore visited and review questions from local storage
    useEffect(() => {
        if (!currentAttempt || typeof window === 'undefined') return;

        try {
            // Restore visited questions
            const visitedKey = `PrepForAll-visited-${currentAttempt.id}`;
            const visitedData = localStorage.getItem(visitedKey);
            if (visitedData) {
                const visitedArray = JSON.parse(visitedData);
                if (Array.isArray(visitedArray)) {
                    setVisitedQuestions(new Set(visitedArray));
                }
            }

            // Restore review questions
            const reviewKey = `PrepForAll-review-${currentAttempt.id}`;
            const reviewData = localStorage.getItem(reviewKey);
            if (reviewData) {
                const reviewArray = JSON.parse(reviewData);
                if (Array.isArray(reviewArray)) {
                    setReviewQuestions(new Set(reviewArray));
                }
            }
        } catch (err) {
            console.error('Error restoring question status:', err);
        }
    }, [currentAttempt]);

    const handleMarkForReview = (questionId: string) => {
        // Toggle review status
        setReviewQuestions(prev => {
            const updatedSet = new Set(prev);

            if (updatedSet.has(questionId)) {
                // Un-marking for review
                updatedSet.delete(questionId);

                // Show confirmation toast if this question has an answer
                if (answers[questionId] && answers[questionId].length > 0) {
                    toast({
                        title: "Review status removed",
                        description: "This question's answer will now be counted in your score",
                        variant: "default",
                    });

                    // Resubmit the answer to ensure it's counted
                    submitAnswer(questionId, answers[questionId]).catch(error => {
                        console.error("Error re-submitting answer after unmarking for review:", error);
                    });
                }
            } else {
                // Marking for review
                updatedSet.add(questionId);

                // Show confirmation toast if this question has an answer
                if (answers[questionId] && answers[questionId].length > 0) {
                    toast({
                        title: "Question marked for review",
                        description: "This answer will be saved but NOT counted in your final score until you remove the review mark",
                        variant: "default",
                    });

                    // Submit an empty answer to ensure it's not counted in the score
                    // while keeping the UI state for the user to see
                    submitAnswer(questionId, []).catch(error => {
                        console.error("Error nullifying answer while marking for review:", error);
                    });
                }
            }

            // Store in local storage
            if (typeof window !== 'undefined') {
                const reviewKey = `PrepForAll-review-${currentAttempt?.id}`;
                try {
                    const reviewArray = Array.from(updatedSet);
                    localStorage.setItem(reviewKey, JSON.stringify(reviewArray));
                } catch (err) {
                    console.error('Error saving review questions:', err);
                }
            }

            return updatedSet;
        });
    };

    // Get question status (for color coding)
    const getQuestionStatus = (questionId: string) => {
        // Priority 1: If marked for review, show as review (orange)
        if (reviewQuestions.has(questionId)) {
            return "review";
        }

        // Priority 2: If has a valid answer, show as answered (green)
        if (answers[questionId] && answers[questionId].length > 0) {
            return "answered";
        }

        // Priority 3: If visited, show as visited (purple)
        if (visitedQuestions.has(questionId)) {
            return "visited";
        }

        // Priority 4: Default to not visited (white/gray)
        return "not-visited";
    };

    const getButtonClasses = (questionId: string, isActive: boolean) => {
        const status = getQuestionStatus(questionId);

        if (isActive) {
            return "bg-primary text-primary-foreground hover:bg-primary/90"; // Currently selected question
        }

        switch (status) {
            case "answered":
                return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30 dark:border-green-800";
            case "review":
                return "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30 dark:border-orange-800";
            case "visited":
                return "bg-violet-100 text-violet-800 border-violet-300 hover:bg-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/30 dark:border-violet-800";
            default:
                return "bg-background text-foreground border-border hover:bg-muted";
        }
    };

    // Mark the current question as visited when it changes
    useEffect(() => {
        if (currentQuestion) {
            setVisitedQuestions(prev => {
                const updatedSet = new Set(prev);
                updatedSet.add(currentQuestion.id);

                // Store visited questions in local storage
                if (typeof window !== 'undefined') {
                    const visitedKey = `PrepForAll-visited-${currentAttempt?.id}`;
                    try {
                        const visitedArray = Array.from(updatedSet);
                        localStorage.setItem(visitedKey, JSON.stringify(visitedArray));
                    } catch (err) {
                        console.error('Error saving visited questions:', err);
                    }
                }

                return updatedSet;
            });
        }
    }, [currentQuestion, currentAttempt]);

    return (
        <>
            {renderSecurityMetaTags()}
            <div className="container mx-auto py-8 px-4">
                {SecurityNotice}

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold">{currentExam.title}</h1>
                        <p className="text-muted-foreground mt-2">
                            Question {currentQuestionIndex + 1} of {subjectQuestions.length}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        >
                            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">
                                {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                            </span>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => setShowSubmitDialog(true)}
                            disabled={loading}
                        >
                            Submit Exam
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <Tabs value={selectedSubject} onValueChange={handleSubjectChange}>
                        <TabsList className="mb-4">
                            {subjects.map(subject => (
                                <TabsTrigger key={subject.id} value={subject.id}>
                                    {subject.name}
                                    <Badge variant="outline" className="ml-2">
                                        {currentQuestions.filter(q => q.subjectId === subject.id).length}
                                    </Badge>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3">
                        {currentQuestion && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">Question {currentQuestionIndex + 1}</CardTitle>
                                            <CardDescription className="mt-2">
                                                Marks: {currentQuestion.marks} | Negative Marks: {currentQuestion.negativeMark}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Language Toggle - Show only if subject supports both languages */}
                                            {subjects.find(s => s.id === selectedSubject)?.language === "both" && (
                                                <div className="flex items-center gap-2 border rounded-md p-1">
                                                    <Button
                                                        variant={selectedLanguage === "english" ? "secondary" : "ghost"}
                                                        size="sm"
                                                        onClick={() => handleLanguageChange("english")}
                                                        className="text-xs px-2 py-1 h-7"
                                                    >
                                                        EN
                                                    </Button>
                                                    <Button
                                                        variant={selectedLanguage === "hindi" ? "secondary" : "ghost"}
                                                        size="sm"
                                                        onClick={() => handleLanguageChange("hindi")}
                                                        className="text-xs px-2 py-1 h-7"
                                                    >
                                                        हिं
                                                    </Button>
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleResetAnswer(currentQuestion.id)}
                                                disabled={!answers[currentQuestion.id]}
                                            >
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Reset Answer
                                            </Button>
                                            <Button
                                                variant={reviewQuestions.has(currentQuestion.id) ? "secondary" : "outline"}
                                                size="sm"
                                                onClick={() => handleMarkForReview(currentQuestion.id)}
                                                className={reviewQuestions.has(currentQuestion.id) ? "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300" : ""}
                                            >
                                                <Flag className={`h-4 w-4 mr-2 ${reviewQuestions.has(currentQuestion.id) ? "fill-orange-500" : ""}`} />
                                                {reviewQuestions.has(currentQuestion.id) ? "Marked for Review" : "Mark for Review"}
                                            </Button>
                                            <Badge>
                                                {currentQuestion.type === "single" ? "Single Choice" :
                                                    currentQuestion.type === "multiple" ? "Multiple Choice" :
                                                        "Numerical"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <QuestionMath 
                                            content={
                                                /* Show Hindi question if language is Hindi and subject supports both, otherwise show English */
                                                selectedLanguage === "hindi" &&
                                                subjects.find(s => s.id === selectedSubject)?.language === "both" &&
                                                currentQuestion.questionHindi
                                                ? currentQuestion.questionHindi
                                                : currentQuestion.question
                                            }
                                            className="text-lg mb-4"
                                        />
                                        {currentQuestion.imageUrl && (
                                            <img
                                                src={currentQuestion.imageUrl}
                                                alt="Question"
                                                className="max-w-full h-auto rounded-lg mb-4"
                                            />
                                        )}
                                        {currentQuestion.youtubeUrl && (
                                            <iframe
                                                width="100%"
                                                height="315"
                                                src={currentQuestion.youtubeUrl}
                                                title="Question Video"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded-lg mb-4"
                                            />
                                        )}
                                    </div>

                                    {currentQuestion.type === "single" && (
                                        <RadioGroup
                                            value={answers[currentQuestion.id]?.[0]?.toString() || ""}
                                            onValueChange={(value) => handleAnswerChange(currentQuestion.id, [parseInt(value)])}
                                            className="space-y-3"
                                        >
                                            {(
                                                /* Show Hindi options if language is Hindi, subject supports both, and Hindi options exist */
                                                selectedLanguage === "hindi" &&
                                                    subjects.find(s => s.id === selectedSubject)?.language === "both" &&
                                                    currentQuestion.optionsHindi &&
                                                    currentQuestion.optionsHindi.length > 0
                                                    ? currentQuestion.optionsHindi
                                                    : currentQuestion.options
                                            ).map((option, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                                    <Label htmlFor={`option-${index}`} className="flex-1">
                                                        <OptionMath content={option} />
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}

                                    {currentQuestion.type === "multiple" && (
                                        <div className="space-y-3">
                                            {(
                                                /* Show Hindi options if language is Hindi, subject supports both, and Hindi options exist */
                                                selectedLanguage === "hindi" &&
                                                    subjects.find(s => s.id === selectedSubject)?.language === "both" &&
                                                    currentQuestion.optionsHindi &&
                                                    currentQuestion.optionsHindi.length > 0
                                                    ? currentQuestion.optionsHindi
                                                    : currentQuestion.options
                                            ).map((option, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`option-${index}`}
                                                        checked={currentAnswer.includes(index)}
                                                        onCheckedChange={(checked) => {
                                                            const newAnswer = checked
                                                                ? [...currentAnswer, index]
                                                                : currentAnswer.filter(i => i !== index);
                                                            handleAnswerChange(currentQuestion.id, newAnswer);
                                                        }}
                                                    />
                                                    <Label htmlFor={`option-${index}`} className="flex-1">
                                                        <OptionMath content={option} />
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {currentQuestion.type === "integer" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="answer">Enter your answer</Label>
                                            <Input
                                                id="answer"
                                                type="number"
                                                value={currentAnswer[0] || ""}
                                                onChange={(e) => handleAnswerChange(currentQuestion.id, [parseInt(e.target.value)])}
                                                placeholder="Enter a number"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-between mt-6">
                            <Button
                                variant="outline"
                                onClick={handlePreviousQuestion}
                                disabled={currentQuestionIndex === 0 && subjects.findIndex(s => s.id === selectedSubject) === 0}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                            <Button
                                onClick={handleNextQuestion}
                                disabled={isLastQuestionOfLastSubject}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Question Navigator</CardTitle>
                                <CardDescription>Track your progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Subject Progress</span>
                                            <span>{Math.round(subjectProgress)}%</span>
                                        </div>
                                        <Progress value={subjectProgress} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Overall Progress</span>
                                            <span>{Math.round(totalProgress)}%</span>
                                        </div>
                                        <Progress value={totalProgress} className="h-2" />
                                    </div>

                                    {/* Legend for question status */}
                                    <div className="flex flex-wrap gap-3 my-4 text-xs">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                                            <span>Answered</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-violet-500 mr-1"></div>
                                            <span>Visited</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                                            <span>For Review</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-background border border-border mr-1"></div>
                                            <span>Not Visited</span>
                                        </div>
                                    </div>
                                </div>
                                <ScrollArea className="h-[400px] mt-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        {subjectQuestions.map((question, index) => {
                                            const isCurrentQuestion = currentQuestionIndex === index;
                                            const questionStatus = getQuestionStatus(question.id);
                                            const buttonClasses = getButtonClasses(question.id, isCurrentQuestion);

                                            // Add a key that includes the question status to force re-render when status changes
                                            return (
                                                <Button
                                                    key={`${question.id}-${questionStatus}`}
                                                    variant="outline"
                                                    className={buttonClasses}
                                                    onClick={() => setCurrentQuestionIndex(index)}
                                                >
                                                    {index + 1}
                                                    {reviewQuestions.has(question.id) && (
                                                        <Flag className="h-3 w-3 ml-1 fill-orange-500" />
                                                    )}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {showSuccess && (
                    <SuccessAnimation
                        onComplete={() => {
                            router.push("/exams");
                        }}
                    />
                )}

                <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit Exam</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to submit your exam? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Submission Summary</p>
                                    <p className="text-sm text-muted-foreground">
                                        Answered questions (counted in score): {totalAnswered} of {currentQuestions.length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Unanswered: {currentQuestions.length - totalAnswered - reviewQuestions.size} questions
                                    </p>
                                    {reviewQuestions.size > 0 && (
                                        <p className="text-sm text-orange-500">
                                            Marked for review: {reviewQuestions.size} questions (answers will NOT be counted)
                                        </p>
                                    )}
                                    <div className="mt-2 py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            <strong>Note:</strong> To include answers from questions marked for review in your final score,
                                            you must return to those questions and remove the review mark before submitting.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                                Continue Exam
                            </Button>
                            <Button onClick={handleSubmitExam} disabled={loading}>
                                {loading ? "Submitting..." : "Submit Exam"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showSubmitWarning} onOpenChange={setShowSubmitWarning}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Navigation Blocked</DialogTitle>
                            <DialogDescription>
                                You cannot leave the exam page while an exam is in progress. If you want to end the exam, please submit it properly.
                                You have made {navigationAttempts} out of {maximumNavigationAttempts} allowed navigation attempts.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowSubmitWarning(false)}>
                                Continue Exam
                            </Button>
                            <Button variant="destructive" onClick={() => handleSubmitWarning(true)}>
                                Submit and Leave
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showRefreshWarning} onOpenChange={setShowRefreshWarning}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Page Refresh Detected</DialogTitle>
                            <DialogDescription>
                                The page was refreshed or you attempted to leave. This is not recommended during an exam.
                                Do you want to submit your exam now?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                            <Button variant="outline" onClick={() => handleRefreshWarning(false)}>
                                Continue Exam
                            </Button>
                            <Button variant="destructive" onClick={() => handleRefreshWarning(true)}>
                                Submit and Leave
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Orientation warning dialog for mobile devices */}
                <Dialog open={orientationWarning} onOpenChange={setOrientationWarning}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Rotate Your Device</DialogTitle>
                            <DialogDescription>
                                Please rotate your device to landscape orientation for the best exam experience.
                                Portrait mode is not supported during exams.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center my-4">
                            <div className="w-24 h-24 border-2 border-primary rounded-md p-2 animate-pulse flex items-center justify-center">
                                <div className="rotate-90 text-primary">
                                    <div className="w-12 h-16 border-2 border-primary rounded-md flex items-center justify-center">
                                        <span>📱</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setOrientationWarning(false)} variant="outline">
                                I'll Rotate My Device
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}