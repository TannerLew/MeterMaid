from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Users, ParkingSpots, Reservations
from datetime import datetime, timedelta
import hashlib
app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Tanner1121@localhost/ParkingLotDB'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

import hashlib

# Route to add a new user (with password hashing)
@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    firstName = data.get('firstName')
    lastName = data.get('lastName')
    mNumber = data.get('mNumber')
    password = data.get('password')  # New field for password

    if not firstName or not lastName or not mNumber or not password:
        return jsonify({'message': 'Missing data'}), 400

    # Check if mNumber is unique
    existing_user = Users.query.filter_by(mNumber=mNumber).first()
    if existing_user:
        return jsonify({'message': 'M Number already exists'}), 400

    # Hash the password before storing it
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    new_user = Users(firstName=firstName, lastName=lastName, mNumber=mNumber, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User added successfully'}), 200


# Route to login a user
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    mNumber = data.get('mNumber')
    password = data.get('password')

    if not mNumber or not password:
        return jsonify({'message': 'Missing data'}), 400

    # Find the user by mNumber
    user = Users.query.filter_by(mNumber=mNumber).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Hash the entered password and compare with the stored hash
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    if hashed_password != user.password:
        return jsonify({'message': 'Incorrect password'}), 401

    # If password matches, login successful
    return jsonify({
        'message': 'Login successful',
        'userID': user.userID,
        'firstName': user.firstName  # Include firstName in response
    }), 200
# logout route
@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200

# Route to cancel a reservation
@app.route('/cancel_reservation', methods=['POST'])
def cancel_reservation():
    data = request.get_json()
    reservationID = data.get('reservationID')
    userID = data.get('userID')

    if not reservationID or not userID:
        return jsonify({'message': 'Missing data'}), 400

    # Fetch the reservation
    reservation = Reservations.query.filter_by(reservationID=reservationID, userID=userID, status='Active').first()
    if not reservation:
        return jsonify({'message': 'Reservation not found or already canceled'}), 404

    # Update the reservation status to 'Canceled'
    reservation.status = 'Canceled'
    db.session.commit()

    return jsonify({'message': 'Reservation canceled successfully'}), 200


@app.route('/user_reservations/<int:userID>', methods=['GET'])
def get_user_reservations(userID):
    # Fetch active reservations for the user
    reservations = Reservations.query.filter_by(userID=userID, status='Active').all()
    
    reservations_list = []
    for res in reservations:
        reservations_list.append({
            'reservationID': res.reservationID,
            'spotID': res.spotID,
            'startTime': res.startTime.strftime('%Y-%m-%d %H:%M'),
            'endTime': res.endTime.strftime('%Y-%m-%d %H:%M'),
            'status': res.status
        })
    
    return jsonify(reservations_list), 200


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
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({'message': 'Date parameter is required'}), 400

    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': f'Invalid date format received: {date_str}'}), 400

    today = datetime.now().date()
    now = datetime.now()

    # Check if selected date is today and calculate hours left in the day
    if selected_date == today:
        hours_left_today = 24 - now.hour - (1 if now.minute > 0 else 0)
    else:
        hours_left_today = 24  # Assume a full day for future dates

    spots = ParkingSpots.query.all()
    spots_list = []

    for spot in spots:
        # Fetch all active reservations for this spot on the selected date
        reservations = Reservations.query.filter(
            Reservations.spotID == spot.spotID,
            Reservations.status == 'Active',
            db.func.date(Reservations.startTime) == selected_date
        ).all()

        # Calculate total hours reserved, adjusted for remaining hours if today
        hours_reserved = 0
        for res in reservations:
            res_start = max(now, res.startTime) if selected_date == today else res.startTime
            res_end = res.endTime
            if res_end > res_start:
                duration = (res_end - res_start).total_seconds() / 3600  # Convert to hours
                hours_reserved += duration

        # Cap hours_reserved to hours_left_today if today is selected
        hours_reserved = min(hours_reserved, hours_left_today)

        # Append spot data including adjusted totalHours based on current day or future day
        spots_list.append({
            'spotID': spot.spotID,
            'hoursReserved': hours_reserved,
            'totalHours': hours_left_today  # Adjusted based on remaining hours today or 24 for future dates
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
        
        return jsonify({'message': f'Invalid date format received: {date_str}'}), 400


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
