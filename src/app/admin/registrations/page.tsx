"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Download, 
  Search, 
  UsersRound, 
  Calendar, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

// Type for registration
type Registration = {
  id: string;
  examId: string;
  examTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: Date;
  status: string;
};

// Type for exam
type Exam = {
  id: string;
  title: string;
  startDate: Date;
  registrationCount?: number;
};

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const { user, exams } = useExam();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [examsList, setExamsList] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("upcoming");
  
  // Load registrations on component mount
  useEffect(() => {
    loadRegistrations();
  }, []);
  
  // Filter registrations when filters change
  useEffect(() => {
    filterRegistrations();
  }, [registrations, selectedExamId, searchQuery, currentTab]);
  
  // Load all registrations from Firestore
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      
      // Get all registrations
      const registrationsQuery = query(
        collection(db, "examRegistrations"),
        orderBy("registeredAt", "desc")
      );
      
      const registrationsSnapshot = await getDocs(registrationsQuery);
      
      const registrationsData = registrationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registeredAt: data.registeredAt?.toDate() || new Date()
        } as Registration;
      });
      
      setRegistrations(registrationsData);
      
      // Extract unique exams from registrations
      const uniqueExams = new Map<string, Exam>();
      
      for (const registration of registrationsData) {
        if (!uniqueExams.has(registration.examId)) {
          const examData = exams.find(e => e.id === registration.examId);
          
          uniqueExams.set(registration.examId, {
            id: registration.examId,
            title: registration.examTitle || "Unknown Exam",
            startDate: examData?.startDate || new Date(),
            registrationCount: 1
          });
        } else {
          const exam = uniqueExams.get(registration.examId);
          if (exam) {
            exam.registrationCount = (exam.registrationCount || 0) + 1;
          }
        }
      }
      
      // Sort exams by date
      const examsList = Array.from(uniqueExams.values()).sort((a, b) => {
        return a.startDate.getTime() - b.startDate.getTime();
      });
      
      setExamsList(examsList);
      
    } catch (error) {
      console.error("Error loading registrations:", error);
      toast({
        title: "Error",
        description: "Failed to load registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter registrations based on current filters
  const filterRegistrations = () => {
    let filtered = [...registrations];
    
    // Filter by exam if selected
    if (selectedExamId !== "all") {
      filtered = filtered.filter(reg => reg.examId === selectedExamId);
    }
    
    // Apply search filter if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.userName.toLowerCase().includes(query) || 
        reg.userEmail?.toLowerCase().includes(query)
      );
    }
    
    // Filter by exam status
    if (currentTab === "upcoming") {
      // Get upcoming exams
      const upcomingExamIds = examsList
        .filter(exam => exam.startDate > new Date())
        .map(exam => exam.id);
      
      filtered = filtered.filter(reg => upcomingExamIds.includes(reg.examId));
    } else if (currentTab === "ongoing") {
      // Get ongoing exams
      const now = new Date();
      const ongoingExamIds = exams
        .filter(exam => {
          const startDate = exam.startDate instanceof Date ? 
            exam.startDate : 
            (exam.startDate ? new Date(exam.startDate) : new Date());
          
          const endDate = exam.endDate instanceof Date ? 
            exam.endDate : 
            (exam.endDate ? new Date(exam.endDate) : new Date());
          
          return startDate <= now && endDate >= now;
        })
        .map(exam => exam.id);
      
      filtered = filtered.filter(reg => ongoingExamIds.includes(reg.examId));
    } else if (currentTab === "completed") {
      // Get completed exams
      const now = new Date();
      const completedExamIds = exams
        .filter(exam => {
          const endDate = exam.endDate instanceof Date ? 
            exam.endDate : 
            (exam.endDate ? new Date(exam.endDate) : new Date());
          
          return endDate < now;
        })
        .map(exam => exam.id);
      
      filtered = filtered.filter(reg => completedExamIds.includes(reg.examId));
    }
    
    setFilteredRegistrations(filtered);
  };
  
  // Download registrations as CSV
  const downloadAsCSV = () => {
    // Only export currently filtered registrations
    const dataToExport = filteredRegistrations;
    
    if (dataToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no registrations matching your current filters",
        variant: "destructive",
      });
      return;
    }
    
    // CSV Headers
    const headers = [
      "Student Name", 
      "Email", 
      "Exam", 
      "Registration Date", 
      "Status"
    ];
    
    // Format data for CSV
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(reg => [
        `"${reg.userName}"`,
        `"${reg.userEmail}"`,
        `"${reg.examTitle}"`,
        `"${reg.registeredAt.toLocaleString()}"`,
        `"${reg.status}"`
      ].join(","))
    ].join("\n");
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `exam-registrations-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Group registrations by exam
  const getRegistrationsByExam = () => {
    const grouped = new Map<string, Registration[]>();
    
    for (const registration of filteredRegistrations) {
      if (!grouped.has(registration.examId)) {
        grouped.set(registration.examId, []);
      }
      
      grouped.get(registration.examId)?.push(registration);
    }
    
    return grouped;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading registrations...</p>
        </div>
      </div>
    );
  }
  
  const groupedRegistrations = getRegistrationsByExam();
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Exam Registrations</h2>
          <p className="text-muted-foreground text-sm">
            Manage and view pre-registrations for exams
          </p>
        </div>
        
        <Button variant="outline" onClick={downloadAsCSV} disabled={filteredRegistrations.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue="upcoming" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="all">All Registrations</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing Exams</TabsTrigger>
            <TabsTrigger value="completed">Completed Exams</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-[280px]">
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              {examsList.map(exam => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title} ({exam.registrationCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
          <h3 className="mt-4 text-lg font-semibold">No registrations found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedExamId !== "all" 
              ? "Try adjusting your filters or search query"
              : "No students have registered for exams yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-2 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredRegistrations.length} registration{filteredRegistrations.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {Array.from(groupedRegistrations.entries()).map(([examId, examRegistrations]) => {
            // Get exam details
            const examDetails = examsList.find(e => e.id === examId);
            
            return (
              <Card key={examId} className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{examDetails?.title || 'Unknown Exam'}</CardTitle>
                    <Badge>
                      {examRegistrations.length} Registration{examRegistrations.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {examDetails?.startDate.toLocaleDateString() || 'Unknown Date'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registration Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examRegistrations.map(registration => (
                          <TableRow key={registration.id}>
                            <TableCell className="font-medium">{registration.userName}</TableCell>
                            <TableCell>{registration.userEmail}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {registration.registeredAt.toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(registration.registeredAt, { addSuffix: true })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {registration.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
} 