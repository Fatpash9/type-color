import { defineManifest } from '@crxjs/vite-plugin';
import pkg from '../package.json' with { type: 'json' };

export default defineManifest({
  manifest_version: 3,
  name: 'Type Color',
  version: pkg.version,
  description: 'Recolor letters and digits in your chosen palette.',
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'Type Color',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
      all_frames: false,
    },
  ],
  permissions: ['storage', 'activeTab'],
});
