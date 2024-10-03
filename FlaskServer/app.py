from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

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

# Define the ParkingSpots model
class ParkingSpots(db.Model):
    __tablename__ = 'ParkingSpots'
    spotID = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.Enum('Available', 'Reserved', 'Occupied'), nullable=False, default='Available')

    def __init__(self, status='Available'):
        self.status = status

# Define the Reservations model
class Reservations(db.Model):
    __tablename__ = 'Reservations'
    reservationID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('Users.userID'), nullable=False)
    spotID = db.Column(db.Integer, db.ForeignKey('ParkingSpots.spotID'), nullable=False)
    startTime = db.Column(db.DateTime, nullable=False)
    endTime = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum('Active', 'Canceled', 'Expired'), nullable=False, default='Active')

    def __init__(self, userID, spotID, startTime, endTime, status='Active'):
        self.userID = userID
        self.spotID = spotID
        self.startTime = startTime
        self.endTime = endTime
        self.status = status

# Route to add a new user
@app.route('/add_user', methods=['POST'])
def add_user():
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

# Route to get all parking spots
@app.route('/parking_spots', methods=['GET'])
def get_parking_spots():
    spots = ParkingSpots.query.all()
    spots_list = []
    for spot in spots:
        spots_list.append({
            'spotID': spot.spotID,
            'status': spot.status
        })
    return jsonify(spots_list), 200

# Route to create a new reservation
@app.route('/reserve_spot', methods=['POST'])
def reserve_spot():
    data = request.get_json()
    userID = data.get('userID')
    spotID = data.get('spotID')
    startTimeStr = data.get('startTime')  # Expected format: 'YYYY-MM-DD HH:MM'
    endTimeStr = data.get('endTime')

    if not userID or not spotID or not startTimeStr or not endTimeStr:
        return jsonify({'message': 'Missing data'}), 400

    # Convert startTime and endTime from strings to datetime objects
    try:
        startTime = datetime.strptime(startTimeStr, '%Y-%m-%d %H:%M')
        endTime = datetime.strptime(endTimeStr, '%Y-%m-%d %H:%M')
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400

    # Ensure start and end times are on the same date
    if startTime.date() != endTime.date():
        return jsonify({'message': 'Start and end times must be on the same date'}), 400

    # Check if end time is after start time
    if endTime <= startTime:
        return jsonify({'message': 'End time must be after start time'}), 400

    # Check if the duration exceeds 8 hours
    duration = (endTime - startTime).total_seconds() / 3600  # duration in hours
    if duration > 8:
        return jsonify({'message': 'Reservation cannot exceed 8 hours'}), 400

    # Check if the spot is available
    spot = ParkingSpots.query.filter_by(spotID=spotID).first()
    if not spot or spot.status != 'Available':
        return jsonify({'message': 'Spot not available'}), 400

    # Create a new reservation
    new_reservation = Reservations(
        userID=userID,
        spotID=spotID,
        startTime=startTime,
        endTime=endTime,
        status='Active'
    )
    db.session.add(new_reservation)

    # Update the parking spot status to 'Reserved'
    spot.status = 'Reserved'
    db.session.commit()

    return jsonify({'message': 'Spot reserved successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
