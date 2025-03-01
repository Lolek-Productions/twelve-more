import Feed from '@/components/Feed';
import Input from '@/components/Input';
import Community from '@/lib/models/community.model';

//Build currently fails without this:
export const dynamic = 'force-dynamic'; // ✅ Ensures Next.js treats this as a dynamic page

export default async function CommunitiesHome({params}) {
  const resolvedParams = await params; // Await params to resolve the promise
  const { communityId } = resolvedParams; // Now safely destructure

  const community = await Community.findById(communityId).lean();

  return (
    <div className='min-h-screen max-w-xl mx-auto border-r border-l'>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>{community.name}</h2>
      </div>
      <Input communityId={communityId} />
      <Feed communityId={communityId} />
    </div>
  );
}
