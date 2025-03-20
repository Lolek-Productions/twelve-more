# TwelveMore

# Notes
After changing the schema on the Post model, I had to restart the development server, before it would use the updated Post Model.

# When creating a server action you must write 'server only' at the top otherwise there will be all kinds of different errors.

# copy everything in directory for AI
find . -type f -exec sh -c 'echo "--- File: {} ---"; cat "{}"; echo ""' \; | pbcopy

# Git Summary
git log --since="7 days ago" --pretty=tformat: --numstat | awk '{ add += $1; rem += $2 } END { print "Lines added: " add "\nLines removed: " rem "\nTotal changes: " (add + rem) }'

# Starter Video:
https://www.youtube.com/watch?v=gsysxSuTohA

# Throwing an error:
throw new Error("This is a test error message");

# Ways of joining TwelveMore
1. Be invited to a community via SMS: user receives a link to the community
2. Be invited to the organization via SMS: user receives a link to the assigned welcoming community
3. Click on a physically published link so the user can join the welcoming community.
4. Join the website as a completely new user. 

# toast:
const { showResponseToast, showErrorToast } = useApiToast();