"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUserById } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const { userId } = params;
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      setError("User ID not provided");
      setLoading(false);
      return;
    }
    async function fetchUserData() {
      try {
        const userData = await getUserById(userId);

        if (!userData.success) {
          setError("User not found");
        } else {
          setUser(userData.user);
        }
      } catch (err) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [userId]);

  if (loading) return <div className="p-4 md:w-[30rem]">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 w-[30rem]">{error}</div>;

  return (
    <div className='max-w-xl mx-auto border-r border-l min-h-screen'>
      <div className={'md:w-[30rem] px-3 py-2'}>
      <h1 className="text-2xl font-bold mb-2">{user.firstName} {user.lastName}</h1>

      <p className="text-gray-700 mb-4 border rounded-lg p-3">
        {user.bio}
        {/*{JSON.stringify(user, null, 2)}*/}
      </p>

      {/*<div className={'flex justify-start items-center mb-4'}>*/}
      {/*  <div>*/}
      {/*    {user?.profileImg ?*/}
      {/*      <img*/}
      {/*        src={user?.profileImg}*/}
      {/*        alt='img'*/}
      {/*        className='h-11 w-11 rounded-full mr-4 flex-shrink-0'*/}
      {/*      />*/}
      {/*      : ''*/}
      {/*    }*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div className="mb-4">*/}
      {/*  <h3 className="text-lg">Organization: {user.organization?.name}</h3>*/}
      {/*  <h3 className="text-lg">Community: {user.community?.name}</h3>*/}
      {/*</div>*/}

      {/*<div className="mb-4">*/}
      {/*  <h3 className="text-lg font-semibold">Likes ({user.likes.length})</h3>*/}
      {/*</div>*/}

      <div>
        <h3 className="text-lg font-semibold">Communities ({user.communities.length})</h3>
        {user.communities.length === 0 ? (
          <p className="text-gray-500">No communities yet.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {user.communities.map((community) => (
              <div key={community.id} className="px-2 rounded-md flex justify-start items-center">
                <div>
                  <p className="text-sm">{`${community?.name}` || "Unknown"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button className="mt-7" onClick={() => router.back()}>Go Back</Button>
      </div>
    </div>
  );
}
