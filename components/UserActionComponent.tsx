'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { User, CreditCard, Users, Settings, LogOut, LogIn, Palette } from 'lucide-react';
import ThemeController from './ThemeController';

// --- Types ---
type UserType = { name?: string; email?: string; image?: string };
type Props = { isLoggedIn: boolean; user?: UserType; onLogin?: () => void; onLogout?: () => void };

// --- Sub-Components ---
const MenuItem = ({
  icon,
  label,
  onClick,
  disabled
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition text-left ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted'}`}>
    <span className="text-muted-foreground">{icon}</span>
    {label}
  </button>
);

const UserTrigger = ({ isLoggedIn, user }: { isLoggedIn: boolean; user?: UserType }) => {
  const firstName = user?.name?.split(' ')[0] || 'User';
  return (
    <div className="flex items-center gap-2 rounded-full border border-transparent hover:border-muted px-2 py-1 transition-colors">
      <Avatar className="md:w-10 md:h-10 w-7 h-7">
        <AvatarImage src={user?.image} />
        <AvatarFallback>{isLoggedIn ? user?.name?.slice(0, 2).toUpperCase() : 'G'}</AvatarFallback>
      </Avatar>
      <div className="hidden md:flex flex-col items-start">
        <span className="text-sm font-medium hidden md:block">
          {isLoggedIn ? `Hi, ${firstName}` : 'Guest'}
        </span>
        <span className="text-sm font-medium hidden md:block">
          {isLoggedIn ? `Gold Member, ${firstName}` : 'No Badge Yet'}
        </span>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function UserActionComponent({ isLoggedIn, user, onLogin, onLogout }: Props) {
  return (
    <Sheet>
      <SheetTrigger>
        <>
          <UserTrigger isLoggedIn={isLoggedIn} user={user} />
        </>
      </SheetTrigger>

      <SheetContent side="right" className="w-[320px] p-0 flex flex-col">
        <div className="border-b px-5 py-5">
          <SheetHeader>
            <SheetTitle className="text-left text-base">
              {isLoggedIn ? 'My Account' : 'Guest Mode'}
            </SheetTitle>
          </SheetHeader>

          {isLoggedIn ? (
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.image} />
                <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border bg-muted/40 p-3 space-y-2">
              <p className="text-sm text-muted-foreground">You are browsing as a guest</p>
              <button
                onClick={onLogin}
                className="flex items-center gap-2 text-sm text-primary hover:underline">
                <LogIn size={16} /> Sign in
              </button>
            </div>
          )}
        </div>

        <div className="px-3 py-4 space-y-1">
          <MenuItem icon={<User size={16} />} label="Profile" disabled={!isLoggedIn} />
          <MenuItem icon={<CreditCard size={16} />} label="Billing" disabled={!isLoggedIn} />
          <MenuItem icon={<Users size={16} />} label="Team" disabled={!isLoggedIn} />
          <MenuItem icon={<Settings size={16} />} label="Subscription" disabled={!isLoggedIn} />
        </div>

        <div className="border-t px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette size={16} /> Theme
          </div>
          <ThemeController />
        </div>

        <div className="mt-auto border-t px-5 py-4">
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 text-sm text-red-500 hover:text-red-600">
              <LogOut size={16} /> Log out
            </button>
          ) : (
            <p className="text-xs text-muted-foreground text-center">Sign in to unlock account features</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
