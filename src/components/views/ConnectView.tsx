
"use client";

import { useState, useMemo } from 'react';
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
import { createWallet, importWalletFromSeed } from '@/lib/wallet';
import type { Wallet } from '@/lib/types';
import { KeyRound, PlusCircle, AlertTriangle } from 'lucide-react';
import { SeedPhraseDisplay } from '../shared/SeedPhraseDisplay';
import { useToast } from "@/hooks/use-toast";

interface ConnectViewProps {
  onWalletConnected: (wallet: Wallet) => void;
}

type SeedLength = 12 | 15 | 18 | 24;
type CreationStep = 'showSeed' | 'confirmSeed';

export function ConnectView({ onWalletConnected }: ConnectViewProps) {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [newWallet, setNewWallet] = useState<Wallet | null>(null);
  
  const [creationStep, setCreationStep] = useState<CreationStep>('showSeed');
  const [confirmationWords, setConfirmationWords] = useState<string[]>(['', '', '']);
  const [confirmationErrors, setConfirmationErrors] = useState<string[]>(['', '', '']);
  const [randomWordIndices, setRandomWordIndices] = useState<number[]>([]);

  const [seedLength, setSeedLength] = useState<SeedLength>(12);
  const [seedWords, setSeedWords] = useState<string[]>(Array(12).fill(''));

  const { toast } = useToast();

  const handleCreateWallet = () => {
    const wallet = createWallet();
    setNewWallet(wallet);
    setCreationStep('showSeed');
    setConfirmationWords(['', '', '']);
    setConfirmationErrors(['', '', '']);
    setCreateDialogOpen(true);
  };
  
  const generateRandomIndices = () => {
    const indices = new Set<number>();
    const seedWordCount = newWallet?.seedPhrase.split(' ').length || 12;
    while (indices.size < 3) {
        indices.add(Math.floor(Math.random() * seedWordCount));
    }
    // Sort for consistent order in the UI
    return Array.from(indices).sort((a, b) => a - b);
  }

  const handleGoToConfirmation = () => {
    setRandomWordIndices(generateRandomIndices());
    setCreationStep('confirmSeed');
  };
  
  const handleFinalizeCreation = () => {
    if (newWallet) {
      const correctWords = newWallet.seedPhrase.split(' ');
      const newErrors = ['', '', ''];
      let allCorrect = true;

      randomWordIndices.forEach((wordIndex, arrayIndex) => {
        if (confirmationWords[arrayIndex].trim().toLowerCase() !== correctWords[wordIndex].toLowerCase()) {
          newErrors[arrayIndex] = "Incorrect word";
          allCorrect = false;
        }
      });
      
      setConfirmationErrors(newErrors);

      if (allCorrect) {
        onWalletConnected(newWallet);
        setCreateDialogOpen(false);
        setNewWallet(null);
        toast({
          title: "Wallet Created!",
          description: "Your new wallet is ready.",
        });
      }
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
    const newWords = [...seedWords];
    newWords[index] = value.trim();
    setSeedWords(newWords);
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const words = pastedText.trim().split(/\s+/);
    
    if (words.length === 12 || words.length === 15 || words.length === 18 || words.length === 24) {
      const newLength = words.length as SeedLength;
      setSeedLength(newLength);
      setSeedWords(words);
    } else {
      toast({
        title: "Invalid Paste",
        description: `Seed phrase must be 12, 15, 18, or 24 words. You pasted ${words.length}.`,
        variant: "destructive",
      });
    }
  };

  const handleImportWallet = () => {
    const filledWords = seedWords.filter(word => word.length > 0);
    if (filledWords.length !== seedLength) {
      toast({
        title: "Incomplete Seed Phrase",
        description: `Please enter all ${seedLength} words of your seed phrase.`,
        variant: "destructive",
      });
      return;
    }
    
    const importSeedPhrase = seedWords.join(' ');
    try {
      const wallet = importWalletFromSeed(importSeedPhrase);
      onWalletConnected(wallet);
      setImportDialogOpen(false);
      setSeedWords(Array(12).fill('')); // Reset state
      setSeedLength(12);
      toast({
        title: "Wallet Imported",
        description: "Your wallet has been successfully imported.",
      });
    } catch (error) {
      toast({
        title: "Import Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };
  
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    // Add a small delay to allow the dialog to close before resetting state
    setTimeout(() => {
        setNewWallet(null);
        setCreationStep('showSeed');
    }, 300);
  }

  const isConfirmationDisabled = confirmationWords.some(word => word.trim() === '');

  return (
    <>
      <Card className="text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-10 w-10 text-primary"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z" />
              <path d="M16 8.5c-1-.5-2.5-1-4-1-1.5 0-3 .5-4 1" />
              <path d="M12 14v4" />
              <path d="M12 12c-1.5 0-3 .5-4 1" />
              <path d="M16 12.5c-1 .5-2.5 1-4 1s-3-.5-4-1" />
              <path d="M8 8.5c1 .5 2.5 1 4 1 1.5 0 3-.5 4-1" />
            </svg>
          </div>
          <CardTitle className="font-headline text-3xl">Violet Vault</CardTitle>
          <CardDescription>Your private, self-custody wallet for the Aztec Network on Telegram.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <Button size="lg" onClick={handleCreateWallet}>
            <PlusCircle />
            Create New Wallet
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setImportDialogOpen(true)}>
            <KeyRound />
            Import Wallet
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Transactions are on the Sepolia Testnet.
          </p>
        </CardFooter>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          {creationStep === 'showSeed' && (
            <>
              <DialogHeader>
                <DialogTitle>Create Your Wallet</DialogTitle>
                <DialogDescription>
                  Write down your secret phrase and store it securely. You'll be asked to confirm it.
                </DialogDescription>
              </DialogHeader>
              {newWallet && <SeedPhraseDisplay seedPhrase={newWallet.seedPhrase} />}
              <DialogFooter>
                 <Button variant="outline" onClick={handleCloseCreateDialog}>Cancel</Button>
                <Button onClick={handleGoToConfirmation}>Continue</Button>
              </DialogFooter>
            </>
          )}

          {creationStep === 'confirmSeed' && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Your Phrase</DialogTitle>
                <DialogDescription>
                  To ensure you saved it correctly, please enter the following words from your phrase.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {randomWordIndices.map((wordIndex, arrayIndex) => (
                  <div key={wordIndex}>
                    <Label htmlFor={`confirmationWord-${arrayIndex}`} className="font-semibold">
                      Enter word #{wordIndex + 1}
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
                <Button variant="outline" onClick={handleBackToShowSeed}>Back</Button>
                <Button onClick={handleFinalizeCreation} disabled={isConfirmationDisabled}>Confirm & Create</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isImportDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Wallet</DialogTitle>
            <DialogDescription>
              Enter your secret phrase to restore your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Security Warning</p>
                <p>Never share your secret phrase. Anyone with it can take control of your assets.</p>
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block">Seed Phrase Length</Label>
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
              <Label className="mb-2 block">Secret Phrase Words</Label>
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
                You can paste your entire seed phrase into any field.
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleImportWallet}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
