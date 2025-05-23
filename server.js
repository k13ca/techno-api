require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const cron = require("node-cron");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

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
const createTables = async () => {
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

  const queryPromise = (sql) => {
    return new Promise((resolve, reject) => {
      db.query(sql, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  };

  return Promise.all([
    queryPromise(createSeatingsTable),
    queryPromise(createEventsTable),
    queryPromise(createReservationsTable),
  ]).then(() => true);
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

const initTables = async () => {
  const checkAndInsert = (table, countSql, insertSql, data) => {
    return new Promise((resolve, reject) => {
      db.query(countSql, (err, res) => {
        if (err) return reject(err);
        if (res[0].count === 0) {
          db.query(insertSql, [data], (err2) => {
            if (err2) return reject(err2);
            console.log(`Dane dodane do tabeli ${table}`);
            resolve();
          });
        } else {
          console.log(`Tabela ${table} już zawiera dane`);
          resolve();
        }
      });
    });
  };

  try {
    await checkAndInsert(
      "seatings",
      "SELECT COUNT(*) AS count FROM seatings",
      insertSeatingsNames,
      seatings
    );
    await checkAndInsert(
      "events",
      "SELECT COUNT(*) AS count FROM events",
      insertEvents,
      events
    );
    await checkAndInsert(
      "reservations",
      "SELECT COUNT(*) AS count FROM reservations",
      insertReservations,
      reservations
    );
  } catch (err) {
    console.error("Błąd podczas inicjalizacji tabel:", err);
    throw err;
  }
};

initTables();

app.get("/reservations/:eventid", (req, res) => {
  const eventId = req.params.eventid;
  const query = `SELECT r.id, r.email, r.fullname, r.pin, s.seatingname, s.seatingid, e.eventid, e.eventname, e.date, e.artists 
                 FROM reservations r 
                 JOIN events e ON r.eventid = e.eventid 
                 JOIN seatings s ON r.seatingid = s.seatingid 
                 WHERE e.eventid = ?`;
  db.execute(query, [eventId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(results);
  });
});

app.get("/reservations", (req, res) => {
  const query = `SELECT r.id, r.email, r.fullname, r.pin, s.seatingname, s.seatingid, e.eventid, e.eventname, e.date, e.artists 
                 FROM reservations r 
                 JOIN events e ON r.eventid = e.eventid 
                 JOIN seatings s ON r.seatingid = s.seatingid `;
  db.execute(query, (err, results) => {
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

app.post("/create-reservation", async (req, res) => {
  console.log("backend reservation modal click", req.body);
  const reservation = req.body;

  const seatingId = await getSeatingId(reservation.seatingname);
  const eventId = await getEventId(reservation.title);
  console.log(seatingId);
  console.log(eventId);

  db.query(
    insertCreateReservation,
    [seatingId, eventId, reservation.pin, "email", "fullname"],
    (error, res) => {
      console.log(error);
    }
  );
});

app.patch("/update-reservation", async (req, res) => {
  console.log(req.body);
  const reservation = req.body;
  const seatingId = await getSeatingId(reservation.seatingname);
  const eventId = await getEventId(reservation.title);
  console.log(seatingId, eventId);

  const reservationId = await getReservationId(seatingId, eventId);
  console.log("reservationId", reservationId);

  db.query(
    "UPDATE reservations SET email = ?, fullname = ? WHERE id = ?",
    [reservation.email, reservation.fullname, reservationId],
    (err, result) => {
      if (err) {
      }
      res.json({ success: true, message: "reservation deleted successfully" });
    }
  );
});

app.delete("/delete-event", async (req, res) => {
  console.log(req.body);
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "eventId is required" });
  }

  db.query("DELETE FROM events WHERE eventid = ?", [eventId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true, message: "Event deleted successfully" });
  });
});

app.delete("/delete-reservation", async (req, res) => {
  console.log(req.body);
  const { reservationId } = req.body;

  if (!reservationId) {
    return res.status(400).json({ error: "reservationId is required" });
  }

  db.query(
    "DELETE FROM reservations WHERE id = ?",
    [reservationId],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "reservation not found" });
      }

      res.json({ success: true, message: "reservation deleted successfully" });
    }
  );
});

app.post("/add-event", async (req, res) => {
  const { title, date, artists } = req.body;

  db.query(insertNewEvent, [title, date, artists], (error, response) => {
    if (error) {
      return res
        .status(500)
        .json({ msg: "Błąd serwera", error: error.message });
    }
    return res
      .status(201)
      .set("X-Test-Header", "Sukces")
      .json({ msg: "Dodano event", eventId: response });
  });
});

app.post("/send-mail", async (req, res) => {
  console.log(req.body);
  sendEmail(req.body);
});

const insertCreateReservation =
  "INSERT INTO reservations (seatingid, eventid, pin, email, fullname) VALUES (?, ?, ?, ?, ?)";
const insertNewEvent =
  "INSERT INTO events (eventname, date, artists) VALUES (?, ?, ?)";

function getSeatingId(seatingname) {
  return new Promise((resolve, reject) => {
    const selectIdsSql = `SELECT seatingid FROM seatings WHERE seatingname = ?`;
    db.query(selectIdsSql, [seatingname], (err, res) => {
      if (err) return reject(err);
      resolve(res[0]?.seatingid); // Pobiera pierwszy seatingid, jeśli istnieje
    });
  });
}
function getEventId(eventTitle) {
  return new Promise((resolve, reject) => {
    const selectIdsSql = `SELECT eventid FROM events WHERE eventname = ?`;
    db.query(selectIdsSql, [eventTitle], (err, res) => {
      if (err) return reject(err);
      resolve(res[0]?.eventid); // Pobiera pierwszy seatingid, jeśli istnieje
    });
  });
}
function getReservationId(seatingid, eventid) {
  return new Promise((resolve, reject) => {
    const selectIdsSql = `SELECT id FROM reservations WHERE eventid = ? and seatingid = ?`;
    db.query(selectIdsSql, [eventid, seatingid], (err, res) => {
      if (err) return reject(err);
      resolve(res[0]?.id); // Pobiera pierwszy seatingid, jeśli istnieje
    });
  });
}

async function sendEmail({ email, title, date, seatingname, fullname, pin }) {
  const mailOptions = {
    from: "13.apps.dev@gmail.com",
    to: `${email}`,
    subject: "Techno Club Project",
    text: "Here is a pin for Your reservation",
    html: `<h2>HELLO!</h2>\n
    <h3>You created reservation for <u>${title}<u> event at <u>${date}<u> on <u>${seatingname}<u> seating.</h3>\n
    <h3>Use code below to confirm Your reservation:</h3>\n
    <div class="email-pin"><h1>${pin}</h1></div>
    <h3>Reservation in the name of: <u>${fullname}<u></h3>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

function dropTable(tableName) {
  return new Promise((resolve, reject) => {
    const sql = `DROP TABLE IF EXISTS ??`;
    db.query(sql, [tableName], (err, res) => {
      if (err) return reject(err);
      console.log(`Usunięto tabelę: ${tableName}`);
      resolve(res);
    });
  });
}

cron.schedule("0 0 * * *", async () => {
  try {
    await dropTable("reservations");
    await dropTable("seatings");
    await dropTable("events");
    await createTables();
    initTables();
  } catch (err) {
    console.error("Błąd w zadaniu CRON:", err);
  }
});
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
