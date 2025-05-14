# 12More

# Installation
### Get the Code
 Clone the repository using the following command:
```bash
git clone https://github.com/Lolek-Productions/twelve-more.git
```
### Install Dependencies
 Install the required dependencies using npm:
```bash
npm install --force
```
### Start Development
 Start the development environment:
```bash
npm run dev
```

# Notes
After changing the schema on the Post model, I had to restart the development server, before it would use the updated Post Model.

# When creating a server action you must write 'server only' at the top otherwise there will be all kinds of different errors.

# copy everything in directory for AI
find . -type f -exec sh -c 'echo "--- File: {} ---"; cat "{}"; echo ""' \; | pbcopy

# Git Summary
git log --since="7 days ago" --pretty=tformat: --numstat | awk '{ add += $1; rem += $2 } END { print "Lines added: " add "\nLines removed: " rem "\nTotal changes: " (add + rem) }'

# Starter Video that I used:
https://www.youtube.com/watch?v=gsysxSuTohA

# Throwing an error:
throw new Error("This is a test error message");

# Ways of joining 12More
1. Be invited to a community via SMS: user receives a link to the community
2. Be invited to the organization via SMS: user receives a link to the assigned welcoming community
3. Click on a physically published link so the user can join the welcoming community.
4. Join the website as a completely new user. 

# toast:
import {useApiToast} from "@/lib/utils.js";
const { showResponseToast, showErrorToast } = useApiToast();

# Example from public metadata in Clerk:
smsOptIn:true
userMongoId:"67c4d7308e1ad29f8673701b"
onboardingComplete:true

# testing
In order to totally remove a user, that needs to happen FIRST within Clerk
https://dashboard.clerk.com

Remember that there are two instances of Clerk: a production instance and a development instance
This should be kept in mind when testing

<Button asChild className="mb-4" >
  <Link href={`/organizations/${organization.id}/community/create`}>Create New Community</Link>
</Button>

# Clerk and querying
Unix timestamp with day precision
Clerk is using: Unix timestamp in milliseconds when calculating last_active_at
console.log('Active users:', activeUsers.data[0].lastActiveAt);

# Using https://ipapi.is/ for ip lookup

# change to using mainContextProvider:
const { appUser, clerkUser } = useMainContext();
const { appUser } = useMainContext();
