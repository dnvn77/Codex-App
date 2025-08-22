
"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/hooks/useTranslations";
import { Copy, Edit, ArrowUpRight, ArrowDownLeft, Upload, Info } from "lucide-react";
import type { Wallet } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ShortenedLink } from '../shared/ShortenedLink';

interface ProfileViewProps {
    wallet: Wallet;
    showEditOnLoad?: boolean;
    onProfileSaved?: () => void;
}

const mockRecentActivity = [
    {
        type: 'out',
        contact: 'Alice',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        amount: 0.5,
        ticker: 'ETH',
        valueUSD: 1170.25,
        txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        blockNumber: 18000123,
        status: 'confirmed',
    },
    {
        type: 'in',
        contact: 'Bob',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        amount: 1000,
        ticker: 'USDC',
        valueUSD: 1000.00,
        txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
        blockNumber: 18000050,
        status: 'confirmed',
    }
];

export function ProfileView({ wallet, showEditOnLoad = false, onProfileSaved }: ProfileViewProps) {
  const t = useTranslations();
  const { toast } = useToast();

  const [name, setName] = useState("John Doe");
  const [description, setDescription] = useState("Crypto enthusiast & DeFi trader");
  const [avatar, setAvatar] = useState("https://placehold.co/100x100.png");
  
  const [isEditOpen, setEditOpen] = useState(showEditOnLoad);
  const [tempName, setTempName] = useState(name);
  const [tempDescription, setTempDescription] = useState(description);
  const [tempAvatarFile, setTempAvatarFile] = useState<File | null>(null);
  const [tempAvatarPreview, setTempAvatarPreview] = useState<string | null>(null);

  const [selectedTx, setSelectedTx] = useState<(typeof mockRecentActivity)[0] | null>(null);

  useEffect(() => {
    setEditOpen(showEditOnLoad);
  }, [showEditOnLoad]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    toast({
      title: t.addressCopiedTitle,
      description: t.addressCopiedDesc,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setTempAvatarFile(file);
        setTempAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  const handleSaveChanges = () => {
      setName(tempName);
      setDescription(tempDescription);
      if(tempAvatarPreview) {
          setAvatar(tempAvatarPreview);
      }
      toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully.",
      });
      setEditOpen(false);
      onProfileSaved?.(); // Notify parent that the profile has been saved
  }

  const handleCopyTxInfo = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: 'Copied to clipboard!',
      description: `${label} has been copied.`,
    });
  };


  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
          <AvatarImage src={avatar} alt={name} data-ai-hint="person avatar" />
          <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-muted-foreground text-center">{description}</p>
        <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  {t.editProfile}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.editProfile}</DialogTitle>
                    <DialogDescription>
                        Make changes to your public profile here.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex flex-col items-center space-y-2">
                         <Avatar className="h-24 w-24">
                           <AvatarImage src={tempAvatarPreview || avatar} alt="Avatar preview" />
                           <AvatarFallback>{tempName.substring(0, 2).toUpperCase()}</AvatarFallback>
                         </Avatar>
                         <Input id="picture" type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                         <Button asChild variant="ghost">
                            <Label htmlFor="picture" className='cursor-pointer'>
                                <Upload className="mr-2 h-4 w-4" />
                                Change Photo
                            </Label>
                         </Button>
                    </div>
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={tempName} onChange={(e) => setTempName(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={tempDescription} onChange={(e) => setTempDescription(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t.publicAddress}</CardTitle>
          <CardDescription>{t.publicAddressDesc}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <p className="font-mono text-sm break-all">{wallet.address}</p>
                <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-4 w-full">
          <Card className="text-center">
              <CardContent className="p-6">
                  <p className="text-3xl font-bold text-primary">24</p>
                  <p className="text-sm text-muted-foreground">{t.contacts}</p>
              </CardContent>
          </Card>
           <Card className="text-center">
              <CardContent className="p-6">
                  <p className="text-3xl font-bold text-primary">{mockRecentActivity.length}</p>
                  <p className="text-sm text-muted-foreground">{t.transactions}</p>
              </CardContent>
          </Card>
      </div>
      
      <div className="w-full space-y-4">
        <h2 className="text-xl font-semibold">{t.recentActivity}</h2>
        {mockRecentActivity.map((tx, index) => (
            <button key={index} className="w-full text-left" onClick={() => setSelectedTx(tx)}>
                <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className='flex items-center gap-3'>
                            <div className={`p-2 rounded-full bg-secondary ${tx.type === 'out' ? 'text-destructive' : 'text-green-500'}`}>
                                {tx.type === 'out' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                            </div>
                            <div>
                                <p>{tx.type === 'out' ? `Sent to ${tx.contact}` : `Received from ${tx.contact}`}</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(tx.timestamp), "PPp")}</p>
                            </div>
                        </div>
                         <div className="text-right">
                            <p className={`font-mono ${tx.type === 'out' ? 'text-destructive' : 'text-green-500'}`}>
                                {tx.type === 'out' ? '-' : '+'}{tx.amount} {tx.ticker}
                            </p>
                            <p className="text-sm font-mono text-muted-foreground">${tx.valueUSD.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </button>
        ))}
      </div>

       {selectedTx && (
        <Dialog open={!!selectedTx} onOpenChange={(isOpen) => !isOpen && setSelectedTx(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Details for your recent transaction.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-green-500 capitalize flex items-center gap-1"><Info className="h-4 w-4" /> {selectedTx.status}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{format(new Date(selectedTx.timestamp), 'PPpp')}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-mono font-medium">{selectedTx.amount === null ? 'Private' : `${selectedTx.amount.toLocaleString()} ${selectedTx.ticker}`}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">To Address</span>
                     <button onClick={() => handleCopyTxInfo(wallet.address, "Address")} className="font-mono font-medium flex items-center gap-1 hover:text-primary">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                        <Copy className="h-3 w-3" />
                    </button>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Block Number</span>
                    <span className="font-mono font-medium">{selectedTx.blockNumber.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Transaction Hash</span>
                    <button onClick={() => handleCopyTxInfo(selectedTx.txHash, "Transaction Hash")} className="font-mono font-medium flex items-center gap-1 hover:text-primary">
                        {selectedTx.txHash.slice(0, 8)}...{selectedTx.txHash.slice(-6)}
                        <Copy className="h-3 w-3" />
                    </button>
                </div>
                <div className="pt-2">
                    <ShortenedLink fullUrl={`https://testnet.monadexplorer.com/tx/${selectedTx.txHash}`} displayPrefix="testnet.monadexplorer.com/tx/" t={{ linkCopied: "Link copied!" }} />
                </div>
            </div>
             <DialogClose asChild>
                <Button variant="outline" className="w-full">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}

    </div>
  )
}
