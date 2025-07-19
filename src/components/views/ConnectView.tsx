
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createWallet, importWalletFromSeed, storeWallet, validatePassword } from '@/lib/wallet';
import type { Wallet, StoredWallet } from '@/lib/types';
import { KeyRound, PlusCircle, AlertTriangle, Eye, EyeOff, Check, X } from 'lucide-react';
import { SeedPhraseDisplay } from '../shared/SeedPhraseDisplay';
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from '@/hooks/useTranslations';
import { commonPasswords } from '@/lib/commonPasswords';


interface ConnectViewProps {
  onWalletConnected: (wallet: Wallet) => void;
  // Props for password recovery flow
  isRecoveryMode?: boolean;
  onPasswordReset?: (wallet: Wallet) => void;
  recoverySeedPhrase?: string;
}

type SeedLength = 12 | 15 | 18 | 24;
type CreationStep = 'showSeed' | 'confirmSeed' | 'setPassword';

export function ConnectView({ 
  onWalletConnected,
  isRecoveryMode = false,
  onPasswordReset,
  recoverySeedPhrase
}: ConnectViewProps) {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [newWallet, setNewWallet] = useState<Wallet | null>(null);
  
  const [creationStep, setCreationStep] = useState<CreationStep>('showSeed');
  const [confirmationWords, setConfirmationWords] = useState<string[]>(['', '', '']);
  const [confirmationErrors, setConfirmationErrors] = useState<string[]>(['', '', '']);
  const [randomWordIndices, setRandomWordIndices] = useState<number[]>([]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    common: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  const [seedLength, setSeedLength] = useState<SeedLength>(12);
  const [seedWords, setSeedWords] = useState<string[]>(Array(12).fill(''));

  const { toast } = useToast();
  const t = useTranslations();

  const handlePasswordChange = (pass: string) => {
    setPassword(pass);
    const validation = validatePassword(pass);
    setPasswordValidation(validation);
    if (passwordError) setPasswordError('');
  }

  const handleCreateWallet = () => {
    const wallet = createWallet();
    setNewWallet(wallet);
    setCreationStep('showSeed');
    setConfirmationWords(['', '', '']);
    setConfirmationErrors(['', '', '']);
    setCreateDialogOpen(true);
  };
  
  const generateRandomIndices = (seed: string) => {
    const indices = new Set<number>();
    const seedWordCount = seed.split(' ').length;
    while (indices.size < 3) {
        indices.add(Math.floor(Math.random() * seedWordCount));
    }
    return Array.from(indices).sort((a, b) => a - b);
  }

  const handleGoToConfirmation = () => {
    if (newWallet?.seedPhrase) {
      setRandomWordIndices(generateRandomIndices(newWallet.seedPhrase));
      setCreationStep('confirmSeed');
    }
  };
  
  const handleGoToSetPassword = () => {
    if (newWallet) {
      const correctWords = newWallet.seedPhrase.split(' ');
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
        setCreationStep('setPassword');
      }
    }
  };
  
  const handleFinalizeCreation = async () => {
    const validation = validatePassword(password);
    if (!Object.values(validation).every(v => v)) {
        setPasswordError(t.passwordDoesNotMeetRequirements);
        return;
    }

    if (password !== confirmPassword) {
      setPasswordError(t.passwordsDoNotMatch);
      return;
    }
    
    let walletToSave = newWallet;

    // Handle password reset flow
    if (isRecoveryMode && recoverySeedPhrase) {
      try {
        walletToSave = importWalletFromSeed(recoverySeedPhrase);
      } catch (error) {
        toast({ title: t.error, description: (error as Error).message, variant: "destructive" });
        return;
      }
    }

    if (walletToSave) {
      await storeWallet(walletToSave, password);
      
      if (isRecoveryMode && onPasswordReset) {
        onPasswordReset(walletToSave);
      } else {
        onWalletConnected(walletToSave);
      }
      
      setCreateDialogOpen(false);
      setNewWallet(null);
      toast({
        title: isRecoveryMode ? t.passwordResetSuccessTitle : t.walletCreatedTitle,
        description: isRecoveryMode ? t.passwordResetSuccessDesc : t.walletCreatedDesc,
      });
    }
  };


  const handleBackToShowSeed = () => {
    setCreationStep('showSeed');
    setConfirmationErrors(['', '', '']);
    setConfirmationWords(['', '', '']);
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


  const handleSeedLengthChange = (value: string) => {
    const length = parseInt(value, 10) as SeedLength;
    setSeedLength(length);
    setSeedWords(Array(length).fill(''));
  };

  const handleWordChange = (index: number, value: string) => {
    // Allow only letters
    if (/^[a-zA-Z]*$/.test(value)) {
      const newWords = [...seedWords];
      newWords[index] = value.trim();
      setSeedWords(newWords);
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').toLowerCase();
    
    // Validate pasted text contains only letters and spaces
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

  const handleImportWallet = () => {
    const importSeedPhrase = seedWords.join(' ');
    try {
      const wallet = importWalletFromSeed(importSeedPhrase);
      setNewWallet(wallet); // Use newWallet state to pass to password step
      setCreationStep('setPassword'); // Re-use the set password step
      setImportDialogOpen(false); // Close this dialog
      setCreateDialogOpen(true); // Open the other dialog in setPassword step
    } catch (error) {
      toast({
        title: t.importErrorTitle,
        description: (error as Error).message || t.importErrorDesc,
        variant: "destructive",
      });
    }
  };
  
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setTimeout(() => {
        setNewWallet(null);
        setCreationStep('showSeed');
        setPassword('');
        setConfirmPassword('');
        setPasswordError('');
    }, 300);
  }

  const isConfirmationDisabled = confirmationWords.some(word => word.trim() === '');
  const isImportDisabled = seedWords.some(word => word.trim() === '');
  const isSetPasswordDisabled = !password || !confirmPassword || !Object.values(passwordValidation).every(v => v);

  const PasswordRequirement = ({ label, met }: { label: string, met: boolean }) => (
    <div className={`flex items-center text-xs ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
      {met ? <Check className="h-3 w-3 mr-1.5" /> : <X className="h-3 w-3 mr-1.5" />}
      {label}
    </div>
  );

  if (isRecoveryMode) {
    return (
      <div className="w-full">
        <DialogHeader>
          <DialogTitle>{t.setPasswordTitle}</DialogTitle>
          <DialogDescription>{t.setNewPasswordDesc}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="password">{t.newPasswordLabel}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
              <PasswordRequirement label={t.reqLength} met={passwordValidation.length} />
              <PasswordRequirement label={t.reqUppercase} met={passwordValidation.uppercase} />
              <PasswordRequirement label={t.reqLowercase} met={passwordValidation.lowercase} />
              <PasswordRequirement label={t.reqNumber} met={passwordValidation.number} />
              <PasswordRequirement label={t.reqSpecial} met={passwordValidation.special} />
              <PasswordRequirement label={t.reqNotCommon} met={passwordValidation.common} />
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword">{t.confirmNewPasswordLabel}</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
            />
          </div>
          {passwordError && (
            <p className="text-destructive text-sm">{passwordError}</p>
          )}
        </div>
        <DialogFooter>
            <Button onClick={handleFinalizeCreation} disabled={isSetPasswordDisabled} className="w-full">{t.resetPasswordButton}</Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <>
      <Card className="text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full mb-2">
             <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                fill="currentColor"
              >
                <title>Strawberry Wallet</title>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M16.5 12c-1.67 0-3.18-1.05-3.83-2.58l-1.34 2.58h-2.66l4.24-8.08L16.5 12zm-4.67-4.42L10.5 9.17l1.33-2.59H11.83z"/>
                <path d="M12 14c-2.21 0-4-1.79-4-4h1.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5H16c0 2.21-1.79 4-4 4z"/>
              </svg>
          </div>
          <CardTitle className="font-headline text-3xl">{t.mainTitle}</CardTitle>
          <CardDescription>{t.mainDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <Button size="lg" onClick={handleCreateWallet}>
            <PlusCircle />
            {t.createWalletButton}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setImportDialogOpen(true)}>
            <KeyRound />
            {t.importWalletButton}
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            {t.testnetDisclaimer}
          </p>
        </CardFooter>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          {creationStep === 'showSeed' && (
            <>
              <DialogHeader>
                <DialogTitle>{t.createWalletTitle}</DialogTitle>
                <DialogDescription>{t.createWalletDesc}</DialogDescription>
              </DialogHeader>
              {newWallet && <SeedPhraseDisplay seedPhrase={newWallet.seedPhrase} />}
              <DialogFooter>
                 <Button variant="outline" onClick={handleCloseCreateDialog}>{t.cancelButton}</Button>
                <Button onClick={handleGoToConfirmation}>{t.continueButton}</Button>
              </DialogFooter>
            </>
          )}

          {creationStep === 'confirmSeed' && (
            <>
              <DialogHeader>
                <DialogTitle>{t.confirmPhraseTitle}</DialogTitle>
                <DialogDescription>{t.confirmPhraseDesc}</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
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
                <Button variant="outline" onClick={handleBackToShowSeed}>{t.backButton}</Button>
                <Button onClick={handleGoToSetPassword} disabled={isConfirmationDisabled}>{t.continueButton}</Button>
              </DialogFooter>
            </>
          )}

          {creationStep === 'setPassword' && (
             <>
               <DialogHeader>
                 <DialogTitle>{t.setPasswordTitle}</DialogTitle>
                 <DialogDescription>{t.setPasswordDesc}</DialogDescription>
               </DialogHeader>
               <div className="py-4 space-y-4">
                 <div>
                   <Label htmlFor="password">{t.passwordLabel}</Label>
                   <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                   </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        <PasswordRequirement label={t.reqLength} met={passwordValidation.length} />
                        <PasswordRequirement label={t.reqUppercase} met={passwordValidation.uppercase} />
                        <PasswordRequirement label={t.reqLowercase} met={passwordValidation.lowercase} />
                        <PasswordRequirement label={t.reqNumber} met={passwordValidation.number} />
                        <PasswordRequirement label={t.reqSpecial} met={passwordValidation.special} />
                        <PasswordRequirement label={t.reqNotCommon} met={passwordValidation.common} />
                    </div>
                 </div>
                 <div>
                   <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
                   <Input
                     id="confirmPassword"
                     type={showPassword ? "text" : "password"}
                     value={confirmPassword}
                     onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                   />
                 </div>
                 {passwordError && (
                   <p className="text-destructive text-sm">{passwordError}</p>
                 )}
               </div>
               <DialogFooter>
                 <Button variant="outline" onClick={handleCloseCreateDialog}>{t.cancelButton}</Button>
                 <Button onClick={handleFinalizeCreation} disabled={isSetPasswordDisabled}>{t.finishSetupButton}</Button>
               </DialogFooter>
             </>
          )}

        </DialogContent>
      </Dialog>
      
      <Dialog open={isImportDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.importWalletTitle}</DialogTitle>
            <DialogDescription>{t.importWalletDesc}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">{t.securityWarningTitle}</p>
                <p>{t.securityWarningDesc}</p>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {seedWords.map((word, index) => (
                  <div key={index} className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{index + 1}</span>
                    <Input
                      type="text"
                      value={word}
                      onChange={(e) => handleWordChange(index, e.target.value)}
                      onPaste={handlePaste}
                      className="pl-6 text-center"
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </div>
                ))}
              </div>
               <p className="text-xs text-muted-foreground mt-2">
                {t.pasteDisclaimer}
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t.cancelButton}</Button>
            </DialogClose>
            <Button onClick={handleImportWallet} disabled={isImportDisabled}>
              {t.continueButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
