"use client";

import { useState, useCallback } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createWallet, importWalletFromSeed, storeWallet, validatePassword, bip39Wordlist } from '@/lib/wallet';
import type { Wallet } from '@/lib/types';
import { KeyRound, PlusCircle, AlertTriangle, Eye, EyeOff, Check, X, Shield, FileInput, UserPlus } from 'lucide-react';
import { SeedPhraseDisplay } from '../shared/SeedPhraseDisplay';
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from '@/hooks/useTranslations';
import Image from 'next/image';
import { logEvent } from '@/lib/analytics';
import { useFeedback } from '@/hooks/useFeedback';
import { useTelegram } from '@/hooks/useTelegram';


interface ConnectViewProps {
  onLoginComplete: (wallet: Wallet, isNewUser: boolean) => void;
}

type SeedLength = 12 | 15 | 18 | 24;
type CreationStep = 'showSeed' | 'confirmSeed' | 'setPassword';
type ImportStep = 'enterSeed' | 'setPassword';


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


export function ConnectView({ 
  onLoginComplete,
}: ConnectViewProps) {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [newWallet, setNewWallet] = useState<Wallet | null>(null);
  
  // Create flow state
  const [creationStep, setCreationStep] = useState<CreationStep>('showSeed');
  const [seedBackupConfirmed, setSeedBackupConfirmed] = useState(false);
  const [confirmationWords, setConfirmationWords] = useState<string[]>(['', '', '']);
  const [confirmationErrors, setConfirmationErrors] = useState<string[]>(['', '', '']);
  const [randomWordIndices, setRandomWordIndices] = useState<number[]>([]);

  // Shared password state
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

  // Import flow state
  const [importStep, setImportStep] = useState<ImportStep>('enterSeed');
  const [seedLength, setSeedLength] = useState<SeedLength>(12);
  const [seedWords, setSeedWords] = useState<string[]>(Array(12).fill(''));
  const [isForExistingAccount, setIsForExistingAccount] = useState(false);
  
  const { toast } = useToast();
  const t = useTranslations();
  const { triggerFeedbackEvent } = useFeedback();
  const { user } = useTelegram();

  const handlePasswordChange = (pass: string) => {
    setPassword(pass);
    const validation = validatePassword(pass);
    setPasswordValidation(validation);
    if (passwordError) setPasswordError('');
  }

  const handleCreateWalletFlowStart = () => {
    logEvent('create_wallet_start');
    const wallet = createWallet();
    setNewWallet(wallet);
    setCreationStep('showSeed');
    setCreateDialogOpen(true);
  };
  
  const handleImportFlowStart = (existingAccount: boolean) => {
      setIsForExistingAccount(existingAccount);
      const event = existingAccount ? 'import_account_start' : 'create_account_from_wallet_start';
      logEvent(event);
      setImportStep('enterSeed');
      setImportDialogOpen(true);
  }
  
  const generateRandomIndices = useCallback((seed: string) => {
    const indices = new Set<number>();
    const seedWordCount = seed.split(' ').length;
    while (indices.size < 3) {
        indices.add(Math.floor(Math.random() * seedWordCount));
    }
    return Array.from(indices);
  }, []);

  const handleGoToConfirmation = () => {
    if(!seedBackupConfirmed) {
        toast({
            title: t.error,
            description: "Please confirm you have saved your seed phrase.",
            variant: "destructive",
        });
        return;
    }
    if (newWallet?.seedPhrase) {
      logEvent('create_wallet_seed_confirmed');
      setRandomWordIndices(generateRandomIndices(newWallet.seedPhrase));
      setCreationStep('confirmSeed');
    }
  };
  
  const handleSeedVerification = async () => {
    if (!newWallet) return;
    
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
        logEvent('create_wallet_seed_verified');
        setCreationStep('setPassword');
    } else {
        logEvent('create_wallet_seed_verification_failed', { error_code: 'seed_verification_failed' });
    }
  };


  const persistWalletData = async (wallet: Wallet) => {
    if (!user?.id) {
        console.warn("Telegram User ID not available. Skipping wallet data persistence.");
        return;
    }
    try {
        const response = await fetch('/api/wallet/create', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-API-Key': process.env.NEXT_PUBLIC_API_KEY_BACKEND!
            },
            body: JSON.stringify({ userId: String(user.id), walletAddress: wallet.address })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to persist wallet data:", errorData);
            toast({
                title: "Database Sync Failed",
                description: "Your wallet is created, but we couldn't save it to your profile. Functionality may be limited.",
                variant: "destructive"
            })
        }
    } catch(error) {
        console.error("Network error persisting wallet data:", error);
    }
  };
  
  const handleFinalizeOnboarding = async (walletToSave: Wallet, isNewUser: boolean) => {
      const validation = validatePassword(password);
      if (!Object.values(validation).every(v => v)) {
          setPasswordError(t.passwordDoesNotMeetRequirements);
          logEvent('onboarding_password_fail', { reason: 'requirements_not_met' });
          return;
      }

      if (password !== confirmPassword) {
        setPasswordError(t.passwordsDoNotMatch);
        logEvent('onboarding_password_fail', { reason: 'passwords_do_not_match' });
        return;
      }
      
      await storeWallet(walletToSave, password);
      await persistWalletData(walletToSave);
      
      logEvent('onboarding_success', { is_new_user: isNewUser });
      
      onLoginComplete(walletToSave, isNewUser);
      
      toast({
        title: t.walletCreatedTitle,
        description: t.walletCreatedDesc,
      });

      // Close relevant dialog
      if (isCreateDialogOpen) handleCloseCreateDialog();
      if (isImportDialogOpen) handleCloseImportDialog();
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

  const handleImportSeedVerification = async () => {
    const importSeedPhrase = seedWords.join(' ');
    try {
        const wallet = await importWalletFromSeed(importSeedPhrase);
        setNewWallet(wallet); // Store the imported wallet details
        setImportStep('setPassword'); // Move to password step
    } catch (error) {
        toast({
            title: t.importErrorTitle,
            description: (error as Error).message || t.importErrorDesc,
            variant: "destructive",
        });
    }
  };
  
  const handleCloseCreateDialog = () => {
    if (creationStep !== 'setPassword') {
        logEvent('create_wallet_abandoned', { step: creationStep });
    }
    setCreateDialogOpen(false);
    setTimeout(() => {
        setNewWallet(null);
        setCreationStep('showSeed');
        setPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setSeedBackupConfirmed(false);
        setConfirmationWords(['', '', '']);
        setConfirmationErrors(['', '', '']);
        setRandomWordIndices([]);
    }, 300);
  }
  
  const handleCloseImportDialog = () => {
      setImportDialogOpen(false);
      setTimeout(() => {
          setSeedLength(12);
          setSeedWords(Array(12).fill(''));
          setImportStep('enterSeed');
          setNewWallet(null);
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
  
  const PasswordStepView = ({ onFinalize, onCancel }: { onFinalize: () => void; onCancel: () => void; }) => (
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
             <Button variant="outline" onClick={onCancel}>{t.cancelButton}</Button>
             <Button onClick={onFinalize} disabled={isSetPasswordDisabled}>{t.finishSetupButton}</Button>
           </DialogFooter>
         </>
  );


  return (
    <>
      <Card className="text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full mb-2">
             <Image src="/codex-logo.svg" alt="Codex App Logo" width={40} height={40} className="text-primary" data-ai-hint="aztec calendar"/>
          </div>
          <CardTitle className="font-sans text-3xl">{t.mainTitle}</CardTitle>
          <CardDescription>{t.mainDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <Button size="lg" onClick={handleCreateWalletFlowStart}>
            <PlusCircle />
            {t.createWalletAndAccountButton}
          </Button>
          
           <Button size="lg" variant="secondary" onClick={() => handleImportFlowStart(false)}>
            <UserPlus />
            {t.createAccountWithWalletButton}
          </Button>

          <Button size="lg" variant="outline" onClick={() => handleImportFlowStart(true)}>
            <FileInput />
            {t.importExistingAccountButton}
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
               <div className="flex items-start space-x-3 my-4 p-3 bg-secondary/30 rounded-lg">
                <Checkbox id="terms" checked={seedBackupConfirmed} onCheckedChange={(checked) => setSeedBackupConfirmed(checked as boolean)} className="mt-1"/>
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t.seedBackupConfirmation}
                </label>
              </div>
              <DialogFooter>
                 <Button variant="outline" onClick={handleCloseCreateDialog}>{t.cancelButton}</Button>
                <Button onClick={handleGoToConfirmation} disabled={!seedBackupConfirmed}>{t.continueButton}</Button>
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
                <Button onClick={handleSeedVerification} disabled={isConfirmationDisabled}>{t.continueButton}</Button>
              </DialogFooter>
            </>
          )}

          {creationStep === 'setPassword' && newWallet && (
             <PasswordStepView 
                onFinalize={() => handleFinalizeOnboarding(newWallet, true)}
                onCancel={handleCloseCreateDialog}
             />
          )}

        </DialogContent>
      </Dialog>
      
      <Dialog open={isImportDialogOpen} onOpenChange={handleCloseImportDialog}>
        <DialogContent className="sm:max-w-md">
            {importStep === 'enterSeed' && (
              <>
                <DialogHeader>
                  <DialogTitle>{t.importWalletTitle}</DialogTitle>
                  <DialogDescription>{isForExistingAccount ? t.importExistingAccountDesc : t.importToCreateAccountDesc}</DialogDescription>
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
                  <DialogClose asChild>
                    <Button variant="outline">{t.cancelButton}</Button>
                  </DialogClose>
                  <Button onClick={handleImportSeedVerification} disabled={isImportDisabled}>
                    {t.importButton}
                  </Button>
                </DialogFooter>
              </>
            )}

            {importStep === 'setPassword' && newWallet && (
                 <PasswordStepView 
                    onFinalize={() => handleFinalizeOnboarding(newWallet, !isForExistingAccount)}
                    onCancel={handleCloseImportDialog}
                 />
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
