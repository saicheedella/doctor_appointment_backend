const Email = require('email-templates');
require('dotenv').config();

const sendEmail = async (message) => {
  message.from = 'Doctor Appointment app <donotreply@doctorappointment.com';
  const email = new Email({
    preview: true,
  });

  email.send({
    message,
  });
};

module.exports = { sendEmail };
