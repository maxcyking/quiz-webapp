// Types
interface Question {
  id: string;
  examId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  correctAnswers?: number[];
  type: "single" | "multiple" | "integer";
  explanation?: string;
  imageUrl?: string;
  youtubeUrl?: string;
  marks: number;
  negativeMark: number;
  subjectId: string;
  // Multi-language support
  questionHindi?: string;
  optionsHindi?: string[];
  explanationHindi?: string;
  // Solution fields for both languages
  solution?: string;
  solutionHindi?: string;
  // Image fields for both languages
  questionImageUrl?: string;
  questionImageUrlHindi?: string;
}

export interface Subject {
  id: string;
  examId: string;
  name: string;
  totalQuestions: number;
  totalMarks: number;
  language: "english" | "hindi" | "both";  // Added language support
}

export function calculateMarks(question: Question, userAnswer: number[]): { 
  marks: number; 
  isCorrect: boolean; 
  isPartiallyCorrect: boolean;
} {
  if (!userAnswer.length) {
    return { marks: 0, isCorrect: false, isPartiallyCorrect: false };
  }

  if (question.type === "single" || question.type === "integer") {
    const isCorrect = userAnswer[0] === question.correctAnswer;
    return {
      marks: isCorrect ? question.marks : -(question.negativeMark || 0),
      isCorrect,
      isPartiallyCorrect: false
    };
  }

  if (question.type === "multiple" && question.correctAnswers) {
    const correctAnswers = new Set(question.correctAnswers);
    const userAnswers = new Set(userAnswer);
    
    const isFullyCorrect = correctAnswers.size === userAnswers.size && 
                          [...correctAnswers].every(value => userAnswers.has(value));

    const correctSelections = userAnswer.filter(ans => correctAnswers.has(ans)).length;
    const incorrectSelections = userAnswer.filter(ans => !correctAnswers.has(ans)).length;

    if (incorrectSelections > 0) {
      return { 
        marks: -(question.negativeMark || 0),
        isCorrect: false,
        isPartiallyCorrect: false 
      };
    }

    const marksPerCorrectAnswer = question.marks / correctAnswers.size;
    const earnedMarks = correctSelections * marksPerCorrectAnswer;

    return {
      marks: earnedMarks,
      isCorrect: isFullyCorrect,
      isPartiallyCorrect: !isFullyCorrect && earnedMarks > 0
    };
  }

  return { marks: 0, isCorrect: false, isPartiallyCorrect: false };
}

export function calculateSubjectResults(questions: Question[], answers: { questionId: string; answer: number[]; marksEarned: number }[]) {
  const subjectResults = new Map<string, {
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    totalMarks: number;
    earnedMarks: number;
    score: number;
  }>();

  questions.forEach(question => {
    const answer = answers.find(a => a.questionId === question.id);
    const subjectStats = subjectResults.get(question.subjectId) || {
      totalQuestions: 0,
      attemptedQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalMarks: 0,
      earnedMarks: 0,
      score: 0
    };

    subjectStats.totalQuestions++;
    subjectStats.totalMarks += question.marks;

    if (answer) {
      subjectStats.attemptedQuestions++;
      if (answer.marksEarned > 0) {
        subjectStats.correctAnswers++;
        subjectStats.earnedMarks += answer.marksEarned;
      } else {
        subjectStats.incorrectAnswers++;
      }
    }

    subjectStats.score = (subjectStats.earnedMarks / subjectStats.totalMarks) * 100;
    subjectResults.set(question.subjectId, subjectStats);
  });

  return subjectResults;
}