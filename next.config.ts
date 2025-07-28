
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    basePath: '/products/ace-customer-relationship-management-system',
    trailingSlash: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'px.ads.linkedin.com',  // for linkedin Tracking
            },
        ],
        unoptimized: true, // ✅ disable image optimization on Netlify
    },
};


const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);