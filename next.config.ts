import type {
  NextConfig
} from 'next';

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev:
      false
  },

  images: {
    remotePatterns: [
      {
        protocol:
          'https',

        hostname:
          'images.unsplash.com'
      },
      {
        protocol:
          'https',

        hostname:
          'plus.unsplash.com'
      },
      {
        protocol:
          'https',

        hostname:
          'unsplash.com'
      },
      {
        protocol:
          'https',

        hostname:
          'source.unsplash.com'
      },
      {
        protocol:
          'https',

        hostname:
          'picsum.photos'
      },
      {
        protocol:
          'https',

        hostname:
          'www.pinterest.com'
      },
      {
        protocol:
          'https',

        hostname:
          'i.pinimg.com'
      },
      {
        protocol:
          'https',

        hostname:
          'res.cloudinary.com',

        pathname:
          '/**'
      }
    ]
  },

  async headers() {
    return [
      {
        source:
          '/sw.js',

        headers: [
          {
            key:
              'Content-Type',

            value:
              'application/javascript; charset=utf-8'
          },
          {
            key:
              'Cache-Control',

            value:
              'no-cache, no-store, must-revalidate'
          },
          {
            key:
              'Service-Worker-Allowed',

            value:
              '/'
          },
          {
            key:
              'Content-Security-Policy',

            value:
              "default-src 'self'; script-src 'self'"
          }
        ]
      },
      {
        source:
          '/manifest.webmanifest',

        headers: [
          {
            key:
              'Content-Type',

            value:
              'application/manifest+json'
          },
          {
            key:
              'Cache-Control',

            value:
              'public, max-age=0, must-revalidate'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
