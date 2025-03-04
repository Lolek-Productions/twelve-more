import Feed from '@/components/Feed';
import Input from '@/components/Input';
import SelectedOrganizationName from "@/components/SelectedOrganizationName.jsx";
import CommunitiesList from "@/components/CommunitiesList.jsx";
import RightSidebar from "@/components/RightSidebar.jsx";
import MemberList from "@/components/MemberList.jsx";
import {getCommunityMembers} from "@/lib/actions/user.js";
import {getCommunityById} from "@/lib/actions/community.js";

//Build currently fails without this:
export const dynamic = 'force-dynamic'; // ✅ Ensures Next.js treats this as a dynamic page

export default async function CommunitiesHome({params}) {
  const resolvedParams = await params; // Await params to resolve the promise
  const { communityId } = resolvedParams; // Now safely destructure

  const community = await getCommunityById(communityId);
  console.log(communityId);

  const membersResponse = await getCommunityMembers(communityId);
  if (!membersResponse.success) {
    console.error(membersResponse.error);
  }
  console.log(membersResponse);


  return (
    <div className="flex w-full">
      <div className='min-h-screen max-w-xl mx-auto border-r border-l'>
        <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
          <h2 className='text-lg sm:text-xl font-bold'>{community.name}</h2>
        </div>
        <Input communityId={communityId}/>
        <Feed communityId={communityId}/>
      </div>

      <div className="hidden lg:flex lg:flex-col p-3 h-screen border-l w-[24rem] flex-shrink-0">
        <RightSidebar />

        <MemberList community={community} members={membersResponse?.data} />
      </div>
    </div>
  );
}
