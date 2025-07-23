import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useExam } from '../context/exam-context';

export function usePrefetchExams() {
  const location = usePathname();
  const { user } = useExam();

  useEffect(() => {
    if (!user) return;

    // Next.js will handle component loading automatically
    
  }, [location, user]);
}