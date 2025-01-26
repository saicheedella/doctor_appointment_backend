const { appointments, users, slots } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { sendEmail } = require('../utils/mailer');

const appointmentsRemainderService = async () => {
  let slotsInThisHour = await slots.findAll({
    where: {
      booked: 1,
      startTime: {
        [Op.and]: {
          [Op.gte]: moment().startOf('h').format('YYYY-MM-DD HH:mm:ss'),
          [Op.lte]: moment().endOf('h').format('YYYY-MM-DD HH:mm:ss'),
        },
      },
    },
  });

  for (let eachSlot of slotsInThisHour) {
    let appointmentOfSlot = await appointments.findOne({ where: { slotId: eachSlot } });
    if (appointmentOfSlot) {
      let doctor = await users.findOne({ where: { id: appointmentOfSlot.doctorId } });
      let patient = await users.findOne({ where: { id: appointmentOfSlot.patientId } });

      let messagetoDoctor = {
        to: doctor.email,
        subject: 'Are you ready!',
        text: `${patient.name} had an appointment with you at ${moment(slotToBeBooked.startTime).format(
          'MMMM Do YYYY, h:mm a'
        )}.`,
      };

      // to patient
      let messagetoPatient = {
        to: patient.email,
        subject: 'Are you ready!',
        text: `You had an appointment with ${doctor.name} at ${moment(slotToBeBooked.startTime).format(
          'MMMM Do YYYY, h:mm a'
        )}.`,
      };

      await sendEmail(messagetoDoctor);
      await sendEmail(messagetoPatient);
      return;
    }
  }
};

module.exports = { appointmentsRemainderService };
