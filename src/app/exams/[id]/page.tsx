"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Head from "next/head";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Clock, FileText, Timer, Loader2, Calendar, Share2, UsersRound, CheckCircle2, Languages } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { convertFirebaseTimestamp } from "@/lib/utils";
import type { Subject } from "@/lib/exam-utils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";


export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { toast } = useToast();
  const { user, startExam } = useExam();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingExam, setStartingExam] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "hindi">("english");

  // State for exam grace period and ongoing status
  const [withinGracePeriod, setWithinGracePeriod] = useState(false);
  const [examOngoing, setExamOngoing] = useState(false);
  const [graceTimeLeft, setGraceTimeLeft] = useState<string>("");
  
  // Missing state variables
  const [canRegister, setCanRegister] = useState(false);
  const [canStartExam, setCanStartExam] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState<string>("");
  const [registrationClosesIn, setRegistrationClosesIn] = useState<string>("");
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);

  // Copy to clipboard function
  const copyToClipboard = () => {
    if (typeof window === 'undefined') return;

    const currentUrl = window.location.href;

    if (linkInputRef.current) {
      linkInputRef.current.select();

      // Use modern Clipboard API if available
      if (navigator.clipboard) {
        navigator.clipboard.writeText(currentUrl);
      } else {
        // Fallback for older browsers
        document.execCommand('copy');
      }

      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Exam link has been copied to clipboard",
      });

      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share via different platforms with enhanced content
  const shareVia = (platform: string) => {
    if (typeof window === 'undefined') return;

    const url = encodeURIComponent(window.location.href);

    // Create rich share content
    const title = encodeURIComponent(`${currentExam.title} - Exam Hub`);

    // Create a more detailed description for sharing
    let description = `Join me for the ${currentExam.title} exam on Exam Hub.`;
    if (currentExam.duration) {
      description += ` Duration: ${currentExam.duration} minutes.`;
    }
    if (currentQuestions.length) {
      description += ` ${currentQuestions.length} questions total.`;
    }
    if (currentExam.startDate) {
      const startDateStr = new Date(currentExam.startDate).toLocaleDateString();
      description += ` Available from ${startDateStr}.`;
    }

    const encodedDescription = encodeURIComponent(description);

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        // WhatsApp has a shorter character limit
        const whatsappText = `${currentExam.title} - Exam Hub: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`;
        shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}%20${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${encodedDescription}`;
        break;
      case 'twitter':
        // Twitter has a character limit
        const twitterText = `${description.substring(0, 200)}${description.length > 200 ? '...' : ''}`;
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(twitterText)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${encodedDescription}%0A%0A${url}`;
        break;
      case 'facebook':
        // Facebook prefers to use OG tags directly from the URL
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }

    setShowShareDialog(false);
  };



  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadExamData = async () => {
      try {
        setLoading(true);

        const [examDoc, questionsSnapshot, subjectsSnapshot] = await Promise.all([
          getDoc(doc(db, "exams", id!)),
          getDocs(query(collection(db, "questions"), where("examId", "==", id))),
          getDocs(query(collection(db, "subjects"), where("examId", "==", id)))
        ]);

        if (examDoc.exists()) {
          const data = examDoc.data();
          const examData = {
            id: examDoc.id,
            ...data,
            startDate: convertFirebaseTimestamp(data.startDate),
            endDate: convertFirebaseTimestamp(data.endDate)
          };
          setCurrentExam(examData);
        }

        const questionsData = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCurrentQuestions(questionsData);

        const subjectsData = subjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Subject[];
        setSubjects(subjectsData);

        // Check if user is registered for this exam
        await checkRegistrationStatus();

      } catch (error) {
        console.error("Error loading exam:", error);
        toast({
          title: "Error",
          description: "Failed to load exam details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadExamData();
  }, [id, user, router, toast]);

  // Check if the user is registered for this exam
  const checkRegistrationStatus = async () => {
    if (!user || !id) return;
    
    try {
      // First try to get document with known ID pattern
      const directDocRef = doc(db, "examRegistrations", `${id}_${user.id}`);
      const directDocSnap = await getDoc(directDocRef);
      
      if (directDocSnap.exists()) {
        setIsRegistered(true);
        
        // Get total registrations count
        try {
          const countQuery = query(
            collection(db, "examRegistrations"),
            where("examId", "==", id)
          );
          
          const countSnapshot = await getDocs(countQuery);
          setRegistrationCount(countSnapshot.size);
        } catch (countError) {
          console.error("Error getting registration count:", countError);
          // If we can't get the count, at least we know this user is registered
          setRegistrationCount(1);
        }
        
        return;
      }
      
      // If document with known ID doesn't exist, try query approach
      const registrationsQuery = query(
        collection(db, "examRegistrations"),
        where("examId", "==", id),
        where("userId", "==", user.id)
      );
      
      const registrationsSnapshot = await getDocs(registrationsQuery);
      const isUserRegistered = !registrationsSnapshot.empty;
      setIsRegistered(isUserRegistered);
      
      // Store the registration ID in local storage if user is registered
      if (isUserRegistered) {
        const regDoc = registrationsSnapshot.docs[0];
        localStorage.setItem(`exam_registration_${id}`, regDoc.id);
      } else {
        localStorage.removeItem(`exam_registration_${id}`);
      }
      
      // Get total registrations count
      const countQuery = query(
        collection(db, "examRegistrations"),
        where("examId", "==", id)
      );
      
      const countSnapshot = await getDocs(countQuery);
      setRegistrationCount(countSnapshot.size);
    } catch (error) {
      console.error("Error checking registration status:", error);
      
      // Try to get registration status from localStorage as fallback
      const storedRegId = localStorage.getItem(`exam_registration_${id}`);
      if (storedRegId) {
        setIsRegistered(true);
        // We can't get the count in this case, so make a reasonable assumption
        setRegistrationCount(prev => prev || 1);
      } else {
        // Set default values if permissions fail
        setIsRegistered(false);
        setRegistrationCount(0);
      }
      
      // Only show toast error in development environment
      if (process.env.NODE_ENV === 'development') {
        toast({
          title: "Permission Error",
          description: "Unable to check registration status due to permission settings.",
          variant: "destructive"
        });
      }
    }
  };

  // Handle registration toggle
  const handleRegistration = async () => {
    if (!user || !id || !currentExam) return;
    
    try {
      setRegistering(true);
      
      if (isRegistered) {
        // Unregister
        try {
          // First try to get from localStorage
          const storedRegId = localStorage.getItem(`exam_registration_${id}`);
          
          if (storedRegId) {
            await deleteDoc(doc(db, "examRegistrations", storedRegId));
            localStorage.removeItem(`exam_registration_${id}`);
          } else {
            // Then try with known pattern ID
            const fallbackDocId = `${id}_${user.id}`;
            try {
              await deleteDoc(doc(db, "examRegistrations", fallbackDocId));
            } catch (directDeleteError) {
              console.error("Error with direct deletion:", directDeleteError);
              
              // Finally try with query
              const registrationsQuery = query(
                collection(db, "examRegistrations"),
                where("examId", "==", id),
                where("userId", "==", user.id)
              );
              
              const registrationsSnapshot = await getDocs(registrationsQuery);
              
              if (!registrationsSnapshot.empty) {
                const docToDelete = registrationsSnapshot.docs[0].ref;
                await deleteDoc(docToDelete);
              } else {
                throw new Error("No registration found to delete");
              }
            }
          }
        } catch (queryError) {
          console.error("Error finding registration to delete:", queryError);
          // Try direct deletion with predictable ID as fallback
          try {
            const fallbackDocId = `${id}_${user.id}`;
            await deleteDoc(doc(db, "examRegistrations", fallbackDocId));
          } catch (deleteError) {
            console.error("Error with fallback deletion:", deleteError);
            throw new Error("Unable to unregister. Please try again.");
          }
        }
        
        toast({
          title: "Unregistered",
          description: "You have been removed from the exam registration list."
        });
        
        setIsRegistered(false);
        localStorage.removeItem(`exam_registration_${id}`);
        setRegistrationCount(prevCount => Math.max(0, prevCount - 1));
      } else {
        // Register
        try {
          // Try to use a predictable document ID to make unregistration easier
          // even with permission issues
          const fallbackDocId = `${id}_${user.id}`;
          
          await setDoc(doc(db, "examRegistrations", fallbackDocId), {
            examId: id,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            examTitle: currentExam.title,
            registeredAt: new Date(),
            status: "registered"
          });
          
          // Store registration ID in localStorage for persistence
          localStorage.setItem(`exam_registration_${id}`, fallbackDocId);
          
          toast({
            title: "Registered",
            description: "You have successfully registered for this exam!"
          });
          
          setIsRegistered(true);
          setRegistrationCount(prevCount => prevCount + 1);
        } catch (error) {
          console.error("Error registering with custom ID:", error);
          
          // Fall back to auto-generated ID if custom ID fails
          const docRef = await addDoc(collection(db, "examRegistrations"), {
            examId: id,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            examTitle: currentExam.title,
            registeredAt: new Date(),
            status: "registered"
          });
          
          // Store registration ID in localStorage for persistence
          localStorage.setItem(`exam_registration_${id}`, docRef.id);
          
          toast({
            title: "Registered",
            description: "You have successfully registered for this exam!"
          });
          
          setIsRegistered(true);
          setRegistrationCount(prevCount => prevCount + 1);
        }
      }
    } catch (error) {
      console.error("Error toggling registration:", error);
      toast({
        title: "Error",
        description: "Failed to update registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  useEffect(() => {
    // For anytime exams, always allow registration and starting
    if (currentExam?.isAnytime) {
      setCanRegister(true);
      setCanStartExam(true);
      setWithinGracePeriod(false);
      setExamOngoing(false);
      setTimeUntilStart("");
      setRegistrationClosesIn("Always Open");
      setGraceTimeLeft("");
      return;
    }

    if (!currentExam?.startDate) return;

    const checkExamStartTime = () => {
      const now = new Date();
      const startTime = new Date(currentExam.startDate);
      const endTime = new Date(currentExam.endDate);
      
      // Calculate registration cutoff time (5 minutes before exam starts)
      const registrationCutoff = new Date(startTime);
      registrationCutoff.setMinutes(registrationCutoff.getMinutes() - 5);
      
      // Check if we can still register (before cutoff time)
      const canStillRegister = now < registrationCutoff;
      setCanRegister(canStillRegister);
      
      // Calculate time until registration closes
      if (canStillRegister) {
        const diffToRegistrationClose = registrationCutoff.getTime() - now.getTime();
        const minutesToRegClose = Math.floor(diffToRegistrationClose / (1000 * 60));
        
        if (minutesToRegClose <= 30) {
          const secondsToRegClose = Math.floor((diffToRegistrationClose % (1000 * 60)) / 1000);
          setRegistrationClosesIn(`${minutesToRegClose}m ${secondsToRegClose}s`);
        } else {
          const hoursToRegClose = Math.floor(minutesToRegClose / 60);
          const remainingMinutesToRegClose = minutesToRegClose % 60;
          setRegistrationClosesIn(`${hoursToRegClose}h ${remainingMinutesToRegClose}m`);
        }
      } else {
        setRegistrationClosesIn("Closed");
      }

      // Calculate grace period end time (3 minutes after exam starts)
      const gracePeriodEnd = new Date(startTime);
      gracePeriodEnd.setMinutes(gracePeriodEnd.getMinutes() + 3);

      // Check if within grace period (exam has started but grace period hasn't ended)
      const isWithinGracePeriod = now >= startTime && now <= gracePeriodEnd;
      
      // Check if exam is ongoing but past grace period
      const isExamOngoing = now > gracePeriodEnd && now <= endTime;
      
      // Update states
      setWithinGracePeriod(isWithinGracePeriod);
      setExamOngoing(isExamOngoing);
      
      // Set canStartExam to true if it's either within official start time or grace period
      const canStart = now >= startTime && now <= endTime && !isExamOngoing;
      setCanStartExam(canStart);

      // Calculate grace period remaining time
      if (isWithinGracePeriod) {
        const diffToGraceEnd = gracePeriodEnd.getTime() - now.getTime();
        const secondsToGraceEnd = Math.floor(diffToGraceEnd / 1000);
        const minutesToGraceEnd = Math.floor(secondsToGraceEnd / 60);
        const remainingSecondsToGraceEnd = secondsToGraceEnd % 60;
        setGraceTimeLeft(`${minutesToGraceEnd}m ${remainingSecondsToGraceEnd}s`);
      }

      if (now < startTime) {
        const diff = startTime.getTime() - now.getTime();
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes <= 30) {
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeUntilStart(`${minutes}m ${seconds}s`);
          return { minutes, isUnder30: true };
        } else {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          setTimeUntilStart(`${hours}h ${remainingMinutes}m`);
          return { minutes, isUnder30: false };
        }
      } else if (now > endTime) {
        setTimeUntilStart("Exam has ended");
        return { minutes: 0, isUnder30: false };
      } else {
        setTimeUntilStart("");
        return { minutes: 0, isUnder30: false };
      }
    };

    const initialState = checkExamStartTime();

    const interval = setInterval(
      checkExamStartTime,
      initialState.isUnder30 ? 1000 : 60000
    );

    return () => clearInterval(interval);
  }, [currentExam]);

  // Detect if user is on mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      if (typeof window === 'undefined') return;

      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobileDevice(mobileRegex.test(userAgent.toLowerCase()));
    };

    checkIfMobile();
  }, []);

  const handleStartExam = async () => {
    try {
      setStartingExam(true);
      
      // Store the selected language for the exam attempt
      localStorage.setItem(`exam-language-${id}`, selectedLanguage);
      
      await startExam(id!);
      router.push(`/exams/${id}/attempt`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start exam",
        variant: "destructive",
      });
    } finally {
      setStartingExam(false);
      setShowStartDialog(false);
    }
  };

  // Add an effect to monitor and re-disable the button if someone tries to enable it through DOM manipulation
  useEffect(() => {
    if (!examOngoing) return;

    // Function to observe DOM changes and re-disable the button if needed
    const observer = new MutationObserver((mutations) => {
      const examButtons = document.querySelectorAll('[data-ongoing="true"]');
      examButtons.forEach(button => {
        const buttonEl = button as HTMLButtonElement;
        if (!buttonEl.disabled) {
          buttonEl.disabled = true;
          buttonEl.style.pointerEvents = 'none';
          console.log('Blocked attempt to enable exam button after grace period');
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
      attributes: true, 
      childList: true, 
      subtree: true,
      attributeFilter: ['disabled', 'style'] 
    });

    // Clean up observer on component unmount
    return () => observer.disconnect();
  }, [examOngoing]);

  const examDescription = currentExam
    ? `${currentExam.title}: ${currentExam.description?.substring(0, 120) || 'Online exam'} | ${currentExam.duration} minutes | ${currentQuestions.length} questions`
    : '';



  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading exam details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentExam) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Exam Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The exam you're looking for could not be found.
          </p>
          <Button onClick={() => router.push("/exams")}>View Available Exams</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{currentExam ? `${currentExam.title} - Exam Hub` : 'Exam - Exam Hub'}</title>
        <meta name="description" content={examDescription} />
        <meta property="og:title" content={currentExam ? `${currentExam.title} - Exam Hub` : 'Exam - Exam Hub'} />
        <meta property="og:description" content={examDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={currentExam ? `${currentExam.title} - Exam Hub` : 'Exam - Exam Hub'} />
        <meta name="twitter:description" content={examDescription} />
      </Head>
      <div className="container mx-auto py-8 px-4 pb-24 md:pb-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{currentExam.title}</h1>
              <p className="text-sm md:text-base text-muted-foreground line-clamp-2">{currentExam.description}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              {/* Language Selector - Show only if there are subjects that support both languages */}
              {subjects.some(subject => subject.language === "both") && (
                <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedLanguage} onValueChange={(value: "english" | "hindi") => setSelectedLanguage(value)}>
                    <SelectTrigger className="h-auto p-0 border-0 focus:ring-0 min-w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिंदी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  if (typeof window === 'undefined') return;

                  const shareData = {
                    title: `${currentExam.title} - Exam Hub`,
                    text: `Join me for the ${currentExam.title} exam on Exam Hub.`,
                    url: window.location.href
                  };

                  if (navigator.share && isMobileDevice) {
                    navigator.share(shareData)
                      .catch((error) => {
                        console.error('Error sharing:', error);
                        setShowShareDialog(true);
                      });
                  } else {
                    setShowShareDialog(true);
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <div className="flex items-center gap-2 bg-primary/5 rounded-full px-4 py-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium whitespace-nowrap">{currentExam.duration} minutes</span>
              </div>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                {currentQuestions.length} Questions
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Exam Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentExam?.isAnytime ? (
                  <div className="text-center py-4">
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded-full inline-flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Available Anytime
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You can take this exam at any time that's convenient for you
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Start Time:</p>
                      <p className="font-medium">
                        {currentExam?.startDate?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">End Time:</p>
                      <p className="font-medium">
                        {currentExam?.endDate?.toLocaleString()}
                      </p>
                    </div>
                    {timeUntilStart && !canStartExam && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Time until exam starts: {timeUntilStart}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{currentExam?.duration} minutes</p>
                  <p className="text-sm text-muted-foreground">
                    Once started, the timer cannot be paused
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{currentQuestions.length} Total</p>
                  <ScrollArea className="h-20">
                    {subjects.map(subject => {
                      const subjectQuestions = currentQuestions.filter(q => q.subjectId === subject.id);
                      return (
                        <div key={subject.id} className="flex justify-between text-sm py-1">
                          <span>{subject.name}</span>
                          <span>{subjectQuestions.length} questions</span>
                        </div>
                      );
                    })}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Card - Moved to bottom for mobile but still visible here on desktop */}
          <div className="hidden md:block">
            {currentExam?.isAnytime ? (
              // For anytime exams, show a simple registration card
              <Card className="mb-8 border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UsersRound className="h-5 w-5 text-primary" />
                    Registration
                  </CardTitle>
                  <CardDescription>
                    Register to access this exam anytime
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted p-2 rounded-full">
                        <UsersRound className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{registrationCount} student{registrationCount !== 1 ? 's' : ''} registered</p>
                        <p className="text-xs text-muted-foreground">Registration is always open</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant={isRegistered ? "outline" : "default"}
                      className={isRegistered ? "border-green-500 text-green-500 hover:bg-green-50" : ""}
                      onClick={handleRegistration}
                      disabled={registering}
                    >
                      {registering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isRegistered ? "Unregistering..." : "Registering..."}
                        </>
                      ) : isRegistered ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Registered
                        </>
                      ) : (
                        "Register for Exam"
                      )}
                    </Button>
                  </div>
                  
                  {isRegistered && (
                    <div className="mt-4 p-3 bg-green-50 rounded-md text-sm text-green-700 flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">You're all set!</p>
                        <p>You can start this exam anytime you're ready.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              // For scheduled exams, show the existing registration logic
              <>
                {!canStartExam && timeUntilStart && canRegister && (
                  <Card className="mb-8 border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <UsersRound className="h-5 w-5 text-primary" />
                        Pre-Registration
                      </CardTitle>
                      <CardDescription>
                        Register now to access this exam as soon as it begins
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted p-2 rounded-full">
                            <UsersRound className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{registrationCount} student{registrationCount !== 1 ? 's' : ''} registered</p>
                            <p className="text-xs text-muted-foreground">Registration closes in {registrationClosesIn}</p>
                          </div>
                        </div>
                        
                        <Button 
                          variant={isRegistered ? "outline" : "default"}
                          className={isRegistered ? "border-green-500 text-green-500 hover:bg-green-50" : ""}
                          onClick={handleRegistration}
                          disabled={registering}
                        >
                          {registering ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isRegistered ? "Unregistering..." : "Registering..."}
                            </>
                          ) : isRegistered ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Registered
                            </>
                          ) : (
                            "Register for Exam"
                          )}
                        </Button>
                      </div>
                      
                      {isRegistered && (
                        <div className="mt-4 p-3 bg-green-50 rounded-md text-sm text-green-700 flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">You're all set!</p>
                            <p>You will be notified when the exam begins. Come back to this page to start the exam.</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Registration Closed Notice */}
                {!canStartExam && timeUntilStart && !canRegister && !canStartExam && (
                  <Card className="mb-8 border-dashed border-amber-200">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">Registration is now closed</p>
                          <p className="text-sm text-amber-700">Pre-registration for this exam is no longer available as the exam is about to start.</p>
                          <p className="text-sm text-amber-700 mt-1">The exam will start in {timeUntilStart}.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Exam Instructions</CardTitle>
              <CardDescription>Please read these instructions carefully before starting the exam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Time Management</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      <li>You have {currentExam.duration} minutes to complete this exam</li>
                      <li>The timer starts immediately when you begin</li>
                      <li>The exam auto-submits when time expires</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Question Types</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Single Choice: Select one correct answer</li>
                      <li>Multiple Choice: Select all applicable answers</li>
                      <li>Numerical: Enter a numeric value</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Marking Scheme</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Each question has its own marks and negative marking</li>
                      <li>Incorrect answers may result in negative marks</li>
                      <li>Unanswered questions receive zero marks</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Navigation</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Questions are organized by subject</li>
                      <li>You can switch between subjects at any time</li>
                      <li>Use the question navigator to track progress</li>
                      <li>You can review and change answers before submission</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Important Notes</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      <li>Do not refresh the page during the exam</li>
                      <li>Ensure stable internet connection</li>
                      <li>Submit before time expires</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desktop version: Both buttons side by side */}
          <div className="hidden md:block mb-8">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              
              {/* Registration info and button - only show for scheduled exams that haven't started */}
              {!currentExam?.isAnytime && !canStartExam && timeUntilStart && canRegister && (
                <div className="flex-1 flex flex-col sm:flex-row justify-between items-center p-4 border border-dashed rounded-lg">
                  <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <div className="bg-muted p-2 rounded-full">
                      <UsersRound className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{registrationCount} student{registrationCount !== 1 ? 's' : ''} registered</p>
                      <p className="text-xs text-muted-foreground">Registration closes in {registrationClosesIn}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant={isRegistered ? "outline" : "default"}
                    className={isRegistered ? "border-green-500 text-green-500 hover:bg-green-50" : ""}
                    onClick={handleRegistration}
                    disabled={registering}
                    size="lg"
                  >
                    {registering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isRegistered ? "Unregistering..." : "Registering..."}
                      </>
                    ) : isRegistered ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Registered
                      </>
                    ) : (
                      "Register for Exam"
                    )}
                  </Button>
                </div>
              )}
              
              {/* Registration Closed Notice - only for scheduled exams */}
              {!currentExam?.isAnytime && !canStartExam && timeUntilStart && !canRegister && !canStartExam && (
                <div className="flex-1 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-amber-800">Registration is now closed</p>
                      <p className="text-sm text-amber-700">Pre-registration is no longer available. Exam starts in {timeUntilStart}.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Start Exam Button */}
              <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    disabled={startingExam || (!canStartExam && !withinGracePeriod) || examOngoing}
                    className="min-w-[180px]"
                    {...(examOngoing ? { 
                      "data-ongoing": "true", 
                      "data-test-id": "disabled-button",
                      "style": { pointerEvents: "none" } 
                    } : {})}
                  >
                    {startingExam ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Starting...
                      </>
                    ) : examOngoing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Ongoing
                      </>
                    ) : withinGracePeriod ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Grace Period: {graceTimeLeft}
                      </>
                    ) : !canStartExam && timeUntilStart && !currentExam?.isAnytime ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Starts in {timeUntilStart}
                      </>
                    ) : (
                      'Start Exam'
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start Exam</DialogTitle>
                    <DialogDescription>
                      Are you ready to begin? The timer will start immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Before you start</p>
                        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                          <li>You have {currentExam.duration} minutes to complete {currentQuestions.length} questions</li>
                          <li>The timer cannot be paused once started</li>
                          <li>Ensure you have a stable internet connection</li>
                          {subjects.some(subject => subject.language === "both") && (
                            <li>
                              Language: <span className="font-medium">
                                {selectedLanguage === "english" ? "English" : "हिंदी (Hindi)"}
                              </span> (you can change this during the exam)
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowStartDialog(false)}
                      disabled={startingExam}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleStartExam}
                      disabled={startingExam}
                      className="min-w-[100px]"
                    >
                      {startingExam ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Starting...
                        </>
                      ) : (
                        'Begin Exam'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Success message for scheduled exams */}
            {!currentExam?.isAnytime && isRegistered && !canStartExam && timeUntilStart && canRegister && (
              <div className="mt-4 p-3 bg-green-50 rounded-md text-sm text-green-700 flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">You're all set!</p>
                  <p>You will be notified when the exam begins. Come back to this page to start the exam.</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile fixed bottom bar - No changes needed here */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
            {/* Registration section for mobile */}
            {currentExam?.isAnytime ? (
              // For anytime exams, show simplified registration
              canRegister && (
                <div className="p-3 border-b">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <UsersRound className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">{registrationCount} registered</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Always open</p>
                  </div>
                  <Button 
                    variant={isRegistered ? "outline" : "default"}
                    className={`w-full ${isRegistered ? "border-green-500 text-green-500" : ""}`}
                    onClick={handleRegistration}
                    disabled={registering}
                    size="sm"
                  >
                    {registering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isRegistered ? "Unregistering..." : "Registering..."}
                      </>
                    ) : isRegistered ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Registered
                      </>
                    ) : (
                      "Register for Exam"
                    )}
                  </Button>
                </div>
              )
            ) : (
              // For scheduled exams, show existing logic
              <>
                {!canStartExam && timeUntilStart && canRegister && (
                  <div className="p-3 border-b">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <UsersRound className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">{registrationCount} registered</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Closes in {registrationClosesIn}</p>
                    </div>
                    <Button 
                      variant={isRegistered ? "outline" : "default"}
                      className={`w-full ${isRegistered ? "border-green-500 text-green-500" : ""}`}
                      onClick={handleRegistration}
                      disabled={registering}
                      size="sm"
                    >
                      {registering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isRegistered ? "Unregistering..." : "Registering..."}
                        </>
                      ) : isRegistered ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Registered
                        </>
                      ) : (
                        "Register for Exam"
                      )}
                    </Button>
                  </div>
                )}
                
                {/* Registration closed notice for mobile */}
                {!canStartExam && timeUntilStart && !canRegister && !canStartExam && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-b">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Registration closed. Starts in {timeUntilStart}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Start exam button for mobile */}
            <div className="p-3">
              <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={startingExam || (!canStartExam && !withinGracePeriod) || examOngoing}
                    {...(examOngoing ? { 
                      "data-ongoing": "true", 
                      "data-test-id": "disabled-button",
                      "style": { pointerEvents: "none" } 
                    } : {})}
                  >
                    {startingExam ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Starting...
                      </>
                    ) : examOngoing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Ongoing
                      </>
                    ) : withinGracePeriod ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Grace Period: {graceTimeLeft}
                      </>
                    ) : !canStartExam && timeUntilStart && !currentExam?.isAnytime ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Starts in {timeUntilStart}
                      </>
                    ) : (
                      'Start Exam'
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start Exam</DialogTitle>
                    <DialogDescription>
                      Are you ready to begin? The timer will start immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Before you start</p>
                        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                          <li>You have {currentExam.duration} minutes to complete {currentQuestions.length} questions</li>
                          <li>The timer cannot be paused once started</li>
                          <li>Ensure you have a stable internet connection</li>
                          {subjects.some(subject => subject.language === "both") && (
                            <li>
                              Language: <span className="font-medium">
                                {selectedLanguage === "english" ? "English" : "हिंदी (Hindi)"}
                              </span> (you can change this during the exam)
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowStartDialog(false)}
                      disabled={startingExam}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleStartExam}
                      disabled={startingExam}
                      className="min-w-[100px]"
                    >
                      {startingExam ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Starting...
                        </>
                      ) : (
                        'Begin Exam'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Mobile orientation warning */}
          <Dialog open={showOrientationWarning} onOpenChange={setShowOrientationWarning}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rotate Your Device</DialogTitle>
                <DialogDescription>
                  Please rotate your device to landscape orientation before starting the exam.
                  This provides the best experience for viewing questions and answering them.
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
                <Button variant="outline" onClick={() => setShowOrientationWarning(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowOrientationWarning(false);
                  // Check orientation again, if still portrait, warn again
                  setTimeout(() => {
                    const isStillPortrait = window.matchMedia("(orientation: portrait)").matches;
                    if (!isStillPortrait) {
                      handleStartExam();
                    } else {
                      setShowOrientationWarning(true);
                    }
                  }, 500);
                }}>
                  Start Anyway
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Share dialog */}
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Exam</DialogTitle>
                <DialogDescription>
                  Share this exam with friends or colleagues
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto w-[80px]"
                    onClick={() => shareVia('whatsapp')}
                  >
                    <div className="bg-green-500 text-white p-2 rounded-full mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.6 6.8A7.8 7.8 0 0 0 5.8 15l-1.8 5.8 6-1.6a7.8 7.8 0 0 0 4.3 1.3 8 8 0 0 0 7.7-8 7.8 7.8 0 0 0-4.4-6.2Z" />
                        <path d="M10 10c.5-1 1.7-1.5 2.7-1a1 1 0 0 1 .3 1.5" />
                        <path d="M16 14c-1 2-3.3 3-5.5 2.5-2.5-.5-4-2.5-4.5-5" />
                      </svg>
                    </div>
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto w-[80px]"
                    onClick={() => shareVia('telegram')}
                  >
                    <div className="bg-blue-500 text-white p-2 rounded-full mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </div>
                    <span className="text-xs">Telegram</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto w-[80px]"
                    onClick={() => shareVia('email')}
                  >
                    <div className="bg-gray-500 text-white p-2 rounded-full mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <span className="text-xs">Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto w-[80px]"
                    onClick={() => shareVia('twitter')}
                  >
                    <div className="bg-blue-400 text-white p-2 rounded-full mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                      </svg>
                    </div>
                    <span className="text-xs">Twitter</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto w-[80px]"
                    onClick={() => shareVia('facebook')}
                  >
                    <div className="bg-blue-600 text-white p-2 rounded-full mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </div>
                    <span className="text-xs">Facebook</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto w-[80px]"
                    onClick={() => shareVia('linkedin')}
                  >
                    <div className="bg-blue-700 text-white p-2 rounded-full mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </div>
                    <span className="text-xs">LinkedIn</span>
                  </Button>
                </div>

                <div className="mt-4">
                  <p className="text-sm mb-2">Or copy link:</p>
                  <div className="flex gap-2">
                    <Input
                      value={typeof window !== 'undefined' ? window.location.href : ''}
                      readOnly
                      className="flex-1"
                      ref={linkInputRef}
                    />
                    <Button variant="secondary" onClick={copyToClipboard}>
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
      </div>
    </>
  );
}