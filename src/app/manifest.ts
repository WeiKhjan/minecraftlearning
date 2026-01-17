import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MYLearnt',
    short_name: 'MYLearnt',
    description: 'A gamified learning platform for Malaysian primary school kids',
    start_url: '/',
    display: 'fullscreen',
    orientation: 'landscape',
    background_color: '#1a1a2e',
    theme_color: '#4a90d9',
    icons: [
      {
        src: '/logo.jpeg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/logo.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
