import Link from "next/link";
import { ArrowRight, TrendingUp, ShoppingBag, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-[#7C3AED]">Bartr</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-semibold bg-[#7C3AED] text-white px-4 py-2 rounded-lg hover:bg-[#6D28D9] transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
            Your content is worth
            <br />
            <span className="text-[#7C3AED]">more than likes</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Bartr connects Southeast Asian creators and brands for product-for-content partnerships. No cash. No agents. Just real deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup?role=creator"
              className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#6D28D9] transition-colors shadow-lg shadow-violet-200"
            >
              Join as a Creator <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup?role=brand"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#7C3AED] text-[#7C3AED] font-semibold px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-colors"
            >
              List a Product
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">Free to join · No credit card required</p>
        </section>

        {/* How it works — two track */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How Bartr works</h2>
              <p className="text-gray-500 mt-2">Simple steps for both creators and brands</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Creator track */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#7C3AED]" />
                  </div>
                  <h3 className="font-bold text-gray-900">For Creators</h3>
                </div>
                <ol className="space-y-4">
                  {[
                    { step: "01", title: "Build your profile", desc: "Add your Instagram stats — verified or self-reported." },
                    { step: "02", title: "Browse listings", desc: "Filter by niche and product value. Apply to brands that fit." },
                    { step: "03", title: "Receive & create", desc: "Get the product, create your content, deliver your deliverables." },
                  ].map(({ step, title, desc }) => (
                    <li key={step} className="flex gap-4">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-violet-50 text-[#7C3AED] text-xs font-bold flex items-center justify-center">{step}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6">
                  <Link href="/signup?role=creator" className="inline-flex items-center gap-2 text-[#7C3AED] font-semibold text-sm hover:underline">
                    Join as a Creator <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Brand track */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-[#7C3AED]" />
                  </div>
                  <h3 className="font-bold text-gray-900">For Brands</h3>
                </div>
                <ol className="space-y-4">
                  {[
                    { step: "01", title: "Post a listing", desc: "Describe your product, deliverables, and the creator profile you're looking for." },
                    { step: "02", title: "Review applications", desc: "Filter by followers, engagement rate, and niche. Pick your creator." },
                    { step: "03", title: "Ship the product", desc: "Send your product and receive authentic UGC content in return." },
                  ].map(({ step, title, desc }) => (
                    <li key={step} className="flex gap-4">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-violet-50 text-[#7C3AED] text-xs font-bold flex items-center justify-center">{step}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6">
                  <Link href="/signup?role=brand" className="inline-flex items-center gap-2 text-[#7C3AED] font-semibold text-sm hover:underline">
                    List a Product <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Creators / For Brands split */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-violet-50 rounded-2xl p-8">
                <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center mb-5">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">For Creators</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Turn your audience into real product value — without chasing brands for cash sponsorships.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Browse product listings matched to your niche",
                    "Apply directly — no agents or middlemen",
                    "Receive free products in exchange for honest content",
                    "Build your portfolio and track record",
                    "Micro-influencers welcome — no follower minimum",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#7C3AED] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup?role=creator" className="inline-flex items-center gap-2 bg-[#7C3AED] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#6D28D9] transition-colors text-sm">
                  Join as a Creator <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-gray-900 rounded-2xl p-8">
                <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center mb-5">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">For Brands</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Reach authentic Singapore audiences through creators who genuinely love your products.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Post listings and receive applications fast",
                    "Filter by niche, followers, and engagement rate",
                    "Pay with products — no large upfront fees",
                    "Get authentic UGC content for your channels",
                    "Access a growing network of Singapore micro-creators",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-violet-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup?role=brand" className="inline-flex items-center gap-2 bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-violet-500 transition-colors text-sm">
                  List a Product <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="bg-[#7C3AED] py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to barter smarter?</h2>
            <p className="text-violet-200 mb-8 text-sm sm:text-base">
              Join creators and brands across Singapore and Southeast Asia.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-[#7C3AED] font-semibold px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-colors">
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
            <Link href="/browse" className="hover:text-gray-600">Browse listings</Link>
            <Link href="/blog" className="hover:text-gray-600">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
