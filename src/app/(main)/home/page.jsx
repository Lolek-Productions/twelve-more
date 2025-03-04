import Feed from '@/components/Feed';
import SelectedOrganizationName from "@/components/SelectedOrganizationName.jsx";
import Input from '@/components/Input';
import RightSidebar from "@/components/RightSidebar.jsx";

//Build currently fails without this:
export const dynamic = 'force-dynamic'; // ✅ Ensures Next.js treats this as a dynamic page

export default async function Home() {

  return (
    <div className="flex w-full">
      <div className='min-h-screen max-w-xl mx-auto border-r border-l'>
        <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
          <h2 className='text-lg sm:text-xl font-bold'>Home: <SelectedOrganizationName/></h2>
        </div>
        <Input/>
        <Feed/>
      </div>

      <div className="hidden lg:flex lg:flex-col p-3 h-screen border-l w-[24rem] flex-shrink-0">
        <RightSidebar/>
      </div>
    </div>
  );
}
