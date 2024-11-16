from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Define the Users model
class Users(db.Model):
    __tablename__ = 'Users'
    userID = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(50), nullable=False)
    lastName = db.Column(db.String(50), nullable=False)
    mNumber = db.Column(db.String(8), nullable=False, unique=True)
    password = db.Column(db.String(250), nullable=False)
    # Relationship to Cars
    cars = db.relationship('Cars', backref='owner', cascade='all, delete-orphan')
    # Relationship to Reservations
    reservations = db.relationship('Reservations', backref='user', cascade='all, delete-orphan')

    def __init__(self, firstName, lastName, mNumber, password):
        self.firstName = firstName
        self.lastName = lastName
        self.mNumber = mNumber
        self.password = password

# Define the ParkingSpots model
class ParkingSpots(db.Model):
    __tablename__ = 'ParkingSpots'
    spotID = db.Column(db.Integer, primary_key=True)
    # Relationship to Reservations
    reservations = db.relationship('Reservations', backref='spot', cascade='all, delete-orphan')

    def __init__(self):
        pass  

# Define the Cars model
class Cars(db.Model):
    __tablename__ = 'Cars'
    carID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('Users.userID'), nullable=False)
    make = db.Column(db.String(40), nullable=False)
    model = db.Column(db.String(40), nullable=False)
    color = db.Column(db.String(20), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    licensePlate = db.Column(db.String(20), nullable=False, unique=True)
    # Relationship to Reservations
    reservations = db.relationship('Reservations', backref='car', cascade='all, delete-orphan')

    def __init__(self, userID, make, model, color, year, licensePlate):
        self.userID = userID
        self.make = make
        self.model = model
        self.color = color
        self.year = year
        self.licensePlate = licensePlate

# Define the Reservations model
class Reservations(db.Model):
    __tablename__ = 'Reservations'
    reservationID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('Users.userID'), nullable=False)
    spotID = db.Column(db.Integer, db.ForeignKey('ParkingSpots.spotID'), nullable=False)
    carID = db.Column(db.Integer, db.ForeignKey('Cars.carID'), nullable=True)
    startTime = db.Column(db.DateTime, nullable=False)
    endTime = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum('Active', 'Canceled', 'Expired'), nullable=False, default='Active')

    def __init__(self, userID, spotID, startTime, endTime, status='Active', carID=None):
        self.userID = userID
        self.spotID = spotID
        self.carID = carID
        self.startTime = startTime
        self.endTime = endTime
        self.status = status
