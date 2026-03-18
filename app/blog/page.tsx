import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

export const metadata = {
  title: "Blog — Bartr",
  description:
    "Insights on creator economy, influencer marketing, and barter in Southeast Asia",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground">
            Insights on creator economy, influencer marketing, and barter in
            Southeast Asia
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">
            <p className="text-base font-medium">
              Coming soon — we&apos;re working on our first posts
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-lg border border-border bg-card p-6 hover:border-brand transition-colors group"
              >
                <div className="flex flex-col gap-3">
                  {/* Title */}
                  <h2 className="text-xl font-semibold text-card-foreground group-hover:text-brand transition-colors">
                    {post.title}
                  </h2>

                  {/* Description */}
                  {post.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {post.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readingTime} min read
                    </span>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
