import Link from "next/link";
import { ArrowRight, Package, Users, Handshake, Star, TrendingUp, ShoppingBag } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-[#7C3AED]">Bartr</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-[#7C3AED] text-white px-4 py-2 rounded-lg hover:bg-[#6D28D9] transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-[#7C3AED] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Star className="h-3.5 w-3.5" />
            Built for Southeast Asia
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
            Trade your influence
            <br />
            <span className="text-[#7C3AED]">for products you love</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Bartr connects creators with brands across Southeast Asia. No sponsorship fees — just authentic partnerships where your content is the currency.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#6D28D9] transition-colors shadow-lg shadow-violet-200"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Browse listings
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">Free to join · No credit card required</p>
        </section>

        {/* How it works */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How Bartr works</h2>
              <p className="text-gray-500 mt-2">Three simple steps to your next brand deal</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: <Package className="h-6 w-6 text-[#7C3AED]" />,
                  title: "Brands post listings",
                  desc: "Brands list products they want reviewed — skincare, gadgets, food, fashion — and set clear deliverable expectations.",
                },
                {
                  step: "02",
                  icon: <Users className="h-6 w-6 text-[#7C3AED]" />,
                  title: "Creators apply",
                  desc: "Creators browse listings that match their niche and audience, then apply with a short note on why they're a great fit.",
                },
                {
                  step: "03",
                  icon: <Handshake className="h-6 w-6 text-[#7C3AED]" />,
                  title: "Deals get done",
                  desc: "Brands pick their creator, ship the product, and the creator delivers authentic content. Everyone wins.",
                },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <span className="text-xs font-bold text-gray-400 tracking-widest">STEP {step}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For creators / For brands */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Creators */}
              <div className="bg-violet-50 rounded-2xl p-8">
                <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center mb-5">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">For Creators</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Turn your Instagram, TikTok, or YouTube into real product value — without chasing brands for cash sponsorships.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Browse hundreds of product listings across SEA",
                    "Apply to brands that match your content niche",
                    "Receive free products in exchange for honest reviews",
                    "Build your portfolio and grow your brand reputation",
                    "No follower minimum — micro-influencers welcome",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="mt-0.5 w-5 h-5 bg-[#7C3AED] text-white rounded-full flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-[#7C3AED] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#6D28D9] transition-colors text-sm"
                >
                  Join as a Creator <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Brands */}
              <div className="bg-gray-900 rounded-2xl p-8">
                <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center mb-5">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">For Brands</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Reach authentic Southeast Asian audiences through creators who genuinely love your products — at a fraction of traditional influencer marketing costs.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Post listings and receive creator applications fast",
                    "Filter by niche, followers, and engagement rate",
                    "Pay with products — no large upfront fees",
                    "Get authentic UGC content for your channels",
                    "Access a growing network of SEA micro-creators",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className="mt-0.5 w-5 h-5 bg-violet-500 text-white rounded-full flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-violet-400 transition-colors text-sm"
                >
                  Join as a Brand <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="bg-[#7C3AED] py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to barter smarter?
            </h2>
            <p className="text-violet-200 mb-8 text-sm sm:text-base">
              Join creators and brands across Singapore, Indonesia, Malaysia, and beyond.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-[#7C3AED] font-semibold px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-colors"
            >
              Create your free account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-[#7C3AED]">Bartr</span>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Bartr. Creator-brand barter marketplace for Southeast Asia.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/login" className="hover:text-gray-600">Log in</Link>
            <Link href="/signup" className="hover:text-gray-600">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
