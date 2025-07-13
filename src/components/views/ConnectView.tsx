
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { createWallet, importWalletFromSeed } from '@/lib/wallet';
import type { Wallet } from '@/lib/types';
import { KeyRound, PlusCircle, AlertTriangle } from 'lucide-react';
import { SeedPhraseDisplay } from '../shared/SeedPhraseDisplay';
import { useToast } from "@/hooks/use-toast";

interface ConnectViewProps {
  onWalletConnected: (wallet: Wallet) => void;
}

export function ConnectView({ onWalletConnected }: ConnectViewProps) {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [newWallet, setNewWallet] = useState<Wallet | null>(null);
  const [hasSavedSeed, setHasSavedSeed] = useState(false);
  const [importSeedPhrase, setImportSeedPhrase] = useState('');
  const { toast } = useToast();

  const handleCreateWallet = () => {
    const wallet = createWallet();
    setNewWallet(wallet);
    setHasSavedSeed(false);
    setCreateDialogOpen(true);
  };

  const handleFinalizeCreation = () => {
    if (newWallet) {
      onWalletConnected(newWallet);
      setCreateDialogOpen(false);
      setNewWallet(null);
    }
  };

  const handleImportWallet = () => {
    if (!importSeedPhrase.trim()) {
      toast({
        title: "Frase semilla requerida",
        description: "Por favor, introduce tu frase semilla de 12 palabras.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const wallet = importWalletFromSeed(importSeedPhrase);
      onWalletConnected(wallet);
      setImportDialogOpen(false);
      setImportSeedPhrase('');
      toast({
        title: "Wallet Importada",
        description: "Tu wallet ha sido importada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error de Importación",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

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

      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Your Wallet</DialogTitle>
            <DialogDescription>
              A new wallet will be created. Please save your secret phrase securely.
            </DialogDescription>
          </DialogHeader>
          {newWallet && <SeedPhraseDisplay seedPhrase={newWallet.seedPhrase} />}
          <div className="flex items-center space-x-2 my-4">
            <Checkbox
              id="terms"
              checked={hasSavedSeed}
              onCheckedChange={(checked) => setHasSavedSeed(Boolean(checked))}
            />
            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I have saved my secret phrase securely.
            </Label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleFinalizeCreation} disabled={!hasSavedSeed}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isImportDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Wallet</DialogTitle>
            <DialogDescription>
              Enter your 12-word secret phrase to restore your wallet.
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
            <Label htmlFor="seed-phrase">Secret Phrase</Label>
            <Textarea
              id="seed-phrase"
              placeholder="word1 word2 word3..."
              value={importSeedPhrase}
              onChange={(e) => setImportSeedPhrase(e.target.value)}
              rows={3}
            />
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
