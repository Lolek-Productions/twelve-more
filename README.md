# 12More

# Getting Started
Send an email to fr.josh@lolekproductions.org to get the development keys for this project

# Pre-requisites
- Node.js
- npm
- git

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

### Complete Developer Onboarding
in the brower go to http://localhost:3000/onboard-developer
Click on the "Handle Developer Onboarding" button
Navigate to the Home page http://localhost:3000/home directly or by clicking the button


# Ways of joining 12More
1. Be invited to a community via SMS: user receives a link to the community
2. Be invited to the organization via SMS: user receives a link to the assigned welcoming community
3. Click on a physically published link so the user can join the welcoming community.
4. Join the website as a completely new user. 

# Clerk and querying
Unix timestamp with day precision
Clerk is using: Unix timestamp in milliseconds when calculating last_active_at
console.log('Active users:', activeUsers.data[0].lastActiveAt);

# Using https://ipapi.is/ for ip lookup


