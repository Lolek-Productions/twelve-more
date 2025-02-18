import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  const host = request.headers.get('host');
  const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');

  //Bypass if localhost
  if(!isLocalhost) {
    if (request.headers.get('origin') !== 'https://twelvemore.social') {
      return new Response('Unauthorized', { status: 403 });
    }

    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
