export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Curepick
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Find the Right Care in Korea
        </p>
      </div>
      <div className="flex gap-4">
        <a
          href="#"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get Started
        </a>
        <a
          href="#"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          Learn More
        </a>
      </div>
      <p className="text-sm text-muted-foreground">
        Locale: {locale}
      </p>
    </main>
  );
}
