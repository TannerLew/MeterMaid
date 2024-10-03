from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Users, ParkingSpots, Reservations
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Tanner1121@localhost/ParkingLotDB'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

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

# Route to get all parking spots with fullness status
@app.route('/parking_spots', methods=['GET'])
def get_parking_spots():
    spots = ParkingSpots.query.all()
    spots_list = []
    now = datetime.now()

    # Calculate the number of active reservations per spot
    for spot in spots:
        active_reservations = Reservations.query.filter(
            Reservations.spotID == spot.spotID,
            Reservations.status == 'Active',
            Reservations.endTime > now
        ).count()

        # Determine the status based on the number of active reservations
        # For simplicity, we'll assume a maximum of 4 reservations per spot per day
        if active_reservations == 0:
            status = 'NoReservations'
        elif active_reservations == 1:
            status = 'QuarterReserved'
        elif active_reservations == 2:
            status = 'HalfReserved'
        elif active_reservations == 3:
            status = 'ThreeFourthsReserved'
        else:
            status = 'FullyReserved'

        spots_list.append({
            'spotID': spot.spotID,
            'status': status
        })

    return jsonify(spots_list), 200

# Route to get unavailable times for a spot
@app.route('/available_times/<int:spotID>', methods=['GET'])
def get_available_times(spotID):
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({'message': 'Date parameter is required'}), 400

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400

    # Fetch all reservations for the spot on that date
    reservations = Reservations.query.filter(
        Reservations.spotID == spotID,
        Reservations.status == 'Active',
        db.func.date(Reservations.startTime) == date
    ).all()

    # Build a list of unavailable time slots
    unavailable_slots = []
    for res in reservations:
        unavailable_slots.append({
            'startTime': res.startTime.strftime('%H:%M'),
            'endTime': res.endTime.strftime('%H:%M')
        })

    return jsonify({
        'unavailableSlots': unavailable_slots
    }), 200

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

    # Check for overlapping reservations
    overlapping_reservations = Reservations.query.filter(
        Reservations.spotID == spotID,
        Reservations.status == 'Active',
        Reservations.endTime > startTime,
        Reservations.startTime < endTime
    ).first()

    if overlapping_reservations:
        return jsonify({'message': 'Spot is already reserved during this time'}), 400

    # Create a new reservation
    new_reservation = Reservations(
        userID=userID,
        spotID=spotID,
        startTime=startTime,
        endTime=endTime,
        status='Active'
    )
    db.session.add(new_reservation)
    db.session.commit()

    return jsonify({'message': 'Spot reserved successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
