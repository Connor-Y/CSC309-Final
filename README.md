# CSC309-Final
CSC309 Final Project - The Great Game Share

To Launch:
Navigate your terminal to the root directory of the project
Run the command npm install
Have MongoDB service running
Run the command node server.js
Open your browser
Goto localhost:3000

Site Usage:
You can register or login by clicking "Login to Account".
You can log in using a site account or via Facebook.
In order to view the sites content you must be logged in.

Once logged in you can:
Search Users : Look up other users profiles.
	-Enter the user name of the user you are looking for.
	-Then press 'Enter' or click the search button.
Update Info : Update your profile's information.
	-Enter Information in the field you wish to update.
	-Click the relevant button to update your information.
	-Refresh the page to view changes.
Post a Game : Create your own posting for a game you want to rent.
	-Enter the information about the game you are renting.
	-Click the 'Upload New Posting' button.
Log-Out : Logs you out.

You can view your own profile by clicking your user name next to the gear in the 
very top right. On this page you are able to view all the games you have currently rented
and the games you have posted for sale. Click on one of your postings will redirect you to 
that posting's page.

You can search for postings by entering a query in the "Search Game" field in the 
top right. The search checks for Game Title, Poster and Matching tags.

Missing Features:
We intend to improve website flow later in development. This would include removing alerts,
refreshing certain pages on action and including additional redirects.


Testing Framework:
To use the testing framework, navigate your terminal to the main directory
then run the command mocha. Make sure the dependencies first are installed.