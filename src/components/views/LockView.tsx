
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import { unlockWallet } from '@/lib/wallet';
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

interface LockViewProps {
  storedWallet: StoredWallet;
  onWalletUnlocked: (wallet: Wallet) => void;
  onDisconnect: () => void;
  onWalletConnected: (wallet: Wallet) => void; // Used for password reset
}

type RecoveryStep = 'start' | 'confirmSeed' | 'resetPassword';

export function LockView({ storedWallet, onWalletUnlocked, onDisconnect, onWalletConnected }: LockViewProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isRecoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('start');
  const [recoverySeedPhrase, setRecoverySeedPhrase] = useState('');
  const [confirmationWords, setConfirmationWords] = useState<string[]>(['', '', '']);
  const [confirmationErrors, setConfirmationErrors] = useState<string[]>(['', '', '']);
  const [randomWordIndices, setRandomWordIndices] = useState<number[]>([]);
  
  const t = useTranslations();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError('');

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
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    setError('');
    // This is a temporary measure for the demo. 
    // In a real app, you would not expose the seed phrase like this.
    const tempPassword = prompt("DEBUG: To start recovery, please enter your current password to get the seed phrase for the confirmation step.");
    if (!tempPassword) {
        setIsLoading(false);
        return;
    }
    
    try {
        const wallet = await unlockWallet(tempPassword);
        if (wallet && wallet.seedPhrase) {
            setRecoverySeedPhrase(wallet.seedPhrase);
            const indices = new Set<number>();
            while (indices.size < 3) {
              indices.add(Math.floor(Math.random() * wallet.seedPhrase.split(' ').length));
            }
            setRandomWordIndices(Array.from(indices).sort((a,b) => a - b));
            setRecoveryStep('confirmSeed');
            setRecoveryOpen(true);
        } else {
            alert("Wrong password. Cannot initiate recovery flow for this demo.");
        }
    } catch (e) {
        alert("Wrong password. Cannot initiate recovery flow for this demo.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleConfirmRecoverySeed = () => {
    if (!recoverySeedPhrase) return;
    const correctWords = recoverySeedPhrase.split(' ');
    const newErrors = ['', '', ''];
    let allCorrect = true;

    randomWordIndices.forEach((wordIndex, arrayIndex) => {
      if (confirmationWords[arrayIndex].trim().toLowerCase() !== correctWords[wordIndex].toLowerCase()) {
        newErrors[arrayIndex] = t.incorrectWordError;
        allCorrect = false;
      }
    });
    
    setConfirmationErrors(newErrors);

    if (allCorrect) {
      setRecoveryStep('resetPassword');
    }
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

  const handlePasswordReset = (wallet: Wallet) => {
    setRecoveryOpen(false);
    // Reset state after closing
    setTimeout(() => {
        setRecoveryStep('start');
        setRecoverySeedPhrase('');
        setConfirmationWords(['','','']);
        setConfirmationErrors(['','','']);
    }, 300);
    onWalletUnlocked(wallet);
  }

  const handleCloseRecovery = () => {
    setRecoveryOpen(false);
     setTimeout(() => {
        setRecoveryStep('start');
        setRecoverySeedPhrase('');
        setConfirmationWords(['','','']);
        setConfirmationErrors(['','','']);
    }, 300);
  }

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
             <button type="button" onClick={handleForgotPassword} className="text-sm text-primary hover:underline" disabled={isLoading}>
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
        <DialogContent>
            {recoveryStep === 'confirmSeed' && (
              <>
                <DialogHeader>
                  <DialogTitle>{t.confirmPhraseTitle}</DialogTitle>
                  <DialogDescription>{t.confirmPhraseToResetDesc}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  {randomWordIndices.map((wordIndex, arrayIndex) => (
                    <div key={wordIndex}>
                      <Label htmlFor={`recovery-confirmationWord-${arrayIndex}`} className="font-semibold">
                        {t.enterWordLabel(wordIndex + 1)}
                      </Label>
                      <Input
                        id={`recovery-confirmationWord-${arrayIndex}`}
                        value={confirmationWords[arrayIndex]}
                        onChange={(e) => handleConfirmationWordChange(arrayIndex, e.target.value)}
                        className="mt-1 text-base"
                        autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck="false"
                      />
                      {confirmationErrors[arrayIndex] && (
                        <p className="text-destructive text-sm mt-1">{confirmationErrors[arrayIndex]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseRecovery}>{t.cancelButton}</Button>
                  <Button onClick={handleConfirmRecoverySeed} disabled={confirmationWords.some(w => !w)}>{t.continueButton}</Button>
                </DialogFooter>
              </>
            )}
            {recoveryStep === 'resetPassword' && (
                <ConnectView 
                    isRecoveryMode={true} 
                    onPasswordReset={handlePasswordReset}
                    recoverySeedPhrase={recoverySeedPhrase}
                    onWalletConnected={onWalletConnected}
                />
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
