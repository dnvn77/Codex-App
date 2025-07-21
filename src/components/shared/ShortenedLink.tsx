
"use client";

import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ShortenedLinkProps {
  fullUrl: string;
  displayPrefix: string;
  t: any;
}

export function ShortenedLink({ fullUrl, displayPrefix, t }: ShortenedLinkProps) {
  const { toast } = useToast();
  const hash = fullUrl.split('/').pop() || '';
  const shortenedHash = `${hash.slice(0, 6)}...${hash.slice(-6)}`;
  const displayUrl = `${displayPrefix}${shortenedHash}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: t.linkCopied,
      duration: 2000,
    });
  }

  return (
    <div className="flex items-center justify-between w-full p-3 rounded-lg bg-secondary/50">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-primary">{displayUrl}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href={fullUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
