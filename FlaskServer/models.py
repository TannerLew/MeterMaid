from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Define the Users model
class Users(db.Model):
    __tablename__ = 'Users'
    userID = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(50), nullable=False)
    lastName = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(250), nullable=False)
    mNumber = db.Column(db.String(8), nullable=False, unique=True)

    def __init__(self, firstName, lastName, mNumber, password):
        self.firstName = firstName
        self.lastName = lastName
        self.mNumber = mNumber
        self.password = password

# Define the ParkingSpots model
class ParkingSpots(db.Model):
    __tablename__ = 'ParkingSpots'
    spotID = db.Column(db.Integer, primary_key=True)

    def __init__(self):
        pass  # No additional fields needed

# Define the Reservations model
class Reservations(db.Model):
    __tablename__ = 'Reservations'
    reservationID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('Users.userID'), nullable=False)
    spotID = db.Column(db.Integer, db.ForeignKey('ParkingSpots.spotID'), nullable=False)
    startTime = db.Column(db.DateTime, nullable=False)
    endTime = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum('Active', 'Canceled', 'Expired'), nullable=False, default='Active')

    user = db.relationship('Users', backref='reservations')
    spot = db.relationship('ParkingSpots', backref='reservations')

    def __init__(self, userID, spotID, startTime, endTime, status='Active'):
        self.userID = userID
        self.spotID = spotID
        self.startTime = startTime
        self.endTime = endTime
        self.status = status
