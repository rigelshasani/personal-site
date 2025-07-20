/** @type {import('next').NextConfig} */
const baseConfig = { reactStrictMode:true };

const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require("remark-gfm")],
    rehypePlugins: [require("rehype-slug"), require("rehype-autolink-headings")]
  }
});

export default withMDX({
  ...baseConfig,
  pageExtensions: ["ts","tsx","mdx"]
});
