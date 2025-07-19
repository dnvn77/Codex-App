
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff, LogOut, AlertTriangle } from 'lucide-react';
import { unlockWallet, verifySeedPhrase, bip39Wordlist } from '@/lib/wallet';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";

interface LockViewProps {
  storedWallet: StoredWallet;
  onWalletUnlocked: (wallet: Wallet) => void;
  onDisconnect: () => void;
  onWalletConnected: (wallet: Wallet) => void; // Used for password reset
}

type RecoveryStep = 'enterSeed' | 'resetPassword';
type SeedLength = 12 | 15 | 18 | 24;

const WordInput = ({
  index,
  value,
  onChange,
  onPaste,
  onSuggestionClick,
}: {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onSuggestionClick: (index: number, word: string) => void;
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typedValue = e.target.value.toLowerCase();
    onChange(index, typedValue);
    if (typedValue.length > 1) {
      const filtered = bip39Wordlist.filter(word => word.startsWith(typedValue));
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestion = (word: string) => {
    onSuggestionClick(index, word);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{index + 1}</span>
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        onPaste={onPaste}
        className="pl-6 text-center"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        onBlur={() => setTimeout(() => setSuggestions([]), 100)} // Hide on blur
      />
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-32 overflow-y-auto">
          {suggestions.map(word => (
            <div
              key={word}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
              onMouseDown={() => handleSuggestion(word)}
            >
              {word}
            </div>
          ))}
        </div>
      )}
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
  
  const [seedLength, setSeedLength] = useState<SeedLength>(12);
  const [seedWords, setSeedWords] = useState<string[]>(Array(12).fill(''));
  
  const [fullSeedForReset, setFullSeedForReset] = useState<string | null>(null);
  
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
  
  const handleWordChange = (index: number, value: string) => {
    const newWords = [...seedWords];
    if (/^[a-zA-Z]*$/.test(value)) {
        newWords[index] = value.trim().toLowerCase();
    }
    setSeedWords(newWords);
  };
  
  const handleSuggestionClick = (index: number, word: string) => {
    const newWords = [...seedWords];
    newWords[index] = word;
    setSeedWords(newWords);
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
    
    if (words.length === 12 || words.length === 15 || words.length === 18 || words.length === 24) {
      const newLength = words.length as SeedLength;
      setSeedLength(newLength);
      setSeedWords(words);
    } else {
      toast({
        title: t.invalidPasteTitle,
        description: t.invalidPasteDesc(words.length),
        variant: "destructive",
      });
    }
  };


  const handleVerifySeed = async () => {
    setIsLoading(true);
    const phrase = seedWords.join(' ');
    
    try {
      const isValid = await verifySeedPhrase(phrase, storedWallet.address);
      if (isValid) {
        setFullSeedForReset(phrase);
        setRecoveryStep('resetPassword');
      } else {
        toast({
          title: t.importErrorTitle,
          description: t.seedPhraseMismatch,
          variant: 'destructive',
        });
      }
    } catch (error) {
       toast({
          title: t.importErrorTitle,
          description: (error as Error).message,
          variant: 'destructive',
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = (wallet: Wallet) => {
    handleCloseRecovery();
    onWalletUnlocked(wallet);
  }
  
  const handleSeedLengthChange = (value: string) => {
    const length = parseInt(value, 10) as SeedLength;
    setSeedLength(length);
    setSeedWords(Array(length).fill(''));
  };

  const handleCloseRecovery = () => {
    setRecoveryOpen(false);
     setTimeout(() => {
        setRecoveryStep('enterSeed');
        setSeedWords(Array(12).fill(''));
        setSeedLength(12);
        setFullSeedForReset(null);
        setIsLoading(false);
        setError('');
    }, 300);
  }
  
  const isImportDisabled = seedWords.some(word => word.trim() === '');
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
                onClick={() => setRecoveryOpen(true)}
                className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed" 
                disabled={isLoading}
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
                  <DialogDescription>{t.recoverWalletDesc}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-bold">{t.securityWarningTitle}</p>
                            <p>{t.recoverWalletWarning}</p>
                        </div>
                    </div>
            
                    <div>
                        <Label className="mb-2 block">{t.seedPhraseLengthLabel}</Label>
                        <RadioGroup defaultValue="12" onValueChange={handleSeedLengthChange} value={String(seedLength)} className="flex space-x-4">
                            {[12, 15, 18, 24].map(len => (
                            <div key={len} className="flex items-center space-x-2">
                                <RadioGroupItem value={String(len)} id={`r${len}`} />
                                <Label htmlFor={`r${len}`}>{len}</Label>
                            </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div>
                        <Label className="mb-2 block">{t.secretPhraseWordsLabel}</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                            {seedWords.map((word, index) => (
                            <WordInput
                                key={index}
                                index={index}
                                value={word}
                                onChange={handleWordChange}
                                onPaste={handlePaste}
                                onSuggestionClick={handleSuggestionClick}
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
                  <Button onClick={handleVerifySeed} disabled={isLoading || isImportDisabled}>
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

    