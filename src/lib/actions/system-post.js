import Post from "@/lib/models/post.model";
import { connect } from '@/lib/mongodb/mongoose';
import { getStatsForPreviousWeek } from "./stats";

export async function postSystemStatsToDevelopersCommunity() {
  try {
    await connect();
    
    // const organizationId = "67e84cef001522de336670e9"; //Test Org
    // const communityId = "67e84ce27b99696289b14059"; //Test Community
    //"67c7003cfc84d5f673d1fd54" //Developers Community
    //"67f635bb7620b7d0f173ba15" //Founders Community

    const organizationId = "67ec452ecbdc464abad2a5ee"; //St. Carlo
    const communityId = "67c7003cfc84d5f673d1fd54"; //Developers Community

    const stats = await getStatsForPreviousWeek();
    const transformedStats = await transformStatsData(stats.stats);

    const formatStats = (statsData) => {
      const { newUsers, newCommunities, newOrganizations, activeUsers, newPosts, dateRange } = statsData;
      
      // Calculate totals
      const totalNewUsers = newUsers.reduce((sum, val) => sum + val, 0);
      const totalNewCommunities = newCommunities.reduce((sum, val) => sum + val, 0);
      const totalNewOrganizations = newOrganizations.reduce((sum, val) => sum + val, 0);
      const totalPosts = newPosts.reduce((sum, val) => sum + val, 0);
      
      // Calculate averages
      const avgActiveUsers = Math.round(activeUsers.reduce((sum, val) => sum + val, 0) / activeUsers.length);
      
      // Format the text
      return `Here are the stats for ${dateRange.start} to ${dateRange.end}:
    
📈 Weekly Summary:
- New Users: ${totalNewUsers}
- New Communities: ${totalNewCommunities}
- New Organizations: ${totalNewOrganizations}
- New Posts: ${totalPosts}
- Average Daily Active Users: ${avgActiveUsers}

📊 Daily Breakdown:
- Users: ${newUsers.join(', ')}
- Communities: ${newCommunities.join(', ')}
- Posts: ${newPosts.join(', ')}

🔝 Highest activity day: ${getHighestActivityDay(newPosts, dateRange)}
    `;
    };
    
    // Helper function to determine the highest activity day
    const getHighestActivityDay = (postsArray, dateRange) => {
      const maxPosts = Math.max(...postsArray);
      const maxIndex = postsArray.indexOf(maxPosts);
      
      // Calculate the date by adding the index to the start date
      const startDate = new Date(dateRange.start);
      const highestDate = new Date(startDate);
      highestDate.setDate(startDate.getDate() + maxIndex);
      
      // Format date to YYYY-MM-DD
      const formattedDate = highestDate.toISOString().split('T')[0];
      
      return `${formattedDate} with ${maxPosts} posts`;
    };

    const newPost = await Post.create({
      text: formatStats(transformedStats),
      community: communityId,
      organization: organizationId,
    });

    return { 
      success: true, 
      message: 'System post created.',
    };
  } catch (error) {
    console.error('Error creating system post:', error);
    return { success: false, message: `Failed to create system post: ${error.message}` };
  }
}

export async function transformStatsData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { error: "No data provided" };
  }

  // Sort the data by date to ensure chronological order
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Initialize result object with empty arrays for each metric
  const result = {
    newUsers: [],
    newCommunities: [],
    newOrganizations: [],
    activeUsers: [],
    newPosts: [],
    dateRange: {
      start: sortedData[0].date,
      end: sortedData[sortedData.length - 1].date
    }
  };
  
  // Fill arrays with values from each day
  sortedData.forEach(day => {
    result.newUsers.push(day.newUsers);
    result.newCommunities.push(day.newCommunities);
    result.newOrganizations.push(day.newOrganizations);
    result.activeUsers.push(day.activeUsers);
    result.newPosts.push(day.newPosts);
  });
  
  return result;
}