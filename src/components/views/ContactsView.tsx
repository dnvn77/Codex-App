
"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useTranslations } from "@/hooks/useTranslations";
import { ContactsList } from './ContactsList';

export function ContactsView() {
  const t = useTranslations();
  
  // A dummy function because on this view, selecting a contact doesn't do anything.
  const handleSelect = () => {};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t.contacts}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Contact Book</CardTitle>
          <CardDescription>
            Manage your saved addresses here for quick access.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[calc(100vh-20rem)]">
           <ContactsList onContactSelect={handleSelect} isDialog={false}/>
        </CardContent>
      </Card>
    </div>
  )
}
