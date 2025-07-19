
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { unlockWallet } from '@/lib/wallet';
import type { Wallet } from '@/lib/types';
import { useTranslations } from '@/hooks/useTranslations';

interface LockViewProps {
  onWalletUnlocked: (wallet: Wallet) => void;
}

export function LockView({ onWalletUnlocked }: LockViewProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError('');

    // Simulate delay for effect
    await new Promise(resolve => setTimeout(resolve, 500));

    const unlockedWallet = await unlockWallet(password);
    
    if (unlockedWallet) {
      onWalletUnlocked(unlockedWallet);
    } else {
      setError(t.wrongPasswordError);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg">
      <form onSubmit={handleUnlock}>
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>{t.unlockWalletTitle}</CardTitle>
          <CardDescription>{t.unlockWalletDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">{t.passwordLabel}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="********"
                disabled={isLoading}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || !password}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.unlockingButton}
              </>
            ) : (
              t.unlockButton
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
