require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: process.env["DB_HOST"],
  user: process.env["DB_USER"],
  password: process.env["DB_PASS"],
  database: process.env["DB_DATABASE"],
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
  db.query(
    "CREATE DATABASE IF NOT EXISTS technoclubproject",
    function (err, result) {
      if (err) throw err;
      console.log("Database created");
    }
  );
});

const createSeatingsTable = `CREATE TABLE IF NOT EXISTS seatings(
    seatingid INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    seatingname VARCHAR(45) NOT NULL
  )`;

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

db.query(createSeatingsTable, (err, res) => {
  if (err) {
    console.log(err);
  }
});

function initTables() {
  try {
    // const rows = db.query("SELECT COUNT(*) AS count FROM seatings");
    // console.log(rows);
    // if (rows[0].count > 0) {
    //   db.query(insertSeatingsNames, [seatings], function (err, result) {
    //     if (err) throw err;
    //   });
    // }
    db.query("SELECT COUNT(*) AS count FROM seatings", (err, res) => {
      if (res[0].count === 0) {
        db.query(insertSeatingsNames, [seatings], function (err, result) {
          if (err) throw err;
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
}

initTables();

const createEventsTable = `CREATE TABLE IF NOT EXISTS events(
    eventid INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    eventname VARCHAR(255) NOT NULL,
    date VARCHAR(10) NOT NULL,
    artists LONGTEXT NOT NULL
  )`;

db.query(createEventsTable, (err, res) => {
  if (err) {
    console.log(err);
  }
});

const createReservationsTable = `CREATE TABLE IF NOT EXISTS reservations(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    seatingtid INT NOT NULL,
    eventid INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    pin VARCHAR(4) NOT NULL,
    FOREIGN KEY (seatingtid) REFERENCES seatings(seatingid),
    FOREIGN KEY (eventid) REFERENCES events(eventid)
  )`;

db.query(createReservationsTable, (err, res) => {
  if (err) {
    console.log(err);
  }
});
app.get("/reservations/:eventid", (req, res) => {
  const eventId = req.params.eventid;
  const query = `SELECT
      r.id AS reservationId,
      r.email,
      r.fullname,
      r.pin,
      s.seatingname,
      e.eventname,
      e.date,
      e.artists
    FROM
      reservations r
    JOIN
      events e ON r.eventid = e.eventid
    JOIN
      seatings s ON r.seatingid = s.seatingid
    WHERE
      e.eventid = ?
   `;

  db.execute(query, [eventId], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    return res.json(results);
  });
});

app.get("/events", (req, res) => {
  const query = "SELECT * FROM events";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
    }
    return res.json(results);
  });
});

app.listen(3000, () => {
  console.log("listng");
});
