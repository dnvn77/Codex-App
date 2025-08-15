
"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, X, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getContacts, saveContact, deleteContact, resolveEnsName } from '@/lib/wallet';
import type { Contact } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContactsListProps {
  onContactSelect: (contact: Contact) => void;
}

export function ContactsList({ onContactSelect }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAddContactOpen, setAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load contacts from storage when the component mounts or when the add dialog is closed.
    // This ensures the list is always up-to-date.
    if(!isAddContactOpen) {
        setContacts(getContacts());
    }
  }, [isAddContactOpen]);

  const handleAddressChange = (value: string) => {
    setNewContactAddress(value);
    if (addressError) {
      setAddressError('');
    }
  };
  
  const handleNameChange = (value: string) => {
      let finalValue = value;
      // Autocomplete .eth
      if (/^[a-zA-Z0-9-]*$/.test(value) && !value.endsWith('.') && !newContactAddress) {
        // This is a rough heuristic. If user types a potential ens name start.
      }
      setNewContactName(finalValue);
  };

  const handleSaveContact = async () => {
    if (!newContactName || !newContactAddress) {
      setAddressError("Both name and address are required.");
      return;
    }

    setIsLoading(true);
    let finalAddress = newContactAddress.trim();
    let finalName = newContactName.trim();
    
    // Autocomplete and validate ENS
    if (!finalAddress.startsWith('0x') && !finalAddress.endsWith('.eth')) {
        finalAddress += '.eth';
    }

    if (finalAddress.endsWith('.eth')) {
      const resolvedAddress = await resolveEnsName(finalAddress);
      if (!resolvedAddress) {
        setAddressError("Could not resolve this ENS name. Please check it and try again.");
        setIsLoading(false);
        return;
      }
      finalAddress = resolvedAddress;
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(finalAddress)) {
      setAddressError("Invalid Ethereum address format.");
      setIsLoading(false);
      return;
    }

    const updatedContacts = saveContact({ name: finalName, address: finalAddress });
    setContacts(updatedContacts);
    toast({ title: "Contact Saved!", description: `${finalName} has been added to your contacts.` });
    
    // Reset form and close dialog
    setNewContactName('');
    setNewContactAddress('');
    setAddressError('');
    setAddContactOpen(false);
    setIsLoading(false);
  };
  
  const handleDeleteContact = () => {
    if(!contactToDelete) return;
    const updatedContacts = deleteContact(contactToDelete.address);
    setContacts(updatedContacts);
    toast({ title: "Contact Deleted", description: `${contactToDelete.name} has been removed.` });
    setContactToDelete(null);
  };

  const isSaveDisabled = !newContactName || !newContactAddress || isLoading;

  return (
    <>
      <DialogHeader>
        <div className="flex justify-between items-center">
            <DialogTitle>Contacts</DialogTitle>
            <Dialog open={isAddContactOpen} onOpenChange={setAddContactOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <UserPlus className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Contact</DialogTitle>
                        <DialogDescription>
                            Save an address for quick access later. ENS names will be resolved.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="contact-name">Name</Label>
                            <Input
                                id="contact-name"
                                value={newContactName}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="e.g., Vitalik"
                            />
                        </div>
                         <div>
                            <Label htmlFor="contact-address">Address or ENS Name</Label>
                            <Input
                                id="contact-address"
                                value={newContactAddress}
                                onChange={(e) => handleAddressChange(e.target.value)}
                                placeholder="0x... or vitalik.eth"
                            />
                             {addressError && <p className="text-sm text-destructive mt-1">{addressError}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setAddContactOpen(false)}>Cancel</Button>
                         <Button onClick={handleSaveContact} disabled={isSaveDisabled}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Contact
                         </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </DialogHeader>
      
      <div className="py-4">
        {contacts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>You have no saved contacts yet.</p>
            <p className="text-sm">Click the <UserPlus className="inline h-4 w-4 mx-1" /> icon to add one.</p>
          </div>
        ) : (
          <ScrollArea className="h-72">
            <div className="space-y-2 pr-4">
              {contacts.map((contact) => (
                <div key={contact.address} className="group flex items-center justify-between p-2 rounded-md hover:bg-accent">
                    <button className="flex-1 text-left" onClick={() => onContactSelect(contact)}>
                        <p className="font-semibold">{contact.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                            {contact.address.slice(0, 6)}...{contact.address.slice(-4)}
                        </p>
                    </button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => setContactToDelete(contact)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

       <AlertDialog open={!!contactToDelete} onOpenChange={() => setContactToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{contactToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteContact} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
