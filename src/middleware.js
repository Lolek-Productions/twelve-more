import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',          // Home page
  '/terms', // Match "/terms" and subroutes
  '/privacy' // Match "/privacy" and subroutes
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding']);
const isApiRoute = createRouteMatcher(['/api(.*)', '/trpc(.*)']); // ✅ Allow API calls

export default clerkMiddleware(async (auth, request) => {
  //This is a hot mess!!

  // ✅ Allow unrestricted access in local development
  // const host = request.headers.get('host');
  // const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');
  // if (isLocalhost) {
  //   return NextResponse.next();
  // }

  // ✅ Allow public routes to be accessed by anyone
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // ✅ Get user authentication info
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // ✅ Allow API routes to function properly (Do not redirect, just return JSON if unauthorized)
  if (isApiRoute(request)) {
    //TODO: this should be implemented
    // if (!userId) {
    //   console.log('userId from the API Request:', userId);
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // ✅ Return JSON instead of redirect
    // }
    return NextResponse.next(); // ✅ Allow API access if authenticated
  }

  // ✅ Allow users to access onboarding if they're signed in
  if (userId && isOnboardingRoute(request)) {
    return NextResponse.next();
  }

  // ✅ If user is NOT signed in and tries to access a private route, redirect to sign-in
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: request.url });
  }

  // ✅ If user is signed in but hasn't completed onboarding, redirect to onboarding page
  if (userId && !sessionClaims?.metadata?.onboardingComplete) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // ✅ Allow access to private routes if user is signed in
  return NextResponse.next();
});

// ✅ Middleware matcher configuration
export const config = {
  matcher: [
    // ✅ Exclude Next.js internals and static assets from middleware
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // ✅ Apply middleware to all API and TRPC routes
    '/(api|trpc)(.*)',
  ],
};