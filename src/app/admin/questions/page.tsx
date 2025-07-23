"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Plus, Trash, FileUp, Download, AlertCircle, Loader2, FileText, FileSpreadsheet, Check, Image } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, increment, writeBatch } from "firebase/firestore";
import { db, storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Subject } from "@/lib/exam-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WysiwygEditor } from "@/components/ui/wysiwyg-editor";
import * as XLSX from 'xlsx';

type QuestionFormData = {
  question: string;
  type: "single" | "multiple" | "integer";
  options: string[];
  correctAnswer: number;
  correctAnswers?: number[];
  explanation?: string;
  imageUrl?: string;
  youtubeUrl?: string;
  marks: number;
  negativeMark: number;
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
  // Comprehension passage fields
  comprehensionPassage?: string;
  comprehensionPassageHindi?: string;
};

export default function AdminQuestionsPage() {
  const router = useRouter();
  const { user, exams } = useExam();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [formData, setFormData] = useState<QuestionFormData>({
    question: "",
    type: "single",
    options: ["", "", "", ""],
    correctAnswer: 0,
    correctAnswers: [],
    explanation: "",
    imageUrl: "",
    youtubeUrl: "",
    marks: 1,
    negativeMark: 0,
    questionHindi: "",
    optionsHindi: ["", "", "", ""],
    explanationHindi: "",
    solution: "",
    solutionHindi: "",
    questionImageUrl: "",
    questionImageUrlHindi: "",
    comprehensionPassage: "",
    comprehensionPassageHindi: ""
  });
  
  // Updated state for file upload
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setCsvError] = useState<string | null>(null);
  const [filePreview, setCsvPreview] = useState<any[]>([]);
  const [uploadingFile, setUploadingCsv] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFormat, setUploadFormat] = useState<"csv" | "excel">("csv");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image upload state
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [questionImageFileHindi, setQuestionImageFileHindi] = useState<File | null>(null);
  const [uploadingQuestionImage, setUploadingQuestionImage] = useState(false);
  const [uploadingQuestionImageHindi, setUploadingQuestionImageHindi] = useState(false);

  // Load subjects when exam is selected
  useEffect(() => {
    if (selectedExam && user?.isAdmin) {
      const loadSubjects = async () => {
        try {
          const subjectsQuery = query(
            collection(db, "subjects"),
            where("examId", "==", selectedExam)
          );
          const snapshot = await getDocs(subjectsQuery);
          const subjectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Subject[];
          setSubjects(subjectsData);
        } catch (error) {
          console.error("Error loading subjects:", error);
          toast({
            title: "Error",
            description: "Failed to load subjects",
            variant: "destructive",
          });
        }
      };
      loadSubjects();
    }
  }, [selectedExam, user, toast]);

  // Load questions when exam is selected
  useEffect(() => {
    if (selectedExam && user?.isAdmin) {
      const loadQuestions = async () => {
        try {
          setLoading(true);
          const questionsQuery = query(
            collection(db, "questions"),
            where("examId", "==", selectedExam)
          );
          const snapshot = await getDocs(questionsQuery);
          const questionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setQuestions(questionsData);
        } catch (error) {
          console.error("Error loading questions:", error);
          toast({
            title: "Error",
            description: "Failed to load questions",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      loadQuestions();
    }
  }, [selectedExam, user, toast]);

  // Handle question image file selection
  const handleQuestionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      setQuestionImageFile(file);
    }
  };

  // Handle Hindi question image file selection
  const handleQuestionImageHindiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      setQuestionImageFileHindi(file);
    }
  };

  // Upload question image to Firebase Storage
  const uploadQuestionImage = async (questionId: string): Promise<string | null> => {
    if (!questionImageFile) return null;
    
    try {
      setUploadingQuestionImage(true);
      
      // Create a storage reference
      const storageRef = ref(storage, `question-images/${questionId}-en`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, questionImageFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading question image:", error);
      throw error;
    } finally {
      setUploadingQuestionImage(false);
    }
  };

  // Upload Hindi question image to Firebase Storage
  const uploadQuestionImageHindi = async (questionId: string): Promise<string | null> => {
    if (!questionImageFileHindi) return null;
    
    try {
      setUploadingQuestionImageHindi(true);
      
      // Create a storage reference
      const storageRef = ref(storage, `question-images/${questionId}-hi`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, questionImageFileHindi);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading Hindi question image:", error);
      throw error;
    } finally {
      setUploadingQuestionImageHindi(false);
    }
  };

  // Render image preview
  const renderImagePreview = (file: File | null, existingUrl?: string, onRemove?: () => void) => {
    if (file) {
      return (
        <div className="mt-2 relative">
          <img 
            src={URL.createObjectURL(file)} 
            alt="Image Preview" 
            className="max-h-32 rounded-md object-cover"
          />
          <div className="mt-1 text-xs text-muted-foreground">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            className="absolute top-0 right-0 w-6 h-6 p-0 rounded-full"
            onClick={onRemove}
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      );
    } else if (existingUrl) {
      return (
        <div className="mt-2 relative">
          <img 
            src={existingUrl} 
            alt="Current Image" 
            className="max-h-32 rounded-md object-cover"
          />
          <div className="mt-1 text-xs text-muted-foreground">
            Current question image
          </div>
        </div>
      );
    }
    
    return null;
  };

  const handleCreateQuestion = async () => {
    if (!selectedSubject || !selectedExam) {
      toast({
        title: "Error",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const questionData = {
        examId: selectedExam,
        subjectId: selectedSubject,
        question: formData.question,
        type: formData.type,
        options: formData.type === "integer" ? [] : formData.options,
        correctAnswer: formData.type === "single" ? formData.correctAnswer : 0,
        correctAnswers: formData.type === "multiple" ? formData.correctAnswers : [],
        explanation: formData.explanation || "",
        imageUrl: formData.imageUrl || "",
        youtubeUrl: formData.youtubeUrl || "",
        marks: formData.marks,
        negativeMark: formData.negativeMark,
        // Hindi fields - only include if subject supports both languages
        ...(subjects.find(s => s.id === selectedSubject)?.language === "both" && {
          questionHindi: formData.questionHindi || "",
          optionsHindi: formData.type === "integer" ? [] : (formData.optionsHindi || []),
          explanationHindi: formData.explanationHindi || "",
          solutionHindi: formData.solutionHindi || "",
          questionImageUrlHindi: formData.questionImageUrlHindi || "",
          comprehensionPassageHindi: formData.comprehensionPassageHindi || ""
        }),
        solution: formData.solution || "",
        solutionHindi: formData.solutionHindi || "",
        questionImageUrl: formData.questionImageUrl || "",
        comprehensionPassage: formData.comprehensionPassage || "",
        createdAt: new Date(),
      };

      // Add the question
      const questionRef = await addDoc(collection(db, "questions"), questionData);

      // Upload images if provided
      let questionImageUrl = formData.questionImageUrl || "";
      let questionImageUrlHindi = formData.questionImageUrlHindi || "";

      if (questionImageFile) {
        try {
          const uploadedUrl = await uploadQuestionImage(questionRef.id);
          if (uploadedUrl) {
            questionImageUrl = uploadedUrl;
          }
        } catch (error) {
          console.error("Error uploading question image:", error);
          toast({
            title: "Warning",
            description: "Question created but image upload failed",
            variant: "destructive",
          });
        }
      }

      if (questionImageFileHindi && subjects.find(s => s.id === selectedSubject)?.language === "both") {
        try {
          const uploadedUrl = await uploadQuestionImageHindi(questionRef.id);
          if (uploadedUrl) {
            questionImageUrlHindi = uploadedUrl;
          }
        } catch (error) {
          console.error("Error uploading Hindi question image:", error);
          toast({
            title: "Warning",
            description: "Question created but Hindi image upload failed",
            variant: "destructive",
          });
        }
      }

      // Update question with image URLs if any were uploaded
      if (questionImageUrl !== (formData.questionImageUrl || "") || 
          questionImageUrlHindi !== (formData.questionImageUrlHindi || "")) {
        await updateDoc(doc(db, "questions", questionRef.id), {
          questionImageUrl,
          questionImageUrlHindi
        });
      }

      // Update exam's total questions count
      const examRef = doc(db, "exams", selectedExam);
      await updateDoc(examRef, {
        totalQuestions: increment(1)
      });

      // Update subject's question count and total marks
      const subjectRef = doc(db, "subjects", selectedSubject);
      await updateDoc(subjectRef, {
        totalQuestions: increment(1),
        totalMarks: increment(formData.marks)
      });

      toast({
        title: "Success",
        description: "Question added successfully"
      });

      setShowCreateDialog(false);
      setFormData({
        question: "",
        type: "single",
        options: ["", "", "", ""],
        correctAnswer: 0,
        correctAnswers: [],
        explanation: "",
        imageUrl: "",
        youtubeUrl: "",
        marks: 1,
        negativeMark: 0,
        questionHindi: "",
        optionsHindi: ["", "", "", ""],
        explanationHindi: "",
        solution: "",
        solutionHindi: "",
        questionImageUrl: "",
        questionImageUrlHindi: "",
        comprehensionPassage: "",
        comprehensionPassageHindi: ""
      });
      
      // Clear image files
      setQuestionImageFile(null);
      setQuestionImageFileHindi(null);

      // Reload questions
      const questionsQuery = query(
        collection(db, "questions"),
        where("examId", "==", selectedExam)
      );
      const snapshot = await getDocs(questionsQuery);
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error creating question:", error);
      toast({
        title: "Error",
        description: "Failed to create question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      setLoading(true);

      const oldMarks = selectedQuestion.marks;
      const newMarks = formData.marks;
      const marksDifference = newMarks - oldMarks;

      // Update the question
      const updateData = {
        question: formData.question,
        type: formData.type,
        options: formData.type === "integer" ? [] : formData.options,
        correctAnswer: formData.type === "single" ? formData.correctAnswer : 0,
        correctAnswers: formData.type === "multiple" ? formData.correctAnswers : [],
        explanation: formData.explanation || "",
        imageUrl: formData.imageUrl || "",
        youtubeUrl: formData.youtubeUrl || "",
        marks: formData.marks,
        negativeMark: formData.negativeMark,
        // Hindi fields - only include if subject supports both languages
        ...(subjects.find(s => s.id === selectedSubject)?.language === "both" && {
          questionHindi: formData.questionHindi || "",
          optionsHindi: formData.type === "integer" ? [] : (formData.optionsHindi || []),
          explanationHindi: formData.explanationHindi || "",
          solutionHindi: formData.solutionHindi || "",
          questionImageUrlHindi: formData.questionImageUrlHindi || "",
          comprehensionPassageHindi: formData.comprehensionPassageHindi || ""
        }),
        solution: formData.solution || "",
        solutionHindi: formData.solutionHindi || "",
        questionImageUrl: formData.questionImageUrl || "",
        comprehensionPassage: formData.comprehensionPassage || "",
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, "questions", selectedQuestion.id), updateData);

      // Upload images if new ones were provided
      let questionImageUrl = formData.questionImageUrl || "";
      let questionImageUrlHindi = formData.questionImageUrlHindi || "";

      if (questionImageFile) {
        try {
          const uploadedUrl = await uploadQuestionImage(selectedQuestion.id);
          if (uploadedUrl) {
            questionImageUrl = uploadedUrl;
          }
        } catch (error) {
          console.error("Error uploading question image:", error);
          toast({
            title: "Warning",
            description: "Question updated but image upload failed",
            variant: "destructive",
          });
        }
      }

      if (questionImageFileHindi && subjects.find(s => s.id === selectedSubject)?.language === "both") {
        try {
          const uploadedUrl = await uploadQuestionImageHindi(selectedQuestion.id);
          if (uploadedUrl) {
            questionImageUrlHindi = uploadedUrl;
          }
        } catch (error) {
          console.error("Error uploading Hindi question image:", error);
          toast({
            title: "Warning",
            description: "Question updated but Hindi image upload failed",
            variant: "destructive",
          });
        }
      }

      // Update question with image URLs if any were uploaded
      if (questionImageUrl !== (formData.questionImageUrl || "") || 
          questionImageUrlHindi !== (formData.questionImageUrlHindi || "")) {
        await updateDoc(doc(db, "questions", selectedQuestion.id), {
          questionImageUrl,
          questionImageUrlHindi
        });
      }

      // Update subject's total marks if marks have changed
      if (marksDifference !== 0) {
        const subjectRef = doc(db, "subjects", selectedQuestion.subjectId);
        await updateDoc(subjectRef, {
          totalMarks: increment(marksDifference)
        });
      }

      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      setShowEditDialog(false);
      setSelectedQuestion(null);
      
      // Clear image files
      setQuestionImageFile(null);
      setQuestionImageFileHindi(null);

      // Reload questions
      const questionsQuery = query(
        collection(db, "questions"),
        where("examId", "==", selectedExam)
      );
      const snapshot = await getDocs(questionsQuery);
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setLoading(true);

      // Get the question data before deleting
      const questionDoc = questions.find(q => q.id === questionId);
      if (!questionDoc) return;

      // Delete the question
      await deleteDoc(doc(db, "questions", questionId));

      // Update exam's total questions count
      const examRef = doc(db, "exams", selectedExam);
      await updateDoc(examRef, {
        totalQuestions: increment(-1)
      });

      // Update subject's question count and total marks
      const subjectRef = doc(db, "subjects", questionDoc.subjectId);
      await updateDoc(subjectRef, {
        totalQuestions: increment(-1),
        totalMarks: increment(-questionDoc.marks)
      });

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      // Reload questions
      const questionsQuery = query(
        collection(db, "questions"),
        where("examId", "==", selectedExam)
      );
      const snapshot = await getDocs(questionsQuery);
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate sample Excel template
  const generateExcelTemplate = () => {
    const workbook = XLSX.utils.book_new();
    
    // Get actual subject IDs to use in template
    const subjectId1 = subjects.length > 0 ? subjects[0].id : "REPLACE_WITH_ACTUAL_SUBJECT_ID";
    const subjectId2 = subjects.length > 1 ? subjects[1].id : subjectId1;
    const subjectId3 = subjects.length > 2 ? subjects[2].id : subjectId1;
    
    const headers = [
      "subjectId",
      "question", 
      "type", 
      "option1", 
      "option2", 
      "option3", 
      "option4", 
      "correctAnswer", 
      "correctAnswers", 
      "marks", 
      "negativeMark", 
      "explanation", 
      "solution",
      "comprehensionPassage",
      "questionImageUrl",
      "imageUrl", 
      "youtubeUrl",
      // Hindi fields
      "questionHindi",
      "option1Hindi",
      "option2Hindi", 
      "option3Hindi",
      "option4Hindi",
      "explanationHindi",
      "solutionHindi",
      "comprehensionPassageHindi",
      "questionImageUrlHindi"
    ];
    
    const sampleRows = [
      [
        subjectId1, // Use actual subject ID
        "What is the capital of France?", 
        "single", 
        "Paris", 
        "London", 
        "Berlin", 
        "Madrid", 
        "0", 
        "", 
        "1", 
        "0", 
        "Paris is the capital of France", 
        "<p>Paris is the capital and most populous city of France.</p>",
        "", // No comprehension passage for this question
        "https://example.com/france-map.jpg",
        "", 
        "https://youtu.be/example1",
        "फ्रांस की राजधानी क्या है?",
        "पेरिस",
        "लंदन",
        "बर्लिन", 
        "मैड्रिड",
        "पेरिस फ्रांस की राजधानी है",
        "<p>पेरिस फ्रांस की राजधानी है।</p>",
        "", // No Hindi comprehension passage for this question
        "https://example.com/france-map-hindi.jpg"
      ],
      [
        subjectId1, // Use same subject ID
        "Select all prime numbers:", 
        "multiple", 
        "2", 
        "3", 
        "4", 
        "5", 
        "", 
        "0,1,3", 
        "2", 
        "0.5", 
        "2, 3, and 5 are prime numbers", 
        "<p>Prime numbers are natural numbers greater than 1.</p>",
        "", // No comprehension passage for this question
        "https://example.com/prime-numbers.jpg",
        "", 
        "https://youtu.be/example2",
        "सभी अभाज्य संख्याओं का चयन करें:",
        "2",
        "3",
        "4",
        "5", 
        "2, 3, और 5 अभाज्य संख्याएं हैं",
        "<p>अभाज्य संख्याएं प्राकृतिक संख्याएं हैं।</p>",
        "", // No Hindi comprehension passage for this question
        "https://example.com/prime-numbers-hindi.jpg"
      ],
      [
        subjectId2, // Use second subject ID if available
        "What is 2+2?", 
        "integer", 
        "", 
        "", 
        "", 
        "", 
        "4", 
        "", 
        "1", 
        "0", 
        "The answer is 4", 
        "<p>Addition is a basic arithmetic operation. 2 + 2 = 4</p>",
        "", // No comprehension passage for this question
        "https://example.com/addition.jpg",
        "https://example.com/math.jpg", 
        "",
        "2+2 क्या है?",
        "",
        "",
        "",
        "",
        "उत्तर 4 है",
        "<p>जोड़ना एक बुनियादी अंकगणितीय संक्रिया है।</p>",
        "", // No Hindi comprehension passage for this question
        "https://example.com/addition-hindi.jpg"
      ],
      [
        subjectId3, // Use third subject ID if available
        "What is the main theme of the passage?", 
        "single", 
        "Environmental protection", 
        "Economic growth", 
        "Social inequality", 
        "Technology advancement", 
        "0", 
        "", 
        "2", 
        "0", 
        "The passage discusses environmental protection as the main theme", 
        "<p>Based on the passage content, environmental protection is the central focus.</p>",
        "<p>Climate change represents one of the most pressing challenges of our time. Rising global temperatures, melting ice caps, and extreme weather events are clear indicators that immediate action is needed. Governments worldwide must implement sustainable policies to protect our environment for future generations. This includes investing in renewable energy, reducing carbon emissions, and promoting eco-friendly practices in industries.</p>",
        "",
        "", 
        "",
        "गद्यांश का मुख्य विषय क्या है?",
        "पर्यावरण संरक्षण",
        "आर्थिक विकास",
        "सामाजिक असमानता",
        "प्रौद्योगिकी प्रगति",
        "गद्यांश पर्यावरण संरक्षण को मुख्य विषय के रूप में चर्चा करता है",
        "<p>गद्यांश की सामग्री के आधार पर, पर्यावरण संरक्षण केंद्रीय फोकस है।</p>",
        "<p>जलवायु परिवर्तन हमारे समय की सबसे दबाव वाली चुनौतियों में से एक है। बढ़ते वैश्विक तापमान, पिघलते बर्फ के टुकड़े, और चरम मौसम की घटनाएं स्पष्ट संकेतक हैं कि तत्काल कार्रवाई की आवश्यकता है। दुनिया भर की सरकारों को भविष्य की पीढ़ियों के लिए हमारे पर्यावरण की रक्षा के लिए टिकाऊ नीतियों को लागू करना चाहिए।</p>",
        ""
      ]
    ];
    
    const data = [headers, ...sampleRows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'question_template.xlsx');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Generate sample CSV template
  const generateCsvTemplate = () => {
    // Get actual subject IDs to use in template
    const subjectId1 = subjects.length > 0 ? subjects[0].id : "REPLACE_WITH_ACTUAL_SUBJECT_ID";
    const subjectId2 = subjects.length > 1 ? subjects[1].id : subjectId1;
    const subjectId3 = subjects.length > 2 ? subjects[2].id : subjectId1;
    
    const headers = [
      "subjectId",
      "question", 
      "type", 
      "option1", 
      "option2", 
      "option3", 
      "option4", 
      "correctAnswer", 
      "correctAnswers", 
      "marks", 
      "negativeMark", 
      "explanation", 
      "solution",
      "comprehensionPassage",
      "questionImageUrl",
      "imageUrl", 
      "youtubeUrl",
      // Hindi fields
      "questionHindi",
      "option1Hindi",
      "option2Hindi", 
      "option3Hindi",
      "option4Hindi",
      "explanationHindi",
      "solutionHindi",
      "comprehensionPassageHindi",
      "questionImageUrlHindi"
    ].join(",");
    
    const sampleRows = [
      `"${subjectId1}","What is the capital of France?","single","Paris","London","Berlin","Madrid","0","","1","0","Paris is the capital of France","<p>Paris is the capital and most populous city of France.</p>","","https://example.com/france-map.jpg","","https://youtu.be/example1","फ्रांस की राजधानी क्या है?","पेरिस","लंदन","बर्लिन","मैड्रिड","पेरिस फ्रांस की राजधानी है","<p>पेरिस फ्रांस की राजधानी है।</p>","","https://example.com/france-map-hindi.jpg"`,
      `"${subjectId1}","Select all prime numbers:","multiple","2","3","4","5","","0,1,3","2","0.5","2, 3, and 5 are prime numbers","<p>Prime numbers are natural numbers greater than 1.</p>","","https://example.com/prime-numbers.jpg","","https://youtu.be/example2","सभी अभाज्य संख्याओं का चयन करें:","2","3","4","5","2, 3, और 5 अभाज्य संख्याएं हैं","<p>अभाज्य संख्याएं प्राकृतिक संख्याएं हैं।</p>","","https://example.com/prime-numbers-hindi.jpg"`,
      `"${subjectId2}","What is 2+2?","integer","","","","","4","","1","0","The answer is 4","<p>Addition is a basic arithmetic operation. 2 + 2 = 4</p>","","https://example.com/addition.jpg","https://example.com/math.jpg","","2+2 क्या है?","","","","","उत्तर 4 है","<p>जोड़ना एक बुनियादी अंकगणितीय संक्रिया है।</p>","","https://example.com/addition-hindi.jpg"`,
      `"${subjectId3}","What is the main theme of the passage?","single","Environmental protection","Economic growth","Social inequality","Technology advancement","0","","2","0","The passage discusses environmental protection as the main theme","<p>Based on the passage content, environmental protection is the central focus.</p>","<p>Climate change represents one of the most pressing challenges of our time. Governments worldwide must implement sustainable policies to protect our environment for future generations.</p>","","","","गद्यांश का मुख्य विषय क्या है?","पर्यावरण संरक्षण","आर्थिक विकास","सामाजिक असमानता","प्रौद्योगिकी प्रगति","गद्यांश पर्यावरण संरक्षण को मुख्य विषय के रूप में चर्चा करता है","<p>गद्यांश की सामग्री के आधार पर पर्यावरण संरक्षण केंद्रीय फोकस है।</p>","<p>जलवायु परिवर्तन हमारे समय की सबसे दबाव वाली चुनौतियों में से एक है। सरकारों को भविष्य की पीढ़ियों के लिए पर्यावरण की रक्षा के लिए टिकाऊ नीतियों को लागू करना चाहिए।</p>",""`
    ];
    
    const csvContent = [headers, ...sampleRows].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'question_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle file selection (CSV or Excel)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadFile(file);
    setCsvError(null);
    setCsvPreview([]);
    
    if (!file) return;
    
    // Determine file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType === 'csv') {
      setUploadFormat('csv');
      previewCsvFile(file);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      setUploadFormat('excel');
      previewExcelFile(file);
    } else {
      setCsvError("Invalid file format. Please upload a .csv, .xlsx, or .xls file.");
    }
  };

  // Preview CSV file
  const previewCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const preview = parseCsvPreview(csvData, 5); // Show 5 rows in preview
        setCsvPreview(preview);
      } catch (error) {
        setCsvError("Failed to parse CSV file. Please check the format.");
        console.error("CSV parsing error:", error);
      }
    };
    reader.readAsText(file);
  };

  // Preview Excel file
  const previewExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Extract headers and rows
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1, 6) as any[][]; // Get first 5 rows for preview
        
        // Format preview data
        const preview = rows.map(row => {
          const rowData: {[key: string]: any} = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index] || '';
          });
          return rowData;
        });
        
        setCsvPreview(preview);
      } catch (error) {
        setCsvError("Failed to parse Excel file. Please check the format.");
        console.error("Excel parsing error:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Process and upload questions from file
  const uploadQuestionsFromFile = async () => {
    if (!uploadFile || !selectedExam) {
      setCsvError("Please select a file and exam");
      return;
    }
    
    try {
      setUploadingCsv(true);
      setCsvError(null);
      setUploadProgress(0);
      
      // Process based on file type
      if (uploadFormat === 'csv') {
        await processAndUploadCsv(uploadFile);
      } else {
        await processAndUploadExcel(uploadFile);
      }
      
    } catch (error: any) {
      console.error("Error uploading questions:", error);
      setCsvError(error.message || "Failed to upload questions");
      setUploadingCsv(false);
    }
  };

  // Process CSV file and upload questions
  const processAndUploadCsv = async (file: File) => {
    const reader = new FileReader();
    
    return new Promise<void>((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const csvData = event.target?.result as string;
          const lines = csvData.split('\n');
          const headers = parseCSVLine(lines[0]);
          
          // Validate headers
          validateHeaders(headers);
          
          // Process each row
          const questions = [];
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const row = parseCSVLine(lines[i]);
            const questionData = processQuestionRow(headers, row);
            questions.push(questionData);
          }
          
          // Upload questions
          await uploadQuestions(questions);
          resolve();
          
        } catch (error: any) {
          console.error("Error processing CSV:", error);
          setCsvError(error.message || "Failed to process CSV file");
          reject(error);
        } finally {
          setUploadingCsv(false);
        }
      };
      
      reader.onerror = () => {
        setCsvError("Error reading file");
        setUploadingCsv(false);
        reject(new Error("Error reading file"));
      };
      
      reader.readAsText(file);
    });
  };

  // Process Excel file and upload questions
  const processAndUploadExcel = async (file: File) => {
    const reader = new FileReader();
    
    return new Promise<void>((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Extract headers and rows
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][]; // Skip header row
          
          // Validate headers
          validateHeaders(headers);
          
          // Process each row
          const questions = [];
          for (const row of rows) {
            if (row.length === 0 || !row[0]) continue; // Skip empty rows
            
            const questionData = processQuestionRow(headers, row);
            questions.push(questionData);
          }
          
          // Upload questions
          await uploadQuestions(questions);
          resolve();
          
        } catch (error: any) {
          console.error("Error processing Excel:", error);
          setCsvError(error.message || "Failed to process Excel file");
          reject(error);
        } finally {
          setUploadingCsv(false);
        }
      };
      
      reader.onerror = () => {
        setCsvError("Error reading file");
        setUploadingCsv(false);
        reject(new Error("Error reading file"));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Validate headers
  const validateHeaders = (headers: string[]) => {
    const requiredFields = ["question", "type", "subjectId"];
    for (const field of requiredFields) {
      if (!headers.includes(field)) {
        throw new Error(`File is missing required field: ${field}`);
      }
    }
  };

  // Process row data into question format
  const processQuestionRow = (headers: string[], row: any[]) => {
    const questionData: any = {
      examId: selectedExam,
      createdAt: new Date()
    };
    
    headers.forEach((header, index) => {
      if (row[index] !== undefined) {
        questionData[header] = row[index];
      }
    });

    // Validate subjectId is provided
    if (!questionData.subjectId) {
      throw new Error(`Missing subjectId for question: "${questionData.question || 'Unknown question'}"`);
    }
    
    // Process English options
    const options = [];
    for (let j = 1; j <= 8; j++) { // Support up to 8 options
      const option = questionData[`option${j}`];
      if (option) options.push(option);
      delete questionData[`option${j}`]; // Remove option fields
    }
    questionData.options = options;
    
    // Process Hindi options if they exist
    const optionsHindi = [];
    for (let j = 1; j <= 8; j++) { // Support up to 8 Hindi options
      const optionHindi = questionData[`option${j}Hindi`];
      if (optionHindi) optionsHindi.push(optionHindi);
      delete questionData[`option${j}Hindi`]; // Remove Hindi option fields
    }
    if (optionsHindi.length > 0) {
      questionData.optionsHindi = optionsHindi;
    }
    
    // Process correct answers
    if (questionData.type === "single") {
      // Ensure we have a valid number for correctAnswer
      const correctAnswer = parseInt(String(questionData.correctAnswer), 10);
      questionData.correctAnswer = isNaN(correctAnswer) ? 0 : correctAnswer;
    } else if (questionData.type === "multiple" && questionData.correctAnswers) {
      // Handle both comma-separated string and array formats
      let correctAnswers = questionData.correctAnswers;
      if (!Array.isArray(correctAnswers)) {
        correctAnswers = String(correctAnswers)
          .split(',')
          .map((index: string) => {
            const parsed = parseInt(index.trim(), 10);
            return isNaN(parsed) ? 0 : parsed;
          });
      }
      questionData.correctAnswers = correctAnswers;
      delete questionData.correctAnswer;
    } else if (questionData.type === "integer") {
      // Ensure we have a valid number for integer type
      const correctAnswer = parseInt(String(questionData.correctAnswer), 10);
      questionData.correctAnswer = isNaN(correctAnswer) ? 0 : correctAnswer;
      questionData.options = []; // No options for integer type
      questionData.optionsHindi = []; // No Hindi options for integer type
    }
    
    // Convert numerical fields with proper fallbacks
    const marks = parseFloat(String(questionData.marks));
    questionData.marks = isNaN(marks) ? 1 : marks;
    
    const negativeMark = parseFloat(String(questionData.negativeMark));
    questionData.negativeMark = isNaN(negativeMark) ? 0 : negativeMark;
    
    // Ensure solution fields are strings
    questionData.solution = questionData.solution || "";
    questionData.solutionHindi = questionData.solutionHindi || "";
    
    // Ensure image fields are strings
    questionData.questionImageUrl = questionData.questionImageUrl || "";
    questionData.questionImageUrlHindi = questionData.questionImageUrlHindi || "";
    
    console.log("Processed question:", questionData);
    
    return questionData;
  };

  // Upload questions to database
  const uploadQuestions = async (questions: any[]) => {
    // Validate questions
    const invalidQuestions = questions.filter(q => !validateQuestion(q));
    if (invalidQuestions.length > 0) {
      console.log("Invalid questions:", invalidQuestions);
      
      // Get detailed validation errors for the first few invalid questions
      const validationErrors = invalidQuestions.slice(0, 3).map(q => {
        return getValidationError(q);
      });
      
      throw new Error(`${invalidQuestions.length} questions are invalid. Common issues:\n${validationErrors.join('\n')}`);
    }

    // Validate all subjectIds exist in the database
    const uniqueSubjectIds = [...new Set(questions.map(q => q.subjectId))];
    const validSubjectIds = subjects.map(s => s.id);
    const invalidSubjectIds = uniqueSubjectIds.filter(id => !validSubjectIds.includes(id));
    
    if (invalidSubjectIds.length > 0) {
      throw new Error(`Invalid subject IDs found: ${invalidSubjectIds.join(', ')}. Please use valid subject IDs from the reference table above.`);
    }
    
    // Upload questions in batches
    const totalQuestions = questions.length;
    let uploadedCount = 0;
    
    // Group questions by subject for counting
    const questionsBySubject: {[subjectId: string]: any[]} = {};
    questions.forEach(question => {
      if (!questionsBySubject[question.subjectId]) {
        questionsBySubject[question.subjectId] = [];
      }
      questionsBySubject[question.subjectId].push(question);
    });
    
    // Using batched writes for better performance
    const batchSize = 25; // Firestore allows max 500 operations per batch
    
    for (let i = 0; i < totalQuestions; i += batchSize) {
      const batch = writeBatch(db);
      const currentBatch = questions.slice(i, i + batchSize);
      
      for (const question of currentBatch) {
        const docRef = doc(collection(db, "questions"));
        batch.set(docRef, question);
      }
      
      await batch.commit();
      uploadedCount += currentBatch.length;
      setUploadProgress(Math.floor((uploadedCount / totalQuestions) * 100));
    }
    
    // Update exam's total questions count
    const examRef = doc(db, "exams", selectedExam);
    await updateDoc(examRef, {
      totalQuestions: increment(totalQuestions)
    });
    
    // Update each subject's question count and total marks
    for (const [subjectId, subjectQuestions] of Object.entries(questionsBySubject)) {
      const subjectQuestionCount = subjectQuestions.length;
      const subjectTotalMarks = subjectQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
      
      const subjectRef = doc(db, "subjects", subjectId);
      await updateDoc(subjectRef, {
        totalQuestions: increment(subjectQuestionCount),
        totalMarks: increment(subjectTotalMarks)
      });
    }
    
    toast({
      title: "Success",
      description: `Successfully uploaded ${totalQuestions} questions`
    });
    
    // Reload questions
    loadQuestions();
    setShowFileUploadDialog(false);
    setUploadFile(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get specific validation error for a question
  const getValidationError = (question: any): string => {
    if (!question.question) {
      return `Missing question text: "${question.question || ''}"`;
    }
    
    if (!question.type || !["single", "multiple", "integer"].includes(question.type)) {
      return `Invalid question type: "${question.type}" for question "${truncateText(question.question)}"`;
    }
    
    if (question.type === "single") {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        return `Not enough options for single-choice question: "${truncateText(question.question)}"`;
      }
      
      if (typeof question.correctAnswer !== "number") {
        return `Invalid correctAnswer (not a number): "${question.correctAnswer}" for question "${truncateText(question.question)}"`;
      }
      
      if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        return `correctAnswer index out of range: ${question.correctAnswer} (options length: ${question.options.length}) for question "${truncateText(question.question)}"`;
      }
    } else if (question.type === "multiple") {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        return `Not enough options for multiple-choice question: "${truncateText(question.question)}"`;
      }
      
      if (!Array.isArray(question.correctAnswers)) {
        return `correctAnswers is not an array for question "${truncateText(question.question)}"`;
      }
      
      if (question.correctAnswers.length === 0) {
        return `No correct answers selected for multiple-choice question: "${truncateText(question.question)}"`;
      }
      
      const invalidIndex = question.correctAnswers.find((ans: number) => 
        ans < 0 || ans >= question.options.length
      );
      
      if (invalidIndex !== undefined) {
        return `correctAnswers contains invalid index: ${invalidIndex} (options length: ${question.options.length}) for question "${truncateText(question.question)}"`;
      }
    } else if (question.type === "integer") {
      if (typeof question.correctAnswer !== "number" || isNaN(question.correctAnswer)) {
        return `Invalid correctAnswer for integer question (must be a number): "${question.correctAnswer}" for question "${truncateText(question.question)}"`;
      }
    }
    
    return `Unknown validation error for question "${truncateText(question.question)}"`;
  };
  
  // Helper to truncate text for display
  const truncateText = (text: string, maxLength = 30): string => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Validate a question object
  const validateQuestion = (question: any): boolean => {
    console.log("Validating question:", question);
    
    if (!question.question) return false;
    
    if (!question.type || !["single", "multiple", "integer"].includes(question.type)) {
      return false;
    }
    
    if (question.type === "single") {
      return (
        Array.isArray(question.options) && 
        question.options.length >= 2 &&
        typeof question.correctAnswer === "number" &&
        !isNaN(question.correctAnswer) &&
        question.correctAnswer >= 0 &&
        question.correctAnswer < question.options.length
      );
    } else if (question.type === "multiple") {
      return (
        Array.isArray(question.options) &&
        question.options.length >= 2 &&
        Array.isArray(question.correctAnswers) &&
        question.correctAnswers.length > 0 &&
        question.correctAnswers.every((ans: number) => 
          typeof ans === "number" && 
          !isNaN(ans) && 
          ans >= 0 && 
          ans < question.options.length
        )
      );
    } else if (question.type === "integer") {
      return typeof question.correctAnswer === "number" && !isNaN(question.correctAnswer);
    }
    
    return false;
  };
  
  // Load questions function
  const loadQuestions = async () => {
    if (!selectedExam) return;
    
    try {
      setLoading(true);
      const questionsQuery = query(
        collection(db, "questions"),
        where("examId", "==", selectedExam)
      );
      const snapshot = await getDocs(questionsQuery);
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Parse CSV file preview
  const parseCsvPreview = (csvData: string, maxRows: number) => {
    const lines = csvData.split('\n');
    const headers = parseCSVLine(lines[0]);
    
    const preview = [];
    for (let i = 1; i < Math.min(lines.length, maxRows + 1); i++) {
      if (lines[i].trim()) {
        const row = parseCSVLine(lines[i]);
        const rowData: {[key: string]: string} = {};
        
        headers.forEach((header, index) => {
          rowData[header] = row[index] || '';
        });
        
        preview.push(rowData);
      }
    }
    
    return preview;
  };

  // Parse a CSV line handling quoted values with commas
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current); // Add the last field
    
    // Remove quotes from the beginning and end of each field
    return result.map(field => {
      if (field.startsWith('"') && field.endsWith('"')) {
        return field.substring(1, field.length - 1);
      }
      return field;
    });
  };

  // Don't render anything if user is not an admin
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Manage Questions</h1>

      <div className="mb-8 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="exam-select">Select Exam</Label>
            <Select
              value={selectedExam}
              onValueChange={(value) => {
                setSelectedExam(value);
                setSelectedSubject("");
              }}
            >
              <SelectTrigger id="exam-select">
                <SelectValue placeholder="Select an exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject-select">Select Subject</Label>
            <Select
              value={selectedSubject}
              onValueChange={setSelectedSubject}
              disabled={!selectedExam || subjects.length === 0}
            >
              <SelectTrigger id="subject-select">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              disabled={!selectedExam || !selectedSubject}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowFileUploadDialog(true)}
              disabled={!selectedExam}
              className="gap-2"
            >
              <FileUp className="h-4 w-4" />
              Bulk Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Questions list */}
      {loading && questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      ) : selectedExam && questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No questions found for this exam.</p>
          <p className="text-muted-foreground">Select a subject and click 'Add Question' to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{question.question}</CardTitle>
                    <CardDescription>
                      Type: {question.type} | Marks: {question.marks} | Negative Marks:{" "}
                      {question.negativeMark}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedQuestion(question);
                        setSelectedSubject(question.subjectId);
                        setFormData({
                          question: question.question,
                          type: question.type,
                          options: question.options || ["", "", "", ""],
                          correctAnswer: question.correctAnswer,
                          correctAnswers: question.correctAnswers,
                          explanation: question.explanation,
                          imageUrl: question.imageUrl,
                          youtubeUrl: question.youtubeUrl,
                          marks: question.marks,
                          negativeMark: question.negativeMark,
                          questionHindi: question.questionHindi,
                          optionsHindi: question.optionsHindi,
                          explanationHindi: question.explanationHindi,
                          solution: question.solution || "",
                          solutionHindi: question.solutionHindi || "",
                          questionImageUrl: question.questionImageUrl || "",
                          questionImageUrlHindi: question.questionImageUrlHindi || "",
                          comprehensionPassage: question.comprehensionPassage || "",
                          comprehensionPassageHindi: question.comprehensionPassageHindi || ""
                        });
                        // Clear image files when opening edit dialog
                        setQuestionImageFile(null);
                        setQuestionImageFileHindi(null);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {question.type !== "integer" ? (
                  <div className="space-y-2">
                    {question.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        className={`p-2 rounded-md ${
                          question.type === "single"
                            ? question.correctAnswer === index
                              ? "bg-green-100 dark:bg-green-900/20"
                              : "bg-muted"
                            : question.correctAnswers?.includes(index)
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-muted"
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
                    Correct Answer: {question.correctAnswer}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>Create a new question for this exam.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-4 py-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>
              
              {/* Comprehension Passage Editor */}
              <WysiwygEditor
                label="Comprehension Passage (Optional)"
                value={formData.comprehensionPassage || ""}
                onChange={(value) => setFormData({ ...formData, comprehensionPassage: value })}
                placeholder="Enter comprehension passage if this question is based on a reading passage..."
                height={250}
              />
              
              {/* Question Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="questionImage">Question Image (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="questionImage"
                    type="file"
                    accept="image/*"
                    onChange={handleQuestionImageChange}
                    className="flex-1"
                  />
                  {uploadingQuestionImage && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: max 2MB, common formats (JPG, PNG, WebP)
                </p>
                {renderImagePreview(questionImageFile, formData.questionImageUrl, () => setQuestionImageFile(null))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Question Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "single" | "multiple" | "integer") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Choice</SelectItem>
                    <SelectItem value="multiple">Multiple Choice</SelectItem>
                    <SelectItem value="integer">Integer Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type !== "integer" && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Switch
                        checked={
                          formData.type === "single"
                            ? formData.correctAnswer === index
                            : formData.correctAnswers?.includes(index)
                        }
                        onCheckedChange={(checked) => {
                          if (formData.type === "single") {
                            setFormData({ ...formData, correctAnswer: index });
                          } else {
                            const currentAnswers = formData.correctAnswers || [];
                            setFormData({
                              ...formData,
                              correctAnswers: checked
                                ? [...currentAnswers, index]
                                : currentAnswers.filter((i) => i !== index),
                            });
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {formData.type === "integer" && (
                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Correct Answer</Label>
                  <Input
                    id="correctAnswer"
                    type="number"
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })
                    }
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="negativeMark">Negative Marks</Label>
                <Input
                  id="negativeMark"
                  type="number"
                  value={formData.negativeMark}
                  onChange={(e) =>
                    setFormData({ ...formData, negativeMark: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Input
                  id="explanation"
                  value={formData.explanation || ""}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                />
              </div>
              
              {/* Solution field */}
              <WysiwygEditor
                label="Solution (Optional)"
                value={formData.solution || ""}
                onChange={(value) => setFormData({ ...formData, solution: value })}
                placeholder="Enter detailed solution..."
                height={200}
              />
              
              <div className="space-y-2">
                <Label htmlFor="questionImageUrl">Question Image URL (Optional)</Label>
                <Input
                  id="questionImageUrl"
                  value={formData.questionImageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, questionImageUrl: e.target.value })}
                  placeholder="https://example.com/question-image.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube URL (Optional)</Label>
                <Input
                  id="youtubeUrl"
                  value={formData.youtubeUrl || ""}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                />
              </div>
              
              {/* Hindi fields - Show only if subject supports both languages */}
              {subjects.find(s => s.id === selectedSubject)?.language === "both" && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-medium">Hindi Translation</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="questionHindi">Question (Hindi)</Label>
                    <Input
                      id="questionHindi"
                      value={formData.questionHindi || ""}
                      onChange={(e) => setFormData({ ...formData, questionHindi: e.target.value })}
                      placeholder="प्रश्न हिंदी में लिखें..."
                    />
                  </div>
                  
                  {/* Hindi Comprehension Passage Editor */}
                  <WysiwygEditor
                    label="Comprehension Passage (Hindi)"
                    value={formData.comprehensionPassageHindi || ""}
                    onChange={(value) => setFormData({ ...formData, comprehensionPassageHindi: value })}
                    placeholder="यदि यह प्रश्न किसी गद्यांश पर आधारित है तो गद्यांश हिंदी में लिखें..."
                    height={250}
                  />
                  
                  {formData.type !== "integer" && (
                    <div className="space-y-2">
                      <Label>Options (Hindi)</Label>
                      {formData.optionsHindi?.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) => {
                            const newOptionsHindi = [...(formData.optionsHindi || ["", "", "", ""])];
                            newOptionsHindi[index] = e.target.value;
                            setFormData({ ...formData, optionsHindi: newOptionsHindi });
                          }}
                          placeholder={`विकल्प ${index + 1} (हिंदी)`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="explanationHindi">Explanation (Hindi)</Label>
                    <Input
                      id="explanationHindi"
                      value={formData.explanationHindi || ""}
                      onChange={(e) => setFormData({ ...formData, explanationHindi: e.target.value })}
                      placeholder="व्याख्या हिंदी में..."
                    />
                  </div>
                  
                  {/* Hindi Solution field */}
                  <WysiwygEditor
                    label="Solution (Hindi)"
                    value={formData.solutionHindi || ""}
                    onChange={(value) => setFormData({ ...formData, solutionHindi: value })}
                    placeholder="विस्तृत समाधान हिंदी में लिखें..."
                    height={200}
                  />
                  
                  {/* Hindi Question Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="questionImageHindi">Question Image (Hindi)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="questionImageHindi"
                        type="file"
                        accept="image/*"
                        onChange={handleQuestionImageHindiChange}
                        className="flex-1"
                      />
                      {uploadingQuestionImageHindi && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: max 2MB, common formats (JPG, PNG, WebP)
                    </p>
                    {renderImagePreview(questionImageFileHindi, formData.questionImageUrlHindi, () => setQuestionImageFileHindi(null))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="questionImageUrlHindi">Question Image URL (Hindi)</Label>
                    <Input
                      id="questionImageUrlHindi"
                      value={formData.questionImageUrlHindi || ""}
                      onChange={(e) => setFormData({ ...formData, questionImageUrlHindi: e.target.value })}
                      placeholder="https://example.com/hindi-question-image.jpg"
                    />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-4 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateQuestion} disabled={loading}>
              {loading ? "Creating..." : "Create Question"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Update the question details.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-4 py-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="edit-question">Question</Label>
                <Input
                  id="edit-question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>
              
              {/* Comprehension Passage Editor */}
              <WysiwygEditor
                label="Comprehension Passage (Optional)"
                value={formData.comprehensionPassage || ""}
                onChange={(value) => setFormData({ ...formData, comprehensionPassage: value })}
                placeholder="Enter comprehension passage if this question is based on a reading passage..."
                height={250}
              />
              
              {/* Question Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="edit-questionImage">Question Image (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-questionImage"
                    type="file"
                    accept="image/*"
                    onChange={handleQuestionImageChange}
                    className="flex-1"
                  />
                  {uploadingQuestionImage && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: max 2MB, common formats (JPG, PNG, WebP)
                </p>
                {renderImagePreview(questionImageFile, formData.questionImageUrl, () => setQuestionImageFile(null))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-type">Question Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "single" | "multiple" | "integer") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Choice</SelectItem>
                    <SelectItem value="multiple">Multiple Choice</SelectItem>
                    <SelectItem value="integer">Integer Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type !== "integer" && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Switch
                        checked={
                          formData.type === "single"
                            ? formData.correctAnswer === index
                            : formData.correctAnswers?.includes(index)
                        }
                        onCheckedChange={(checked) => {
                          if (formData.type === "single") {
                            setFormData({ ...formData, correctAnswer: index });
                          } else {
                            const currentAnswers = formData.correctAnswers || [];
                            setFormData({
                              ...formData,
                              correctAnswers: checked
                                ? [...currentAnswers, index]
                                : currentAnswers.filter((i) => i !== index),
                            });
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {formData.type === "integer" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-correctAnswer">Correct Answer</Label>
                  <Input
                    id="edit-correctAnswer"
                    type="number"
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })
                    }
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-marks">Marks</Label>
                <Input
                  id="edit-marks"
                  type="number"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-negativeMark">Negative Marks</Label>
                <Input
                  id="edit-negativeMark"
                  type="number"
                  value={formData.negativeMark}
                  onChange={(e) =>
                    setFormData({ ...formData, negativeMark: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-explanation">Explanation (Optional)</Label>
                <Input
                  id="edit-explanation"
                  value={formData.explanation || ""}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                />
              </div>
              
              {/* Solution field */}
              <WysiwygEditor
                label="Solution (Optional)"
                value={formData.solution || ""}
                onChange={(value) => setFormData({ ...formData, solution: value })}
                placeholder="Enter detailed solution..."
                height={200}
              />
              
              <div className="space-y-2">
                <Label htmlFor="edit-questionImageUrl">Question Image URL (Optional)</Label>
                <Input
                  id="edit-questionImageUrl"
                  value={formData.questionImageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, questionImageUrl: e.target.value })}
                  placeholder="https://example.com/question-image.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-imageUrl">Image URL (Optional)</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-youtubeUrl">YouTube URL (Optional)</Label>
                <Input
                  id="edit-youtubeUrl"
                  value={formData.youtubeUrl || ""}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                />
              </div>
              
              {/* Hindi fields - Show only if subject supports both languages */}
              {subjects.find(s => s.id === selectedSubject)?.language === "both" && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-medium">Hindi Translation</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-questionHindi">Question (Hindi)</Label>
                    <Input
                      id="edit-questionHindi"
                      value={formData.questionHindi || ""}
                      onChange={(e) => setFormData({ ...formData, questionHindi: e.target.value })}
                      placeholder="प्रश्न हिंदी में लिखें..."
                    />
                  </div>
                  
                  {/* Hindi Comprehension Passage Editor */}
                  <WysiwygEditor
                    label="Comprehension Passage (Hindi)"
                    value={formData.comprehensionPassageHindi || ""}
                    onChange={(value) => setFormData({ ...formData, comprehensionPassageHindi: value })}
                    placeholder="यदि यह प्रश्न किसी गद्यांश पर आधारित है तो गद्यांश हिंदी में लिखें..."
                    height={250}
                  />
                  
                  {formData.type !== "integer" && (
                    <div className="space-y-2">
                      <Label>Options (Hindi)</Label>
                      {formData.optionsHindi?.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) => {
                            const newOptionsHindi = [...(formData.optionsHindi || ["", "", "", ""])];
                            newOptionsHindi[index] = e.target.value;
                            setFormData({ ...formData, optionsHindi: newOptionsHindi });
                          }}
                          placeholder={`विकल्प ${index + 1} (हिंदी)`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-explanationHindi">Explanation (Hindi)</Label>
                    <Input
                      id="edit-explanationHindi"
                      value={formData.explanationHindi || ""}
                      onChange={(e) => setFormData({ ...formData, explanationHindi: e.target.value })}
                      placeholder="व्याख्या हिंदी में..."
                    />
                  </div>
                  
                  {/* Hindi Solution field */}
                  <WysiwygEditor
                    label="Solution (Hindi)"
                    value={formData.solutionHindi || ""}
                    onChange={(value) => setFormData({ ...formData, solutionHindi: value })}
                    placeholder="विस्तृत समाधान हिंदी में लिखें..."
                    height={200}
                  />
                  
                  {/* Hindi Question Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-questionImageHindi">Question Image (Hindi)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-questionImageHindi"
                        type="file"
                        accept="image/*"
                        onChange={handleQuestionImageHindiChange}
                        className="flex-1"
                      />
                      {uploadingQuestionImageHindi && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: max 2MB, common formats (JPG, PNG, WebP)
                    </p>
                    {renderImagePreview(questionImageFileHindi, formData.questionImageUrlHindi, () => setQuestionImageFileHindi(null))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="questionImageUrlHindi">Question Image URL (Hindi)</Label>
                    <Input
                      id="questionImageUrlHindi"
                      value={formData.questionImageUrlHindi || ""}
                      onChange={(e) => setFormData({ ...formData, questionImageUrlHindi: e.target.value })}
                      placeholder="https://example.com/hindi-question-image.jpg"
                    />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-4 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditQuestion} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={showFileUploadDialog} onOpenChange={setShowFileUploadDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Bulk Upload Questions</DialogTitle>
            <DialogDescription>
              Upload questions in bulk using CSV or Excel files. Each question must include a subjectId (get subject IDs from your exam's subjects list). Download a template to see the required format including new fields like comprehension passages in both English and Hindi.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 overflow-y-auto py-4">
            {/* Subjects Reference */}
            {subjects.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Available Subject IDs for this exam:</h3>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex justify-between">
                      <span className="font-medium">{subject.name}</span>
                      <code className="bg-background px-1 rounded">{subject.id}</code>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Copy the Subject ID (not the name) into your CSV/Excel file under the "subjectId" column.
                </p>
              </div>
            )}

            <Tabs defaultValue="csv" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv">CSV Format</TabsTrigger>
                <TabsTrigger value="excel">Excel Format</TabsTrigger>
              </TabsList>
              
              <TabsContent value="csv" className="mt-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">CSV File Format</h3>
                    <p className="text-xs text-muted-foreground">
                      CSV format with the required columns for adding questions
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateCsvTemplate}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Download CSV Template
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="excel" className="mt-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Excel File Format</h3>
                    <p className="text-xs text-muted-foreground">
                      Excel spreadsheet format for adding questions
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateExcelTemplate}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Download Excel Template
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="grid gap-2 mt-4">
              <Label htmlFor="question-file">Upload Questions File</Label>
              <Input
                ref={fileInputRef}
                id="question-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Supported file types: CSV (.csv) and Excel (.xlsx, .xls)
              </p>
              <div className="text-xs flex flex-wrap gap-x-3 gap-y-1 mt-1">
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  <span>Single choice questions</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  <span>Multiple choice questions</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  <span>Integer type questions</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  <span>Bilingual support (English + Hindi)</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  <span>Comprehension passages</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  <span>Rich text solutions</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  <span>Multiple subjects per exam</span>
                </div>
              </div>
            </div>
            
            {uploadError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            
            {filePreview.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium">Preview (first {filePreview.length} rows):</h3>
                <div className="border rounded-md overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        {Object.keys(filePreview[0]).slice(0, 5).map((header, i) => (
                          <th key={i} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filePreview.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).slice(0, 5).map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-xs truncate max-w-[200px]">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Only showing the first 5 columns. Full data will be uploaded.
                </p>
              </div>
            )}
            
            {uploadingFile && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading questions...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFileUploadDialog(false)}>Cancel</Button>
            <Button 
              onClick={uploadQuestionsFromFile} 
              disabled={!uploadFile || uploadingFile || !selectedExam}
              className="gap-2"
            >
              {uploadingFile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Upload Questions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}