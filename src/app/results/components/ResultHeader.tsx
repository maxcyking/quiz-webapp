import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, PartyPopper, Check } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ResultHeaderProps {
  exam: any;
  userRank: any;
  showRewards: boolean;
  rewardStatus: {[rewardId: string]: 'pending' | 'claimed' | 'processing'};
  userRewardId: string | null;
  navigate: (path: string) => void;
}

export default function ResultHeader({ 
  exam, 
  userRank, 
  showRewards, 
  rewardStatus, 
  userRewardId,
  navigate 
}: ResultHeaderProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Copy to clipboard function
  const copyToClipboard = () => {
    if (linkInputRef.current) {
      linkInputRef.current.select();
      document.execCommand('copy');
      
      // Use Clipboard API if available (more modern)
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Exam link has been copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between mb-8">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{exam.title} Results</h1>
        <p className="text-sm md:text-base text-muted-foreground line-clamp-2">{exam.description}</p>
      </div>
      
      {/* Already claimed reward notification */}
      {showRewards && userRank?.reward && (rewardStatus[userRewardId || ''] === 'claimed' || rewardStatus[userRewardId || ''] === 'processing') && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-sm">
          <Check className="h-4 w-4" />
          <span>Reward Claimed</span>
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-green-700 dark:text-green-400"
            onClick={() => navigate('/profile?tab=rewards')}
          >
            View
          </Button>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          onClick={copyToClipboard}
        >
          <Share2 className="h-4 w-4" />
          Share Results
        </Button>
        <input 
          ref={linkInputRef}
          type="text"
          value={window.location.href} 
          className="sr-only"
          readOnly
          aria-label="Share link for exam results"
        />
          
        
        <Button 
          variant="outline" 
          size="sm" 
          asChild
        >
          <Link href="/results">Back to Results</Link>
        </Button>
      </div>
    </div>
  );
}