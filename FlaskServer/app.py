from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Users, ParkingSpots, Reservations
from datetime import datetime
import hashlib

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Tanner1121@localhost/ParkingLotDB'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# Add a new user
@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    firstName = data.get('firstName')
    lastName = data.get('lastName')
    mNumber = data.get('mNumber')
    password = data.get('password')

    if not all([firstName, lastName, mNumber, password]):
        return jsonify({'message': 'Missing data'}), 400

    if Users.query.filter_by(mNumber=mNumber).first():
        return jsonify({'message': 'M Number already exists'}), 400

    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    new_user = Users(firstName=firstName, lastName=lastName, mNumber=mNumber, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User added successfully'}), 200

# User login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    mNumber = data.get('mNumber')
    password = data.get('password')

    if not all([mNumber, password]):
        return jsonify({'message': 'Missing data'}), 400

    user = Users.query.filter_by(mNumber=mNumber).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    if hashed_password != user.password:
        return jsonify({'message': 'Incorrect password'}), 401

    return jsonify({
        'message': 'Login successful',
        'userID': user.userID,
        'firstName': user.firstName
    }), 200

# User logout
@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200

# Cancel a reservation
@app.route('/cancel_reservation', methods=['POST'])
def cancel_reservation():
    data = request.get_json()
    reservationID = data.get('reservationID')
    userID = data.get('userID')

    if not all([reservationID, userID]):
        return jsonify({'message': 'Missing data'}), 400

    reservation = Reservations.query.filter_by(
        reservationID=reservationID,
        userID=userID,
        status='Active'
    ).first()

    if not reservation:
        return jsonify({'message': 'Reservation not found or already canceled'}), 404

    reservation.status = 'Canceled'
    db.session.commit()

    return jsonify({'message': 'Reservation canceled successfully'}), 200

# Get user reservations
@app.route('/user_reservations/<int:userID>', methods=['GET'])
def get_user_reservations(userID):
    reservations = Reservations.query.filter_by(userID=userID, status='Active').all()
    reservations_list = [{
        'reservationID': res.reservationID,
        'spotID': res.spotID,
        'startTime': res.startTime.strftime('%Y-%m-%d %H:%M'),
        'endTime': res.endTime.strftime('%Y-%m-%d %H:%M'),
        'status': res.status
    } for res in reservations]

    return jsonify(reservations_list), 200

# Get all users
@app.route('/users', methods=['GET'])
def get_users():
    users = Users.query.all()
    users_list = [{
        'userID': user.userID,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'mNumber': user.mNumber
    } for user in users]

    return jsonify(users_list), 200

# Get parking spots status
@app.route('/parking_spots', methods=['GET'])
def get_parking_spots():
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({'message': 'Date parameter is required'}), 400

    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': f'Invalid date format: {date_str}'}), 400

    today = datetime.now().date()
    now = datetime.now()

    hours_left_today = 24 - now.hour - (1 if now.minute > 0 else 0) if selected_date == today else 24

    spots = ParkingSpots.query.all()
    spots_list = []

    for spot in spots:
        reservations = Reservations.query.filter(
            Reservations.spotID == spot.spotID,
            Reservations.status == 'Active',
            db.func.date(Reservations.startTime) == selected_date
        ).all()

        hours_reserved = 0
        for res in reservations:
            res_start = max(now, res.startTime) if selected_date == today else res.startTime
            res_end = res.endTime
            if res_end > res_start:
                duration = (res_end - res_start).total_seconds() / 3600
                hours_reserved += duration

        hours_reserved = min(hours_reserved, hours_left_today)
        spots_list.append({
            'spotID': spot.spotID,
            'hoursReserved': hours_reserved,
            'totalHours': hours_left_today
        })

    return jsonify(spots_list), 200

# Get unavailable times for a spot
@app.route('/available_times/<int:spotID>', methods=['GET'])
def get_available_times(spotID):
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({'message': 'Date parameter is required'}), 400

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': f'Invalid date format: {date_str}'}), 400

    reservations = Reservations.query.filter(
        Reservations.spotID == spotID,
        Reservations.status == 'Active',
        db.func.date(Reservations.startTime) == date
    ).all()

    unavailable_slots = [{
        'startTime': res.startTime.strftime('%H:%M'),
        'endTime': res.endTime.strftime('%H:%M')
    } for res in reservations]

    return jsonify({'unavailableSlots': unavailable_slots}), 200

# Create a new reservation
@app.route('/reserve_spot', methods=['POST'])
def reserve_spot():
    data = request.get_json()
    userID = data.get('userID')
    spotID = data.get('spotID')
    startTimeStr = data.get('startTime')
    endTimeStr = data.get('endTime')

    if not all([userID, spotID, startTimeStr, endTimeStr]):
        return jsonify({'message': 'Missing data'}), 400

    try:
        startTime = datetime.strptime(startTimeStr, '%Y-%m-%d %H:%M')
        endTime = datetime.strptime(endTimeStr, '%Y-%m-%d %H:%M')
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400

    if startTime.date() != endTime.date():
        return jsonify({'message': 'Start and end times must be on the same date'}), 400

    if endTime <= startTime:
        return jsonify({'message': 'End time must be after start time'}), 400

    duration = (endTime - startTime).total_seconds() / 3600
    if duration > 8:
        return jsonify({'message': 'Reservation cannot exceed 8 hours'}), 400

    overlap = Reservations.query.filter(
        Reservations.spotID == spotID,
        Reservations.status == 'Active',
        Reservations.endTime > startTime,
        Reservations.startTime < endTime
    ).first()

    if overlap:
        return jsonify({'message': 'Spot is already reserved during this time'}), 400

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
