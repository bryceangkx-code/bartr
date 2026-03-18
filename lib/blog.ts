import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  readingTime: number; // minutes, estimated
};

export type Post = PostMeta & {
  content: string; // raw MDX content
};

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename): PostMeta => {
    const slug = filename.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
    const { data } = matter(raw);

    // Estimate reading time: ~200 words per minute
    const wordCount = raw.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return {
      slug,
      title: data.title as string,
      description: data.description as string,
      date: data.date as string,
      tags: (data.tags as string[]) ?? [],
      readingTime,
    };
  });

  // Sort by date descending
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const filepath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) return null;

  const raw = fs.readFileSync(filepath, "utf-8");
  const { data, content } = matter(raw);

  const wordCount = raw.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    tags: (data.tags as string[]) ?? [],
    readingTime,
    content,
  };
}
