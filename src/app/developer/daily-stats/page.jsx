"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { DAILY_STATS_RUN_AT } from "@/lib/constants"
import { getNewPostsForDailyStats, getNewUsersForDailyStats, getNewCommunitiesForDailyStats, getNewOrganizationsForDailyStats, getActiveUsersForDailyStats } from "@/lib/actions/stats"
import { getYesterdayAt8 } from "@/lib/utils"

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const [postCount, setPostCount] = useState(null)
  const [userCount, setUserCount] = useState(null)
  const [communityCount, setCommunityCount] = useState(null)
  const [organizationCount, setOrganizationCount] = useState(null)
  const [activeUserCount, setActiveUserCount] = useState(null)

  const rangeStart = getYesterdayAt8();

  const loadAllStats = async () => {
      setIsLoading(true)

      try {
        const [postResult, userResult, communityResult, organizationResult, activeUserResult] = await Promise.all([
          getNewPostsForDailyStats(),
          getNewUsersForDailyStats(),
          getNewCommunitiesForDailyStats(),
          getNewOrganizationsForDailyStats(),
          getActiveUsersForDailyStats(),
        ])
  
        if (postResult.success) setPostCount(postResult.count)
        if (userResult.success) setUserCount(userResult.count)
        if (communityResult.success) setCommunityCount(communityResult.count)
        if (organizationResult.success) setOrganizationCount(organizationResult.count)
        if (activeUserResult.success) setActiveUserCount(activeUserResult.count)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
  
    // Initial load on component mount
    useEffect(() => {
      loadAllStats()
    }, [])

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Daily Stats</h1>
      <h2 className="mb-2">These are the stats that will be recorded each day at 3:00 Central Time.</h2>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {isLoading ? (
              <span>Loading statistics...</span>
            ) : (
              <span>Statistics beginning at {format(rangeStart, "PPPpp")}.</span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="text-sm text-blue-500 font-medium">New Posts</div>
              <div className="text-2xl font-bold text-blue-700">
                {isLoading ? '...' : postCount}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-md">
              <div className="text-sm text-green-500 font-medium">New Users</div>
              <div className="text-2xl font-bold text-green-700">
                {isLoading ? '...' : userCount}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-md">
              <div className="text-sm text-purple-500 font-medium">New Communities</div>
              <div className="text-2xl font-bold text-purple-700">
                {isLoading ? '...' : communityCount}
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-md">
              <div className="text-sm text-amber-500 font-medium">New Organizations</div>
              <div className="text-2xl font-bold text-amber-700">
                {isLoading ? '...' : organizationCount}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="text-sm text-blue-500 font-medium">Active Users</div>
              <div className="text-2xl font-bold text-blue-700">
                {isLoading ? '...' : activeUserCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}