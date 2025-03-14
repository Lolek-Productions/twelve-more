import SelectedOrganizationName from "@/components/SelectedOrganizationName.jsx";

export const dynamic = 'force-dynamic';

import CommunitiesList from "@/components/CommunitiesList";
import RightSidebar from "@/components/RightSidebar.jsx";

export default async function CommunitiesPage() {
  return (
    <div className="flex w-full">
      <div className='min-h-screen max-w-xl mx-auto border-r border-l'>
        <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
          <h2 className='text-lg sm:text-xl font-bold'>Communities: <SelectedOrganizationName/></h2>
        </div>
        <CommunitiesList/>
      </div>

      <div className="hidden lg:flex lg:flex-col p-3 h-screen w-[24rem] flex-shrink-0">
        <RightSidebar/>
      </div>
    </div>
  );
}