import type { Metadata } from "next";
import Link from "next/link";
import { lang } from "next/root-params";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export const metadata: Metadata = {
  title: "Mintly | Changelog",
  description: "See what's new, improved, and fixed in Mintly.",
};

type Entry = {
  title: string;
  description: string;
  slug: string;
  publishDate: string;
};

async function getEntries(): Promise<Entry[]> {
  const entriesDir = path.join(
    process.cwd(),
    "src/app/[lang]/changelog/(entries)",
  );

  const slugs = (await readdir(entriesDir, { withFileTypes: true })).filter(
    (dirent) => dirent.isDirectory(),
  );

  const entries = await Promise.all(
    slugs.map(async ({ name }) => {
      const raw = await readFile(
        path.join(entriesDir, name, "page.mdx"),
        "utf-8",
      );
      const { data } = matter(raw);
      return { slug: name, ...(data as Omit<Entry, "slug">) };
    }),
  );

  entries.sort((a, b) => +new Date(b.publishDate) - +new Date(a.publishDate));

  return entries;
}

export default async function Changelog() {
  const locale = await lang();
  const entries = await getEntries();

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Changelog
        </h1>
        <p className="text-lg text-muted-foreground">
          See what&apos;s new, improved, and fixed in Mintly.
        </p>
      </div>

      <ol className="flex flex-col gap-12 pb-24">
        {entries.map(({ slug, title, description, publishDate }) => (
          <li key={slug} className="border-t border-border pt-8">
            <time className="text-sm text-muted-foreground">
              {new Date(publishDate).toLocaleDateString("en-US", {
                dateStyle: "long",
              })}
            </time>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              <Link
                href={`/${locale}/changelog/${slug}`}
                className="hover:underline"
              >
                {title}
              </Link>
            </h2>
            <p className="mt-3 text-muted-foreground">{description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
