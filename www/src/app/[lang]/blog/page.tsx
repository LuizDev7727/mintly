import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import { lang } from "next/root-params";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Mintly | Blog",
  description: "News, guides, and updates from the Mintly team.",
};

type Post = {
  title: string;
  description: string;
  slug: string;
  publishDate: string;
  coverImage?: string;
};

async function getPosts(): Promise<Post[]> {

  const postsDir = path.join(process.cwd(), "src/app/[lang]/blog/(posts)");

   const slugs = (await readdir(postsDir, { withFileTypes: true })).filter((dirent) =>
     dirent.isDirectory(),
   );

   const posts = await Promise.all(
     slugs.map(async ({ name }) => {
       const raw = await readFile(path.join(postsDir, name, "page.mdx"), "utf-8");
       const { data } = matter(raw);
       return { slug: name, ...(data as Omit<Post, "slug">) };
     }),
   );

   posts.sort((a, b) => +new Date(b.publishDate) - +new Date(a.publishDate));

  return posts

}

export default async function Blog() {

  const locale = await lang()
  const posts = await getPosts()

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Latest news and updates.
        </p>
      </div>

      <div className="grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map(({ slug, description, title, coverImage }) => (
          <Link key={slug} href={`/${locale}/blog/${slug}`}>
            <Card className="h-full gap-4 pt-0">
              {coverImage ? (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={coverImage}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary/15 to-card">
                  <Newspaper className="size-10 text-muted-foreground/40" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg leading-snug">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
