import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-coral-50 to-white px-4">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-bold text-[#FF6B4A] mb-4">Bartr</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Creator-brand barter marketplace for Southeast Asia. Trade your
          influence for products — no cash needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-[#FF6B4A] text-white px-8 py-3 font-semibold hover:bg-[#e85a38] transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-[#FF6B4A] text-[#FF6B4A] px-8 py-3 font-semibold hover:bg-coral-50 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
