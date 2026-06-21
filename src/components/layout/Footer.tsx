export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Curepick. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
