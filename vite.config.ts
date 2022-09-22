import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $components: path.resolve('./src/lib/components'),
      $def: path.resolve('./src/lib/def'),
      $helpers: path.resolve('./src/lib/helpers'),
      $lib: path.resolve('./src/lib'),
      $api: path.resolve('./src/lib/api'),
    },
  },
};

export default config;
