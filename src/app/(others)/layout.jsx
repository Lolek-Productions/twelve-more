import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import CommentModal from "@/components/CommentModal"
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }) {
  return (
    <div>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className='flex justify-between max-w-6xl mx-auto'>
          {/* hidden sm:inline */}
          <div className='inline border-r h-screen sticky top-0'>
            <LeftSidebar />
          </div>
          <div className='w-2xl flex-1'>
            {children}
          </div>
          <div className='lg:flex-col p-3 h-screen border-l hidden lg:flex w-[24rem]'>
            <RightSidebar />
          </div>
        </div>
        <CommentModal />
        <Toaster />
      </SignedIn>
    </div>
  );
}
