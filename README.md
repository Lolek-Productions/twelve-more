# TwelveMore

# ApiResponseHandler
Example:
const handleCommunityRemoved = async (communityId) => {
    return await handleApiResponse({
      apiCall: removeCommunityFromUser(communityId, userId),
      successDescription: "User removed from community",
      defaultErrorDescription: "Failed to remove community",
      onSuccess: () => fetchUser(),
    });
};

# Notes
After changing the schema on the Post model, I had to restart the development server, before it would use the updated Post Model.

# When creating a server action you must write 'server only' at the top otherwise there will be all kinds of different errors.

# copy everything in directory for AI
find . -type f -exec sh -c 'echo "--- File: {} ---"; cat "{}"; echo ""' \; | pbcopy

# Git Summary
git log --since="7 days ago" --pretty=tformat: --numstat | awk '{ add += $1; rem += $2 } END { print "Lines added: " add "\nLines removed: " rem "\nTotal changes: " (add + rem) }'