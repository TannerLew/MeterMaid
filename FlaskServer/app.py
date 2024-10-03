# app.py

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Import Flask-CORS

app = Flask(__name__)
CORS(app)  # Enable CORS

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Tanner1121@localhost/ParkingLotDB'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the Users model
class Users(db.Model):
    __tablename__ = 'Users'
    userID = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(50), nullable=False)
    lastName = db.Column(db.String(50), nullable=False)
    mNumber = db.Column(db.String(8), nullable=False, unique=True)

    def __init__(self, firstName, lastName, mNumber):
        self.firstName = firstName
        self.lastName = lastName
        self.mNumber = mNumber

# Route to add a new user
@app.route('/add_user', methods=['POST'])
def add_user():
    print("ADD USER CALLED------------------------------------------------------------------")
    data = request.get_json()
    firstName = data.get('firstName')
    lastName = data.get('lastName')
    mNumber = data.get('mNumber')

    if not firstName or not lastName or not mNumber:
        return jsonify({'message': 'Missing data'}), 400

    # Check if mNumber is unique
    existing_user = Users.query.filter_by(mNumber=mNumber).first()
    if existing_user:
        return jsonify({'message': 'M Number already exists'}), 400

    new_user = Users(firstName=firstName, lastName=lastName, mNumber=mNumber)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User added successfully'}), 200

# Route to get all users
@app.route('/users', methods=['GET'])
def get_users():
    users = Users.query.all()
    users_list = []
    for user in users:
        users_list.append({
            'userID': user.userID,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'mNumber': user.mNumber
        })
    return jsonify(users_list), 200


if __name__ == '__main__':
    app.run(debug=True)
