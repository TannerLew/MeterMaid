# MeterMaid
Database management systems class project

INSTRUCTIONS ON HOW TO RUN PROGRAM

Python
1.Install python and python extension on vscode
run this script in command line to download modules: pip install Flask Flask-CORS Flask-SQLAlchemy PyMySQL SQLAlchemy cryptography

2.install node.js
run "node -v" to make sure it installed properly
Install the react extension on vscode

3.download GitHub desktop
After logging in. Go to https://github.com/TannerLew/MeterMaid and click on the green code button and select open with GitHub desktop and clone the repository

4. MYSQLWorkbench
After cloning the repo, open MYSQLWorkbench. Under MySQL connections create a new connection. Keep the username as root. After that open the connection by clicking on it. After it opens click File then open SQL script. Navigate to the MYSQL file inside of your repo and open the install.sql file and run it. This will create the database.

4.5 - Open The app.py file and change the password on line 10 to your personal mysql password app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:[Password goes here]@localhost/ParkingLotDB'

5.Running the website
1. Open the project in vscode
2. Open two terminals in vscode
3. cd into the flaskserver folder on one and the client on the other
4. Run "npm install" inside of the client terminal 
5. Run "flask run" in the flask terminal
6. Run "npm start" in the client terminal