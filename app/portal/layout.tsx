export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Portal Header */}
      <header className="bg-background border-b h-16 flex items-center justify-between px-6 lg:px-20">
        <div className="font-bold text-lg">
          SpendIQ{" "}
          <span className="text-muted-foreground font-normal">Portal</span>
        </div>
        <nav className="flex gap-4 text-sm font-medium">
          <a href="#" className="text-foreground">
            Invoices
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            Support
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            Profile
          </a>
        </nav>
      </header>
      <main className="container mx-auto max-w-5xl py-10 px-6">{children}</main>
    </div>
  );
}
