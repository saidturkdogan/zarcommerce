import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  // We match / and all /tr or /en paths
  matcher: ['/', '/(tr|en)/:path*']
};
