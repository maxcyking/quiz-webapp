"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { collection, query, where, getDocs, doc, getDoc, Timestamp, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Subject } from "@/lib/exam-utils";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';

// Import components
import ResultHeader from "../components/ResultHeader";
import RewardCard from "../components/RewardCard";
import ClaimedRewardCard from "../components/ClaimedRewardCard";
import ScoreOverviewCard from "../components/ScoreOverviewCard";
import TopPerformersSection from "../components/TopPerformersSection";
import SubjectPerformanceSection from "../components/SubjectPerformanceSection";
import QuestionAnalysisSection from "../components/QuestionAnalysisSection";
import TopRankingsSection from "../components/TopRankingsSection";
import RewardsSection from "../components/RewardsSection";
import ResultsNotFound from "../components/ResultsNotFound";
import ResultsNotReleased from "../components/ResultsNotReleased";
import LoadingState from "../components/LoadingState";

type Ranking = {
    userId: string;
    userName: string;
    score: number;
    rank: number;
    photoURL?: string;
    totalMarks: number;
    earnedMarks: number;
    reward?: number;
    rewardId?: string;
    rewardStatus?: 'pending' | 'claimed' | 'processing';
    currentUserId?: string; // Added to track current user
};

interface PageProps {
    params: {
        id: string;
    };
}

export default function ExamResultPage() {
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : '';
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useExam();
    const [loading, setLoading] = useState(true);
    const [exam, setExam] = useState<any>(null);
    const [result, setResult] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [userRank, setUserRank] = useState<Ranking | null>(null);
    const [subjectResults, setSubjectResults] = useState<Map<string, {
        totalQuestions: number;
        attemptedQuestions: number;
        correctAnswers: number;
        incorrectAnswers: number;
        partialAnswers: number;
        totalMarks: number;
        earnedMarks: number;
        score: number;
        visitedQuestions: number;
        reviewQuestions: number;
        notVisitedQuestions: number;
    }>>(new Map());
    const [resultsReleased, setResultsReleased] = useState<boolean>(false);
    const [showRewards, setShowRewards] = useState(false);
    const [claimingReward, setClaimingReward] = useState(false);
    const [rewardStatus, setRewardStatus] = useState<{ [rewardId: string]: 'pending' | 'claimed' | 'processing' }>({});
    const [userRewardId, setUserRewardId] = useState<string | null>(null);
    const [loadingAnimation, setLoadingAnimation] = useState(false);
    const [confettiTriggered, setConfettiTriggered] = useState(false);
    const rewardCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (!id) {
            setLoading(false);
            return;
        }

        const loadExamResult = async () => {
            try {
                setLoading(true);

                // Load exam details
                const examDocRef = doc(db, "exams", id);
                const examDocSnap = await getDoc(examDocRef);
                if (examDocSnap.exists()) {
                    const examData = { id: examDocSnap.id, ...examDocSnap.data() };
                    setExam(examData);

                    // Check if results are released
                    const isResultsReleased = "isResultReleased" in examData ? examData.isResultReleased === true : false;
                    setResultsReleased(isResultsReleased);

                    // If results are not released, we'll show a message but still load the data in background
                    if (!isResultsReleased) {
                        setLoading(false);
                        return;
                    }
                }

                // Load questions
                const questionsQuery = query(collection(db, "questions"), where("examId", "==", id));
                const questionsSnapshot = await getDocs(questionsQuery);
                const questionsData = questionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as any[];
                setQuestions(questionsData);

                // Load subjects
                const subjectsQuery = query(collection(db, "subjects"), where("examId", "==", id));
                const subjectsSnapshot = await getDocs(subjectsQuery);
                const subjectsData = subjectsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Subject[];
                setSubjects(subjectsData);

                // Load user's result
                const resultQuery = query(
                    collection(db, "examAttempts"),
                    where("examId", "==", id),
                    where("userId", "==", user.id),
                    where("isSubmitted", "==", true)
                );
                const resultSnapshot = await getDocs(resultQuery);
                if (!resultSnapshot.empty) {
                    const resultData = resultSnapshot.docs[0].data();
                    setResult(resultData);

                    // Calculate subject-wise results
                    const results = calculateSubjectResults(questionsData, resultData.answers, resultData.questionStatus || {});
                    setSubjectResults(results);
                }

                // Calculate total possible marks for the exam
                const totalPossibleMarks = questionsData.reduce((total, q) => total + (q.marks || 0), 0);

                // Load rankings
                const rankingsQuery = query(
                    collection(db, "examAttempts"),
                    where("examId", "==", id),
                    where("isSubmitted", "==", true)
                );
                const rankingsSnapshot = await getDocs(rankingsQuery);
                const rankingsData = await Promise.all(
                    rankingsSnapshot.docs.map(async (docSnapshot) => {
                        const attemptData = docSnapshot.data();
                        const userDocRef = doc(db, "users", attemptData.userId);
                        const userDocSnap = await getDoc(userDocRef);
                        const userData = userDocSnap.exists() ? userDocSnap.data() : null;

                        // Calculate earned marks if not already present
                        const earnedMarks = attemptData.totalMarks ||
                            attemptData.answers?.reduce((total: number, ans: any) => total + (ans.marksEarned || 0), 0) || 0;

                        return {
                            userId: attemptData.userId,
                            userName: userData?.name || "Anonymous",
                            score: attemptData.score || 0,
                            totalMarks: totalPossibleMarks, // Use the calculated total possible marks
                            earnedMarks: earnedMarks,
                            photoURL: userData?.photoURL,
                            rank: 0, // Will be calculated below
                            currentUserId: user.id // Add current user ID for comparison
                        } as Ranking;
                    })
                );

                // Sort by score and assign ranks
                rankingsData.sort((a, b) => b.score - a.score);
                rankingsData.forEach((ranking, index) => {
                    ranking.rank = index + 1;
                });

                // Check for rewards data
                const rewardsQuery = query(
                    collection(db, "rewards"),
                    where("examId", "==", id)
                );
                const rewardsSnapshot = await getDocs(rewardsQuery);

                // Create a map of userId -> reward amount and status
                const rewardsMap = new Map();
                const statusMap: { [rewardId: string]: 'pending' | 'claimed' | 'processing' } = {};
                let userReward = null;

                rewardsSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    rewardsMap.set(data.userId, {
                        amount: data.amount,
                        id: doc.id,
                        status: data.status || 'pending'
                    });

                    statusMap[doc.id] = data.status || 'pending';

                    // If this is the current user's reward, save the ID
                    if (data.userId === user.id) {
                        userReward = doc.id;
                    }
                });

                setRewardStatus(statusMap);
                setUserRewardId(userReward);

                // Add reward amounts to rankings data
                rankingsData.forEach(ranking => {
                    if (rewardsMap.has(ranking.userId)) {
                        const rewardData = rewardsMap.get(ranking.userId);
                        ranking.reward = rewardData.amount;
                        ranking.rewardId = rewardData.id;
                        ranking.rewardStatus = rewardData.status;
                    }
                });

                // Check if any rewards exist
                setShowRewards(rewardsMap.size > 0);

                setRankings(rankingsData);
                setUserRank(rankingsData.find(r => r.userId === user.id) || null);

            } catch (error) {
                console.error("Error loading exam result:", error);
                toast({
                    title: "Error",
                    description: "Failed to load exam result",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadExamResult();
    }, [id, router, user, toast]);

    // Claim reward function
    const claimReward = async () => {
        if (!user || !userRank?.reward || !userRewardId) return;

        try {
            setClaimingReward(true);
            setLoadingAnimation(true);

            // First stage animation
            await new Promise(resolve => setTimeout(resolve, 800));

            // Get the reward document first to validate it
            const rewardRef = doc(db, "rewards", userRewardId);
            const rewardSnap = await getDoc(rewardRef);

            if (!rewardSnap.exists()) {
                throw new Error("Reward does not exist!");
            }

            const rewardData = rewardSnap.data();

            // Validate the reward belongs to the current user
            if (rewardData.userId !== user.id) {
                throw new Error("This reward belongs to another user.");
            }

            if (rewardData.status !== 'pending') {
                throw new Error("This reward has already been claimed or is being processed.");
            }

            // Update reward status to processing (not claimed) to indicate it's in progress
            await updateDoc(rewardRef, {
                status: 'processing',
                claimedAt: Timestamp.now()
            });

            toast({
                title: "Processing",
                description: "Your reward claim is being processed...",
            });

            // Update user's wallet in userStats
            const statsRef = doc(db, "userStats", user.id);
            const statsSnap = await getDoc(statsRef);

            // Update stats document for better data consistency
            if (statsSnap.exists()) {
                const currentStats = statsSnap.data();
                const currentPending = currentStats.pendingRewards || 0;
                const currentProcessing = currentStats.processingRewards || 0;

                await updateDoc(statsRef, {
                    // Remove from pending rewards
                    pendingRewards: currentPending > userRank.reward ? currentPending - userRank.reward : 0,
                    // Add to processing rewards
                    processingRewards: currentProcessing + userRank.reward,
                    // Track the total rewards claimed
                    totalRewards: (currentStats.totalRewards || 0) + userRank.reward,
                    // Add timestamp for last update
                    lastUpdated: serverTimestamp()
                });
            } else {
                // Create new stats document if it doesn't exist
                await setDoc(statsRef, {
                    wallet: 0,
                    pendingRewards: 0,
                    processingRewards: userRank.reward,
                    totalRewards: userRank.reward,
                    createdAt: serverTimestamp(),
                    lastUpdated: serverTimestamp()
                });
            }

            // Simulate a delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Final update to mark as claimed
            await updateDoc(rewardRef, {
                status: 'claimed'
            });

            // Update local state
            setRewardStatus({
                ...rewardStatus,
                [userRewardId]: 'claimed'
            });

            // Create confetti effect after reward is claimed
            if (!confettiTriggered && rewardCardRef.current) {
                setConfettiTriggered(true);

                // Get the position for the confetti
                const rect = rewardCardRef.current.getBoundingClientRect();
                const x = (rect.left + rect.right) / 2 / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;

                // Fire confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { x, y: y - 0.1 }
                });

                // Fire another burst after a short delay
                setTimeout(() => {
                    confetti({
                        particleCount: 50,
                        angle: 60,
                        spread: 55,
                        origin: { x: x - 0.1, y: y - 0.1 }
                    });

                    confetti({
                        particleCount: 50,
                        angle: 120,
                        spread: 55,
                        origin: { x: x + 0.1, y: y - 0.1 }
                    });
                }, 300);
            }

            toast({
                title: "Reward Claimed!",
                description: `₹${userRank.reward} has been added to your wallet!`,
            });

        } catch (error) {
            console.error("Error claiming reward:", error);

            // Check for specific error types for better user feedback
            let errorMessage = "Failed to claim reward. Please try again later.";

            if (error instanceof Error) {
                errorMessage = error.message;

                // Handle network errors specifically
                if (error.message.includes("network") || error.message.includes("offline")) {
                    errorMessage = "Network error. Please check your internet connection and try again.";
                }

                // Handle permission errors
                if (error.message.includes("permission-denied")) {
                    errorMessage = "You don't have permission to claim this reward.";
                }
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });

            // If the status was changed to processing but the operation failed, revert it
            try {
                const rewardSnap = await getDoc(doc(db, "rewards", userRewardId));
                if (rewardSnap.exists() && rewardSnap.data().status === 'processing') {
                    await updateDoc(doc(db, "rewards", userRewardId), {
                        status: 'pending',
                        claimedAt: null // Remove the claimed timestamp
                    });
                }
            } catch (revertError) {
                console.error("Error reverting reward status:", revertError);
            }
        } finally {
            setLoadingAnimation(false);
            setClaimingReward(false);
        }
    };

    if (!user) {
        return null;
    }

    if (loading) {
        return <LoadingState />;
    }

    if (!exam) {
        return <ResultsNotFound
            message="The exam you're looking for could not be found."
            navigate={router.push}
        />;
    }

    if (!resultsReleased) {
        return <ResultsNotReleased
            examTitle={exam.title}
            navigate={router.push}
        />;
    }

    if (!result) {
        return <ResultsNotFound
            message="The exam result you're looking for could not be found. This might be because the exam hasn't been completed yet or the exam ID is incorrect."
            navigate={router.push}
        />;
    }

    const topPerformers = rankings.slice(0, 3).map(performer => ({
        ...performer,
        currentUserId: user.id // Add current user ID to each performer for comparison
    }));

    return (
        <div className="container mx-auto py-8 px-4">
            <ResultHeader
                exam={exam}
                userRank={userRank}
                showRewards={showRewards}
                rewardStatus={rewardStatus}
                userRewardId={userRewardId}
                navigate={router.push}
            />

            {/* Display Rewards Section if available */}
            {showRewards && userRank?.reward && rewardStatus[userRewardId || ''] === 'pending' && (
                <RewardCard
                    userRank={userRank}
                    rewardStatus={rewardStatus}
                    userRewardId={userRewardId}
                    claimReward={claimReward}
                    claimingReward={claimingReward}
                    loadingAnimation={loadingAnimation}
                    navigate={router.push}
                />
            )}

            {/* Already claimed reward notification */}
            {showRewards && userRank?.reward && (rewardStatus[userRewardId || ''] === 'claimed' || rewardStatus[userRewardId || ''] === 'processing') && (
                <ClaimedRewardCard
                    userRank={userRank}
                    navigate={router.push}
                />
            )}

            {/* Score Overview Card */}
            <ScoreOverviewCard
                result={result}
                questions={questions}
                userRank={userRank}
                rankings={rankings}
            />

            {/* Top Performers */}
            <TopPerformersSection topPerformers={topPerformers} />

            {/* Subject Performance */}
            <SubjectPerformanceSection
                subjects={subjects}
                subjectResults={subjectResults}
            />

            {/* Detailed Question Analysis */}
            <QuestionAnalysisSection
                subjects={subjects}
                questions={questions}
                result={result}
            />

            {/* Top Rankings */}
            <TopRankingsSection
                rankings={rankings}
                navigate={router.push}
                user={user}
            />

            {/* Display Rewards Section if available */}
            <RewardsSection
                showRewards={showRewards}
                userRank={userRank}
                rankings={rankings}
                navigate={router.push}
            />
        </div>
    );
}

function calculateSubjectResults(questions: any[], answers: any[], questionStatus: any = {}) {
    const subjectResults = new Map<string, {
        totalQuestions: number;
        attemptedQuestions: number;
        correctAnswers: number;
        incorrectAnswers: number;
        partialAnswers: number;
        totalMarks: number;
        earnedMarks: number;
        score: number;
        visitedQuestions: number;
        reviewQuestions: number;
        notVisitedQuestions: number;
    }>();

    // First, initialize the map with all subjects
    const subjectIds = new Set(questions.map(q => q.subjectId));
    subjectIds.forEach(subjectId => {
        subjectResults.set(subjectId, {
            totalQuestions: 0,
            attemptedQuestions: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            partialAnswers: 0,
            totalMarks: 0,
            earnedMarks: 0,
            score: 0,
            visitedQuestions: 0,
            reviewQuestions: 0,
            notVisitedQuestions: 0
        });
    });

    // Process each question
    questions.forEach(question => {
        const answer = answers?.find(a => a.questionId === question.id);
        // Get the status directly from the answer object or from questionStatus
        const status = answer?.status || questionStatus[question.id] || 'not-attempted';

        const subjectStats = subjectResults.get(question.subjectId) || {
            totalQuestions: 0,
            attemptedQuestions: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            partialAnswers: 0,
            totalMarks: 0,
            earnedMarks: 0,
            score: 0,
            visitedQuestions: 0,
            reviewQuestions: 0,
            notVisitedQuestions: 0
        };

        // Increment total questions and marks for this subject
        subjectStats.totalQuestions++;
        subjectStats.totalMarks += question.marks || 0;

        // Process based on question status
        if (status === 'review') {
            subjectStats.reviewQuestions++;
            subjectStats.attemptedQuestions++;
        } else if (status === 'visited') {
            subjectStats.visitedQuestions++;
            subjectStats.attemptedQuestions++;
        } else if (status === 'not-attempted' || status === 'not-visited') {
            subjectStats.notVisitedQuestions++;
        } else if (status === 'answered') {
            subjectStats.attemptedQuestions++;

            // Process answered questions
            if (answer && answer.answer && answer.answer.length > 0) {
                if (answer.marksEarned > 0) {
                    // Check for partially correct answers in multiple choice
                    if (question.type === "multiple" && answer.answer.length < (question.correctAnswers?.length || 0)) {
                        subjectStats.partialAnswers++;
                    } else {
                        subjectStats.correctAnswers++;
                    }
                    subjectStats.earnedMarks += answer.marksEarned;
                } else {
                    subjectStats.incorrectAnswers++;
                    // Include negative marks if applicable
                    if (typeof answer.marksEarned === 'number') {
                        subjectStats.earnedMarks += answer.marksEarned;
                    }
                }
            }
        }

        // Calculate score as percentage of earned marks out of total possible marks
        subjectStats.score = subjectStats.totalMarks > 0
            ? (subjectStats.earnedMarks / subjectStats.totalMarks) * 100
            : 0;

        // Update the map
        subjectResults.set(question.subjectId, subjectStats);
    });

    return subjectResults;
}