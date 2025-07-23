export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt?: Date;
  examCount?: number;
  thumbnailUrl?: string;
  // New fields for subcategories and enhanced features
  parentCategoryId?: string; // For subcategories
  type?: 'main' | 'sub'; // Category type
  slug?: string; // URL-friendly version
  metadata?: {
    totalExams: number;
    activeExams: number;
    totalStudents: number;
    averageScore: number;
    featuredExams: string[]; // Array of exam IDs
  };
  // PYP specific fields
  pypConfig?: {
    hasYearlyPapers: boolean;
    availableYears: number[];
    paperTypes: string[]; // e.g., ['prelims', 'mains', 'interview']
  };
}

export interface CategoryStats {
  totalExams: number;
  activeExams: number;
  totalStudents: number;
  averageScore: number;
}

export interface PreviousYearPaper {
  id: string;
  title: string;
  categoryId: string;
  subcategoryId?: string;
  year: number;
  examDate: Date;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  paperType: 'prelims' | 'mains' | 'interview' | 'practice';
  difficulty: 'easy' | 'medium' | 'hard';
  downloadUrl?: string;
  previewUrl?: string;
  isActive: boolean;
  downloadCount: number;
  viewCount: number;
  rating: number;
  createdAt: Date;
  updatedAt?: Date;
  tags: string[];
  subjects: {
    id: string;
    name: string;
    questionCount: number;
    marks: number;
  }[];
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
  stats: CategoryStats;
}