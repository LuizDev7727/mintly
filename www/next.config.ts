import type { NextConfig } from "next";
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  pageExtensions: ["tsx", "ts", "md", "mdx"],

};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      'remark-frontmatter',
      'remark-gfm',
      ['remark-toc', { heading: 'conteúdo', ordered: true }],
      ['remark-mdx-frontmatter', { name: 'metadata' }],
    ],
    rehypePlugins: [
      'rehype-slug',
      ['rehype-autolink-headings', { behavior: 'append' }],
    ],
  },
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
