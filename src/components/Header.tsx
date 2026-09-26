import { Wallet } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-hairline bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <Wallet className="h-[18px] w-[18px]" />
          </span>
          <h1 className="text-lg font-semibold text-primary">Expense Tracker</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
