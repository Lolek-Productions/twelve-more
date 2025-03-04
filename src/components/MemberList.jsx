'use client';

export default function RightSidebar({ community, members }) {

  return (
    <div className="mt-3 text-gray-700 space-y-3 bg-gray-100 rounded-xl py-2">
      <h4 className="font-bold text-xl px-4">Community Members: {community?.name}</h4>
      <div className="px-4 pb-2">
        {members.length > 0 ? (
          <ul className="space-y-3">
            {members.map((member) => (
              <li key={member.id || member._id} className="flex items-center gap-3">
                {/* Uncomment if you want to re-add images later */}
                {/* <img
                  src={member.imageUrl || '/default-avatar.png'}
                  alt={`${member.firstName} ${member.lastName}'s avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => (e.target.src = '/default-avatar.png')}
                /> */}
                <span className="text-sm font-medium text-gray-700">
                  {member.firstName} {member.lastName}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-medium text-gray-500">No members found.</p>
        )}
      </div>
    </div>
  );
}