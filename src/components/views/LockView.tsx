
"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff, LogOut, AlertTriangle } from 'lucide-react';
import { unlockWallet, verifyWordsFromPassword } from '@/lib/wallet';
import type { Wallet, StoredWallet } from '@/lib/types';
import { useTranslations } from '@/hooks/useTranslations';
import { ConnectView } from './ConnectView';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";

interface LockViewProps {
  storedWallet: StoredWallet;
  onWalletUnlocked: (wallet: Wallet) => void;
  onDisconnect: () => void;
  onWalletConnected: (wallet: Wallet) => void; // Used for password reset
}

type RecoveryStep = 'enterSeed' | 'resetPassword';

export function LockView({ storedWallet, onWalletUnlocked, onDisconnect, onWalletConnected }: LockViewProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordAttempted, setPasswordAttempted] = useState(false);
  
  const [isRecoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('enterSeed');
  
  const [confirmationWords, setConfirmationWords] = useState<string[]>(['', '', '']);
  const [confirmationErrors, setConfirmationErrors] = useState<string[]>(['', '', '']);
  
  // Memoize to keep indices stable across re-renders
  const randomWordIndices = useMemo(() => {
    const indices = new Set<number>();
    while (indices.size < 3) {
      indices.add(Math.floor(Math.random() * 12));
    }
    return Array.from(indices).sort((a, b) => a - b);
  }, []);

  const [fullSeedForReset, setFullSeedForReset] = useState<string | null>(null);
  
  const t = useTranslations();
  const { toast } = useToast();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError('');
    setPasswordAttempted(false);

    // Simulate delay for effect
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const unlockedWallet = await unlockWallet(password);
        if (unlockedWallet) {
          onWalletUnlocked(unlockedWallet);
        } else {
          throw new Error("Unlock failed");
        }
    } catch {
      setError(t.wrongPasswordError);
      setPasswordAttempted(true); // Enable forgot password link after a failed attempt
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setRecoveryOpen(true);
  };
  
  const handleConfirmationWordChange = (index: number, value: string) => {
    const newWords = [...confirmationWords];
    newWords[index] = value;
    setConfirmationWords(newWords);

    const newErrors = [...confirmationErrors];
    if (newErrors[index]) {
      newErrors[index] = '';
      setConfirmationErrors(newErrors);
    }
  };

  const handleVerifySeedWords = async () => {
    setIsLoading(true);
    setConfirmationErrors(['', '', '']);

    const wordsToVerify = randomWordIndices.map((wordIndex, arrayIndex) => ({
      index: wordIndex,
      word: confirmationWords[arrayIndex].trim().toLowerCase(),
    }));

    try {
      const result = await verifyWordsFromPassword(password, wordsToVerify);
      if (result.success) {
        setFullSeedForReset(result.seedPhrase);
        setRecoveryStep('resetPassword');
      } else {
        toast({ title: t.error, description: t.seedPhraseMismatch, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: t.error, description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = (wallet: Wallet) => {
    handleCloseRecovery();
    onWalletUnlocked(wallet);
  }

  const handleCloseRecovery = () => {
    setRecoveryOpen(false);
     setTimeout(() => {
        setRecoveryStep('enterSeed');
        setConfirmationWords(['', '', '']);
        setConfirmationErrors(['', '', '']);
        setFullSeedForReset(null);
        setIsLoading(false);
        setError('');
    }, 300);
  }
  
  const isConfirmationDisabled = confirmationWords.some(word => word.trim() === '');
  const truncatedAddress = `${storedWallet.address.slice(0, 6)}...${storedWallet.address.slice(-4)}`;

  return (
    <>
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
              {error && <p className="text-sm font-medium text-destructive mt-1">{error}</p>}
            </div>
             <button 
                type="button" 
                onClick={handleForgotPassword} 
                className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed" 
                disabled={isLoading || !passwordAttempted}
              >
                {t.forgotPasswordLink}
             </button>
          </CardContent>
          <CardFooter className="flex-col gap-4">
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
            <div className="flex items-center justify-between w-full text-xs text-muted-foreground border-t pt-3 mt-2">
                <span className="font-mono">{truncatedAddress}</span>
                <button type='button' onClick={onDisconnect} className="flex items-center gap-1.5 hover:text-destructive">
                    <LogOut size={14}/>
                    {t.disconnectButton}
                </button>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <Dialog open={isRecoveryOpen} onOpenChange={handleCloseRecovery}>
        <DialogContent className="sm:max-w-md">
            {recoveryStep === 'enterSeed' && (
              <>
                <DialogHeader>
                  <DialogTitle>{t.recoverWalletTitle}</DialogTitle>
                  <DialogDescription>{t.confirmPhraseDesc}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div><p>{t.recoverWalletWarning}</p></div>
                  </div>

                  {randomWordIndices.map((wordIndex, arrayIndex) => (
                    <div key={wordIndex}>
                      <Label htmlFor={`confirmationWord-${arrayIndex}`} className="font-semibold">
                        {t.enterWordLabel(wordIndex + 1)}
                      </Label>
                      <Input
                        id={`confirmationWord-${arrayIndex}`}
                        value={confirmationWords[arrayIndex]}
                        onChange={(e) => handleConfirmationWordChange(arrayIndex, e.target.value)}
                        className="mt-1 text-base"
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                      {confirmationErrors[arrayIndex] && (
                        <p className="text-destructive text-sm mt-1">{confirmationErrors[arrayIndex]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseRecovery}>{t.cancelButton}</Button>
                  <Button onClick={handleVerifySeedWords} disabled={isLoading || isConfirmationDisabled}>
                    {isLoading ? <Loader2 className="animate-spin" /> : t.verifyButton}
                  </Button>
                </DialogFooter>
              </>
            )}
            {recoveryStep === 'resetPassword' && fullSeedForReset && (
                <ConnectView 
                    isRecoveryMode={true} 
                    onPasswordReset={handlePasswordReset}
                    recoverySeedPhrase={fullSeedForReset}
                    onWalletConnected={onWalletConnected} // This prop is required by ConnectView
                />
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}

    