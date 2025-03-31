async function sendEmail(
  email,
  eventname,
  eventdate,
  seatingname,
  fullname,
  pin
) {
  const mailOptions = {
    from: '"TECHNO CLUB PROJECT" <kodtechno@contact.com>',
    to: `${email}`,
    subject: "Techno Club Project",
    text: "Here is a pin for Your reservation",
    html: `<h2>HELLO!</h2>\n
    <h3>You created reservation for <u>${eventname}<u> event at <u>${eventdate}<u> on <u>${seatingname}<u> seating.</h3>\n
    <h3>Use code below to confirm Your reservation:</h3>\n
    <div class="email-pin"><h1>${pin}</h1></div>
    <h3>Reservation in the name of: <u>${fullname}<u></h3>`,
    attachments: [{}],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
