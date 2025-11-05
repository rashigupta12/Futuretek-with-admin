"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { DialogTitle } from "./ui/dialog";

export function SiteHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-background sticky top-0 z-20">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-4 px-4">
        <div className="mr-10 flex items-center gap-3">
          <Sidebar />
          {/* <Logo className="size-8" /> */}
          <Link
            href="/"
            className="flex items-center gap-2 px-2 text-xl font-bold tracking-tighter"
          >
            Futuretek
          </Link>
        </div>
        <nav className="text-muted-foreground hover:[&_a]:text-foreground hidden items-center gap-6 text-sm font-medium md:flex [&_a]:transition-colors">
          <Link href="/">Home</Link>
          <div className="relative group">
            <Link href="/courses" className="flex items-center gap-1">
              Courses
              <ChevronDown className="h-4 w-4" />
            </Link>
            <div className="absolute left-0 top-full hidden group-hover:block bg-background border rounded-md p-2 w-48">
              <Link
                href="/courses/kp-astrology"
                className="block px-2 py-1 hover:bg-muted"
              >
                KP Astrology
              </Link>
              <Link
                href="/courses/financial-astrology"
                className="block px-2 py-1 hover:bg-muted"
              >
                Financial Astrology
              </Link>
              <Link
                href="/courses/vastu-shastra"
                className="block px-2 py-1 hover:bg-muted"
              >
                Vastu Shastra
              </Link>
              <Link
                href="/courses/astro-vastu"
                className="block px-2 py-1 hover:bg-muted"
              >
                Astro-Vastu
              </Link>
            </div>
          </div>
          <Link href="/about">About</Link>
          <Link href="/career">Career</Link>
          <Link href="/contact">Contact Us</Link>
        </nav>
        {/* <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <span>Welcome, {session.user.name}</span>
              <Button onClick={() => signOut()} variant="outline">Logout</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div> */}
      </div>
    </header>
  );
}

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false); // Close the sidebar
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <DialogTitle></DialogTitle>
        <SheetTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="border-border size-8 shrink-0 border md:hidden"
            >
              <Menu className="size-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </TooltipTrigger>
        </SheetTrigger>
        <TooltipContent align="start">Menu</TooltipContent>
        <SheetContent
          side="left"
          className="flex w-full flex-col p-4 pt-12 md:w-3/4"
        >
          <Button
            className="justify-start"
            variant="ghost"
            onClick={handleLinkClick}
          >
            <Link href="/">Home</Link>
          </Button>
          <Button
            className="justify-start"
            variant="ghost"
            onClick={handleLinkClick}
          >
            <Link href="/courses">Courses</Link>
          </Button>
          <Button
            className="justify-start pl-8"
            variant="ghost"
            onClick={handleLinkClick}
          >
            <Link href="/courses/kp-astrology">KP Astrology</Link>
          </Button>
          <Button
            className="justify-start pl-8"
            variant="ghost"
            onClick={handleLinkClick}
          >
            <Link href="/courses/financial-astrology">Financial Astrology</Link>
          </Button>
          <Button
            className="justify-start pl-8"
            variant="ghost"
            onClick={handleLinkClick}
          >
            <Link href="/courses/vastu-shastra">Vastu Shastra</Link>
          </Button>
          <Button
            className="justify-start pl-8"
            variant="ghost"
            onClick={handleLinkClick}
          >
            <Link href="/courses/astro-vastu">Astro-Vastu</Link>
          </Button>
          <Button
            className="justify-start"
            variant="ghost"
            onClick={handleLinkClick}
          >
            <Link href="/about">About</Link>
          </Button>
          <Button
            className="justify-start"
            variant="ghost"
            onClick={handleLinkClick}
          >
            <Link href="/career">Career</Link>
          </Button>
          <Button
            className="justify-start"
            variant="ghost"
            onClick={handleLinkClick}
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </SheetContent>
      </Tooltip>
    </Sheet>
  );
}
