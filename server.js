require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});

db.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Connected to database!");
  connection.release();
});

const createTables = () => {
  const createSeatingsTable = `CREATE TABLE IF NOT EXISTS seatings(
    seatingid INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    seatingname VARCHAR(45) NOT NULL
  )`;

  const createEventsTable = `CREATE TABLE IF NOT EXISTS events(
    eventid INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    eventname VARCHAR(255) NOT NULL,
    date VARCHAR(10) NOT NULL,
    artists LONGTEXT NOT NULL
  )`;

  const createReservationsTable = `CREATE TABLE IF NOT EXISTS reservations(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    seatingid INT NOT NULL,
    eventid INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    pin VARCHAR(4) NOT NULL,
    FOREIGN KEY (seatingid) REFERENCES seatings(seatingid),
    FOREIGN KEY (eventid) REFERENCES events(eventid)
  )`;

  db.query(createSeatingsTable, (err) => {
    if (err) console.log(err);
  });
  db.query(createEventsTable, (err) => {
    if (err) console.log(err);
  });
  db.query(createReservationsTable, (err) => {
    if (err) console.log(err);
  });
};

createTables();

const insertSeatingsNames = "INSERT INTO seatings (seatingname) VALUES ?";
const seatings = [
  ["smallbox1"],
  ["smallbox2"],
  ["smallbox3"],
  ["smallbox4"],
  ["smallbox5"],
  ["smallbox6"],
  ["smallbox7"],
  ["smallbox8"],
  ["smallbox9"],
  ["smallbox10"],
  ["box1"],
  ["box2"],
  ["box3"],
  ["box4"],
  ["box5"],
  ["box6"],
  ["box7"],
  ["box8"],
  ["lodge1"],
  ["lodge2"],
  ["lodge3"],
  ["table1"],
  ["table2"],
  ["table3"],
  ["table4"],
  ["table5"],
  ["table6"],
  ["table7"],
  ["table8"],
  ["table9"],
];

const insertEvents =
  "INSERT INTO events (eventid, eventname, date, artists) VALUES ?";
const events = [
  [
    1,
    "Event 1p",
    "14.07.2024",
    "Sed ut perspiciatis,unde omnis iste natus,error sit,voluptatem,accusantium doloremque,laudantium",
  ],
  [
    2,
    "Event 2p",
    "20.02.2025",
    "totam rem,aperiam,eaque ipsa quae,ab illo inventore",
  ],
  [
    3,
    "Event 3p",
    "04.03.2025",
    "veritatis et quasi,architecto beatae,vitae dicta sunt,explicabo",
  ],
  [
    4,
    "Event 4",
    "23.08.2025",
    "Nemo enim,ipsam voluptatem,quia,voluptas sit aspernatur,aut odit,aut fugit",
  ],
  [
    5,
    "Event 5",
    "03.10.2025",
    "Sed ut perspiciatis,unde omnis iste natus,error sit,voluptatem,accusantium doloremque,laudantium",
  ],
  [
    6,
    "Event 6",
    "27.11.2025",
    "totam rem,aperiam,eaque ipsa quae,ab illo inventore",
  ],
  [
    7,
    "Event 7",
    "10.12.2025",
    "veritatis et quasi,architecto beatae,vitae dicta sunt,explicabo",
  ],
  [
    8,
    "Event 8",
    "01.20.2026",
    "dignissimos,ducimus,qui blanditiis,praesentium,voluptatum,deleniti",
  ],
  [
    9,
    "Event 9",
    "02.19.2026",
    "ibero tempore,cum soluta,nobis est eligendi,optio,cumque,nihil impedit quo minus",
  ],
];

const insertReservations =
  "INSERT INTO reservations (id, seatingid, eventid, email, fullname, pin) VALUES ?";
const reservations = [
  [1, 3, 4, "x", "x", 1],
  [2, 6, 4, "x", "x", 1],
  [3, 10, 4, "x", "x", 1],
  [4, 16, 4, "x", "x", 1],
  [5, 30, 4, "x", "x", 1],
  [6, 25, 4, "x", "x", 1],
  [7, 4, 5, "x", "x", 1],
  [8, 23, 5, "x", "x", 1],
  [9, 2, 5, "x", "x", 1],
  [10, 16, 5, "x", "x", 1],
];

const initTables = () => {
  db.query("SELECT COUNT(*) AS count FROM seatings", (err, res) => {
    if (res[0].count === 0) {
      db.query(insertSeatingsNames, [seatings], (err) => {
        if (err) throw err;
      });
    }
  });
  db.query("SELECT COUNT(*) AS count FROM events", (err, res) => {
    if (res[0].count === 0) {
      db.query(insertEvents, [events], (err) => {
        if (err) throw err;
      });
    }
  });
  db.query("SELECT COUNT(*) AS count FROM reservations", (err, res) => {
    if (res[0].count === 0) {
      db.query(insertReservations, [reservations], (err) => {
        if (err) throw err;
      });
    }
  });
};

initTables();

app.get("/reservations/:eventid", (req, res) => {
  const eventId = req.params.eventid;
  const query = `SELECT r.id, r.email, r.fullname, r.pin, s.seatingname, e.eventname, e.date, e.artists 
                 FROM reservations r 
                 JOIN events e ON r.eventid = e.eventid 
                 JOIN seatings s ON r.seatingid = s.seatingid 
                 WHERE e.eventid = ?`;
  db.execute(query, [eventId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(results);
  });
});

app.get("/events", (req, res) => {
  db.query("SELECT * FROM events", (err, results) => {
    if (err) console.log(err);
    return res.json(results);
  });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
