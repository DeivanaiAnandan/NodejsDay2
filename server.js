const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3011;

const rooms = [
  {
    roomName: "MeetingRoom1",
    seatsAvailable: 50,
    amenities: ["Wi-Fi", "Projector"],
    pricePerHour: 50.0,
    id: 1,
  },
  {
    roomName: "MeetingRoom2",
    seatsAvailable: 20,
    amenities: ["Wi-Fi", "Projector"],
    pricePerHour: 80.0,
    id: 2,
  },
  {
    roomName: "MeetingRoom3",
    seatsAvailable: 20,
    amenities: ["Wi-Fi", "Projector"],
    pricePerHour: 100.0,
    id: 3,
  },
];
const bookings = [
  {
    customerName: "John Doe",
    date: "2023-12-31",
    startTime: "14:00",
    endTime: "16:00",
    bookingId:"1000",
    roomId: 1,
  },
  {
    customerName: "John",
    date: "2023-13-31",
    startTime: "14:00",
    endTime: "16:00",
    bookingId:"1001",
    roomId: 2,
  },
  {
    customerName: "Johnny",
    date: "2023-14-31",
    startTime: "14:00",
    endTime: "16:00",
    bookingId:"1002",
    roomId: 3,
  },
];

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hall Booking App API");
});


app.post("/createRoom", (req, res) => {
  const { roomName, seatsAvailable, amenities, pricePerHour } = req.body;

  
  if (!roomName || !seatsAvailable || !pricePerHour) {
    return res
      .status(400)
      .json({
        error: "Please provide roomName, seatsAvailable, and pricePerHour.",
      });
  }

  
  const newRoom = {
    id: rooms.length + 1,
    roomName,
    seatsAvailable,
    amenities,
    pricePerHour,
  };

  
  rooms.push(newRoom);

  res.status(201).json({ message: "Room created successfully", room: newRoom });
});

// Get All Rooms
app.get("/getRooms", (req, res) => {
  res.json({ rooms });
});


app.post("/bookRoom", (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  
  if (!customerName || !date || !startTime || !endTime || !roomId) {
    return res
      .status(400)
      .json({
        error:
          "Please provide customerName, date, startTime, endTime, and roomId.",
      });
  }

  
  const selectedRoom = rooms.find((room) => room.id === roomId);
  if (!selectedRoom) {
    return res
      .status(404)
      .json({ error: "Room not found with the provided ID." });
  }

  
  const conflictingBooking = bookings.find((booking) => {
    return (
      booking.roomId === roomId &&
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime))
    );
  });

  if (conflictingBooking) {
    return res
      .status(409)
      .json({
        error: "Room is already booked during the specified time range.",
      });
  }

  
  const newBooking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
  };

  
  bookings.push(newBooking);

  res
    .status(201)
    .json({ message: "Room booked successfully", booking: newBooking });
});

// Get All Bookings
app.get("/getBookings", (req, res) => {
  res.json({ bookings });
});

app.get("/getRoomsAndBookings", (req, res) => {
  const roomsWithBookings = rooms.map((room) => {
    const roomBookings = bookings.filter(
      (booking) => booking.roomId === room.id
    );
    const bookedDetails = roomBookings.map((booking) => ({
      customerName: booking.customerName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingId: booking.bookingId
      
    }));

    return {
      ...room,
      booked: roomBookings.length > 0,
      bookings: bookedDetails,
    };
  });

  res.json({ rooms: roomsWithBookings });
});

app.get("/getCustomersAndBookings", (req, res) => {
  const customersWithBookings = bookings.map((booking) => {
    const room = rooms.find((room) => room.id === booking.roomId);

    return {
      customerName: booking.customerName,
      roomName: room ? room.roomName : "Room not found",
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingId: booking.id,
    };
  });

  res.json({ customers: customersWithBookings });
});

app.get("/getCustomerBookingHistory/:customerName", (req, res) => {
    const { customerName } = req.params;
  
    const customerBookings = bookings.filter(
      (booking) => booking.customerName === customerName
    );
  
    if (customerBookings.length === 0) {
      return res.status(404).json({
        error: `No bookings found for customer: ${customerName}`,
      });
    }
  
    const bookingHistory = customerBookings.map((booking) => {
      const room = rooms.find((room) => room.id === booking.roomId);
  
      return {
        customerName: booking.customerName,
        roomName: room ? room.roomName : "Room not found",
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingId: booking.bookingId,  
        bookingDate: booking.date,
        bookingStatus: "Confirmed", 
      };
    });
  
    res.json({ bookingHistory });
});


app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
