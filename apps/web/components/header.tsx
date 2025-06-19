import Link from "next/link";
import { ThemeToggle } from "./theme-provider";

export const Header = () => {
  return (
    <header className="flex items-center gap-4 p-2 bg-background border-b border-border">
      <Link href="/" className="font-bold">
        MatSci YAMZ
      </Link>
      <div className="flex gap-2">
        <Link href="/terms">Browse</Link>
        <Link href="/add">Add</Link>
        <Link href="/tags">Tags</Link>
      </div>
      <div className="flex-1" />
      <Link href="/profile">Profile</Link>
      <ThemeToggle />
    </header>
  );
};
