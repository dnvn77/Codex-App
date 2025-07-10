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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { createWallet } from '@/lib/wallet';
import type { Wallet } from '@/lib/types';
import { KeyRound, PlusCircle } from 'lucide-react';
import { SeedPhraseDisplay } from '../shared/SeedPhraseDisplay';
import { useToast } from "@/hooks/use-toast";

interface ConnectViewProps {
  onWalletConnected: (wallet: Wallet) => void;
}

export function ConnectView({ onWalletConnected }: ConnectViewProps) {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWallet, setNewWallet] = useState<Wallet | null>(null);
  const [hasSavedSeed, setHasSavedSeed] = useState(false);
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
  
  const handleConnectWallet = () => {
    toast({
      title: "Feature not available",
      description: "Connecting to existing wallets will be supported soon.",
      variant: "default",
    });
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
          <Button size="lg" variant="secondary" onClick={handleConnectWallet}>
            <KeyRound />
            Connect Wallet
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
    </>
  );
}
