"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function AuthModal({ open, onOpenChange, message = "Please sign in to continue." }: AuthModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background border border-border p-6 shadow-xl transition-all duration-200">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LogIn className="size-6" />
            </div>
            
            <Dialog.Title className="text-xl font-semibold tracking-tight">
              Authentication Required
            </Dialog.Title>
            
            <Dialog.Description className="text-sm text-muted-foreground">
              {message}
            </Dialog.Description>

            <div className="mt-4 flex w-full flex-col gap-2">
              <a href="/login" className={buttonVariants({ className: "w-full" })}>
                Log In
              </a>
              <a href="/signup" className={buttonVariants({ variant: "outline", className: "w-full" })}>
                Sign Up
              </a>
            </div>
            
            <Dialog.Close className={buttonVariants({ variant: "ghost", className: "absolute right-4 top-4 size-8 p-0" })}>
              <span className="sr-only">Close</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
