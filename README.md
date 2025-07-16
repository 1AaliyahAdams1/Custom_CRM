# Custom_CRM
To pull repo into visual Studio Code:

click Code Button and copy repo "https://github.com/1AaliyahAdams1/Custom_CRM.git"

> Go to file in Visual Studio Code
> Click on New Window , A welcome window should be visible

> Click on clone git repository on this welcome window

> Paste the repo into the topbar that pops up

> Choose an easily findable folder on your computer to save the repo to your computer

> You should get a pop up afterwards asking if you want to open repo, click Open

> Then you should select Yes when the next pop up appears

To make a new branch visual Studio Code:
MAKE ONLY ONE BRANCH AND THAT WILL BE YOUR BRANCH. AVOID MAKING MULTIPLE BRANCHES
  = Paste these commands in the terminal = 
> git checkout -b "your-branch-name-here"

[CREATES YOUR BRANCH LOCALLY ON YOUR COMPUTER]

> git push --set-upstream origin your-branch-name-here

[PUSHES YOUR BRANCH ONLINE]

To save changes in your branch and push it to GitHub:
  = Paste these commands in the terminal =
> git add .

[THIS STAGES ALL CHANGES MADE ON BRANCH]

> git commit -m "your-message-here"

[THIS SAVES ALL THE STAGED CHANGES UNDER A MESSAGE LIKE "FIXED BUTTON"]

> git push

[THIS PUSHES ALL CHANGES TO GITHUB]

To pull changes from GitHub into your branch:
 = Paste these commands in the terminal =
> git pull origin main

[PULLS ALL CHANGES MADE TO MAIN BRANCH TO YOUR BRANCH ON YOUR COMPUTER]


=====================================================================================================

Install dependencies in the terminal:

COMMANDS for Root folder [Custom_CRM]
> powershell -ExecutionPolicy Bypass -command "npm install react@18.2.0 react-dom@18.2.0"

> powershell -ExecutionPolicy Bypass -command "npm install"

> powershell -ExecutionPolicy Bypass -command "npm install concurrently --save-dev"

> powershell -ExecutionPolicy Bypass -command "npm install mssql cors dotenv bcrypt"

> powershell -ExecutionPolicy Bypass -command "npm install express@4.18.2"


COMMANDS for Client folder [client]
> C:\Desktop\Custom_CRM\client [CHANGE THIS COMMAND TO MATCH YOUR FILE DIRECTORY]

> powershell -ExecutionPolicy Bypass -command "npm install react@18.2.0 react-dom@18.2.0"

> powershell -ExecutionPolicy Bypass -command "npm install"

> powershell -ExecutionPolicy Bypass -command "npm install react-scripts@5.0.1 --save"

> powershell -ExecutionPolicy Bypass -command "npm install react-router-dom@6"

> powershell -ExecutionPolicy Bypass -command "npm install npm  @mui/material@^7.2.0 @mui/icons-material@^7.2.0 @mui/x-data-grid@^8.6.0 axios@^1.10.0"

> powershell -ExecutionPolicy Bypass -command "npm install @emotion/react @emotion/styled"


COMMAND to run program:
MAKE SURE YOU ARE ON THE ROOT FOLDER [Custom_CRM] WHEN YOU RUN THIS COMMAND
> powershell -ExecutionPolicy Bypass -command "npm run dev"  

