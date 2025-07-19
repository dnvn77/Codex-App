
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff, LogOut, AlertTriangle } from 'lucide-react';
import { unlockWallet, importWalletFromSeed, bip39Wordlist } from '@/lib/wallet';
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

const WordInput = ({
  index,
  value,
  onChange,
  onPaste,
}: {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="relative">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{index + 1}</span>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        onPaste={onPaste}
        className="pl-6 text-center"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />
    </div>
  );
};

export function LockView({ storedWallet, onWalletUnlocked, onDisconnect, onWalletConnected }: LockViewProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isRecoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('enterSeed');
  const [recoverySeedPhrase, setRecoverySeedPhrase] = useState(Array(12).fill(''));
  
  const t = useTranslations();
  const { toast } = useToast();

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

  const handleForgotPassword = () => {
    setRecoveryOpen(true);
  };

  const handleVerifySeedPhrase = async () => {
    const seedPhrase = recoverySeedPhrase.join(' ').trim();
    if (recoverySeedPhrase.some(w => !w)) {
      toast({ title: t.error, description: t.enterAllWords, variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      const wallet = await importWalletFromSeed(seedPhrase);
      // We must verify that the imported wallet's address matches the locked wallet's address.
      if (wallet.address === storedWallet.address) {
        setRecoveryStep('resetPassword');
      } else {
        toast({ title: t.error, description: t.seedPhraseMismatch, variant: 'destructive' });
      }
    } catch(err) {
      toast({ title: t.importErrorTitle, description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...recoverySeedPhrase];
    if (/^[a-zA-Z]*$/.test(value)) {
      newWords[index] = value.trim().toLowerCase();
    }
    setRecoverySeedPhrase(newWords);
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').toLowerCase();
    
    if (!/^[a-z\s]*$/.test(pastedText)) {
      toast({
        title: t.invalidInputTitle,
        description: t.invalidInputDesc,
        variant: "destructive",
      });
      return;
    }

    const words = pastedText.trim().split(/\s+/);
    
    if (words.length === 12) {
      setRecoverySeedPhrase(words);
    } else {
      toast({
        title: t.invalidPasteTitle,
        description: t.invalidPasteDesc(words.length),
        variant: "destructive",
      });
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
        setRecoverySeedPhrase(Array(12).fill(''));
        setIsLoading(false);
        setError('');
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
        <DialogContent className="sm:max-w-md">
            {recoveryStep === 'enterSeed' && (
              <>
                <DialogHeader>
                  <DialogTitle>{t.recoverWalletTitle}</DialogTitle>
                  <DialogDescription>{t.recoverWalletDesc}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                   <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{t.recoverWalletWarning}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">{t.secretPhraseWordsLabel}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                      {recoverySeedPhrase.map((word, index) => (
                        <WordInput
                          key={index}
                          index={index}
                          value={word}
                          onChange={handleWordChange}
                          onPaste={handlePaste}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t.pasteDisclaimer}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseRecovery}>{t.cancelButton}</Button>
                  <Button onClick={handleVerifySeedPhrase} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : t.verifyButton}
                  </Button>
                </DialogFooter>
              </>
            )}
            {recoveryStep === 'resetPassword' && (
                <ConnectView 
                    isRecoveryMode={true} 
                    onPasswordReset={handlePasswordReset}
                    recoverySeedPhrase={recoverySeedPhrase.join(' ')}
                    onWalletConnected={onWalletConnected}
                />
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
