import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  site: 'https://rongzhou.me',
  build: {
    assets: 'assets',
  },
});
