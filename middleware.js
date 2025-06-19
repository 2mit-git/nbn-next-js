import { NextResponse } from 'next/server';

const ALLOWED_TOKEN = 'MY_SECRET_TOKEN';

export function middleware(request) {
  // Middleware disabled: allow all requests
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};


// import { NextResponse } from 'next/server';

// const ALLOWED_TOKEN = 'MY_SECRET_TOKEN';

// export function middleware(request) {
//   // Skip middleware in development (localhost)
//   if (process.env.NODE_ENV === 'development') {
//     return NextResponse.next();
//   }

//   const url = new URL(request.url);
//   const token = url.searchParams.get('token');

//   // Allow Next.js internal files
//   if (
//     url.pathname.startsWith('/_next') || 
//     url.pathname.startsWith('/favicon.ico') || 
//     url.pathname.startsWith('/robots.txt')
//   ) {
//     return NextResponse.next();
//   }

//   if (token === ALLOWED_TOKEN) {
//     return NextResponse.next();
//   }

//   return new NextResponse('403 Forbidden', { status: 403 });
// }

// export const config = {
//   matcher: '/:path*',
// };