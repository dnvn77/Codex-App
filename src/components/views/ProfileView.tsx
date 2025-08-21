
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/hooks/useTranslations";
import { Copy, Edit, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { Wallet } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ProfileViewProps {
    wallet: Wallet;
}

export function ProfileView({ wallet }: ProfileViewProps) {
  const t = useTranslations();
  const { toast } = useToast();

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    toast({
      title: t.addressCopiedTitle,
      description: t.addressCopiedDesc,
    });
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
          <AvatarImage src="https://placehold.co/100x100.png" alt="John Doe" data-ai-hint="person avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">John Doe</h1>
        <p className="text-muted-foreground">Crypto enthusiast & DeFi trader</p>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          {t.editProfile}
        </Button>
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
                  <p className="text-3xl font-bold text-primary">156</p>
                  <p className="text-sm text-muted-foreground">{t.transactions}</p>
              </CardContent>
          </Card>
      </div>
      
      <div className="w-full space-y-4">
        <h2 className="text-xl font-semibold">{t.recentActivity}</h2>
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className='flex items-center gap-3'>
                    <div className="p-2 rounded-full bg-secondary text-destructive">
                        <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div>
                        <p>Sent to Alice</p>
                        <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="font-mono text-destructive">-0.5 ETH</p>
                    <p className="text-sm font-mono text-muted-foreground">$1,170.25</p>
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardContent className="p-4 flex items-center justify-between">
                 <div className='flex items-center gap-3'>
                    <div className="p-2 rounded-full bg-secondary text-green-500">
                        <ArrowDownLeft className="h-5 w-5" />
                    </div>
                    <div>
                        <p>Received from Bob</p>
                        <p className="text-sm text-muted-foreground">4 hours ago</p>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="font-mono text-green-500">+1,000 USDC</p>
                    <p className="text-sm font-mono text-muted-foreground">$1,000.00</p>
                </div>
            </CardContent>
        </Card>
      </div>

    </div>
  )
}
