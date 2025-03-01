import SelectedOrganizationName from "@/components/SelectedOrganizationName.jsx";

export const dynamic = 'force-dynamic'; // Ensures Next.js treats this as a dynamic page

import CommunitiesList from "@/components/CommunitiesList"; // Assuming this will be a separate client component

export default async function CommunitiesPage() {
  return (
    <div className='min-h-screen max-w-xl mx-auto border-r border-l'>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>Communities: <SelectedOrganizationName /></h2>
      </div>
      <CommunitiesList />
    </div>
  );
}