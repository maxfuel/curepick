import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold">
          Curepick
        </Link>
        <nav className="flex items-center gap-6">
          {/* Navigation will be added in Phase 2 */}
        </nav>
      </div>
    </header>
  );
}
