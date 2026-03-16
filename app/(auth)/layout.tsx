export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-3xl font-bold text-[#4F46E5]">
            Bartr
          </a>
          <p className="text-sm text-muted-foreground mt-1">
            Creator-brand barter marketplace
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
