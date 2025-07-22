import Link from "next/link";
import { ThemeToggle } from "./theme-provider";
import { getSession } from "@/lib/session";
import { db, usersTable } from "@yamz/db";
import { eq } from "drizzle-orm";
import { OAuthURL } from "@/lib/apis/google";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Suspense } from "react";
import { Button } from "./ui/button";
import {
  UserCircleIcon,
} from "lucide-react";

export const Header = () => {
  return (
    <header className="flex items-center gap-4 p-2 bg-background border-b border-border">
      <Link href="/" className="font-bold">
        MatSci YAMZ
      </Link>
      <div className="flex gap-2">
        <Link href="/search">Search</Link>
        <Link href="/terms">Browse</Link>
        <Link href="/add">Add</Link>
        <Link href="/tags">Tags</Link>
      </div>
      <div className="flex-1" />
      <div className="flex gap-2">
        <ThemeToggle />
        <Suspense fallback={null}>
          <AuthSection />
        </Suspense>
      </div>
    </header>
  );
};

const AuthSection = async () => {
  const sesh = await getSession();

  if (sesh.id) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, sesh.id));

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <UserCircleIcon className="size-4" />
            {user.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuLabel>{user.name}</DropdownMenuLabel> */}
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuItem>
            {/* <SettingsIcon className="size-4" /> */}
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-red-500">
            <Link href="/api/auth/logout">
              {/* <LogOutIcon className="size-4 text-red-500" /> */}
              Logout
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link href={OAuthURL}>
      <Button variant="outline">Login</Button>
    </Link>
  );
};
