const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { appointments, departments, userTypes, users, slots } = require('../models');
const path = require('path');
const moment = require('moment');
var fs = require('fs');
const fileDir = './uploads';

const multer = require('multer');
const { sendEmail } = require('../utils/mailer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, fileDir);
  },

  filename: function (req, file, cb) {
    let fileName = Date.now() + '-' + file.originalname;
    req.uploadedFile = fileName;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage }).single('image');

function uploadAsync(req, res, next) {
  return new Promise(function (resolve, reject) {
    upload(req, res, async function (err) {
      if (err || err !== undefined) return res.json(err);
      let user = await users.findOne({
        where: {
          id: req.params.id,
        },
      });

      user.photo = req.uploadedFile;
      await user.save();
      return res.json({
        success: true,
        user,
      });
    });
  });
}

const tokenForUser = (u) =>
  jwt.sign({ userId: u.id }, 'fkajdaskldnask', {
    expiresIn: '1 day',
    mutatePayload: true,
  });

router.post('/register', async (req, res) => {
  try {
    let { name, userTypeId, email, phone, dob, gender, password, departmentId } = req.body;

    if (!name || !userTypeId || !email || !gender || !phone || !dob || !password) {
      res.json({
        success: false,
        message: 'all fields are required!',
      });
      return;
    }

    if (userTypeId === 2 && !departmentId) {
      res.json({
        success: false,
        message: 'Please Select Department !',
      });
      return;
    }

    let alreadyExists = await users.findOne({
      where: {
        email,
      },
    });

    if (alreadyExists) {
      res.json({
        success: false,
        message: `user already exists with ${email}!`,
      });
      return;
    }

    let created = await users.create({
      name,
      userTypeId,
      email,
      phone,
      dob,
      gender,
      password,
      departmentId,
    });

    const token = tokenForUser(created);

    res.json({
      success: true,
      user: created,
      token,
    });
  } catch (error) {
    console.trace(error);
    res.json({
      success: false,
      error,
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      res.json({
        success: false,
        message: 'all fields are required!',
      });
      return;
    }

    let alreadyExists = await users.findOne({
      where: {
        email,
      },
    });

    if (!alreadyExists) {
      res.json({
        success: false,
        message: `no user exists with ${email}!`,
      });
      return;
    }

    let validPassword = password === alreadyExists.password;
    if (!validPassword) {
      res.json({
        success: false,
        message: 'password incorrect!',
      });
      return;
    }
    alreadyExists = JSON.parse(JSON.stringify(alreadyExists));
    let dept = alreadyExists.departmentId && (await departments.findOne({ where: { id: alreadyExists.departmentId } }));
    alreadyExists.department = dept;

    const token = tokenForUser(alreadyExists);
    res.json({
      success: true,
      user: alreadyExists,
      token,
    });
  } catch (error) {
    console.trace(error);
    res.json({
      success: false,
      error,
    });
  }
});

router.get('/userTypes', async (req, res) => {
  try {
    let usertypes = await userTypes.findAll({});
    res.json({
      success: true,
      userTypes: usertypes,
    });
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
});

router.get('/departments', async (req, res) => {
  try {
    res.json({
      success: true,
      departments: await departments.findAll({}),
    });
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
});

router.get('/openForAppointments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let where = { userTypeId: 2, id };

    let user = await users.findOne({
      where,
    });

    if (!user) {
      res.json({
        success: false,
      });
      return;
    }

    user.openForAppointments = !user.openForAppointments;
    await user.save();
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.trace(error);
    res.json({
      success: false,
      error,
    });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { id, name, userTypeId, email, phone, gender, password, departmentId, openForAppointments, about } = req.body;
    console.log({ id, name, userTypeId, email, phone, gender, password, departmentId, openForAppointments });
    let where = { id };

    let user = await users.findOne({
      where,
    });

    if (!user) {
      res.json({
        success: false,
      });
      return;
    }

    if (name) user.name = name;
    if (userTypeId) user.userTypeId = userTypeId;
    if (email) user.email = email;
    if (gender) user.gender = gender;
    if (departmentId) user.departmentId = departmentId;
    if (phone) user.phone = phone;
    if (password) user.password = password;
    if (about) user.about = about;
    if (openForAppointments !== null) user.openForAppointments = openForAppointments;
    await user.save();

    let dept = user.departmentId && (await departments.findOne({ where: { id: user.departmentId } }));
    user.department = dept;

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.trace(error);
    res.json({
      success: false,
      error,
    });
  }
});

router.post('/doctors', async (req, res) => {
  try {
    const { name, department, gender } = req.body;

    let where = { userTypeId: 2, openForAppointments: 1 };

    if (department && department.id) {
      where.departmentId = department.id;
    }

    if (name) {
      where.name = {
        [Op.like]: '%' + name + '%',
      };
    }

    if (gender) {
      where.gender = {
        [Op.like]: gender,
      };
    }

    let alldoctors = await users.findAll({
      where,
      attributes: {
        exclude: ['password', 'phone', 'email'],
      },
    });

    alldoctors = JSON.parse(JSON.stringify(alldoctors));
    let doctors = [];
    for (let eachDoctor of alldoctors) {
      let dept = await departments.findOne({ where: { id: eachDoctor.departmentId } });
      doctors.push({ ...eachDoctor, department: dept });
    }
    res.json({
      success: true,
      doctors: doctors,
    });
  } catch (error) {
    console.trace(error);
    res.json({
      success: false,
      error,
    });
  }
});

router.post('/get-slots', async (req, res) => {
  try {
    const { date, doctorId } = req.body;

    if (!date) {
      res.json({ success: false });
      return;
    }

    let where = {
      doctorId,
      startTime: {
        [Op.and]: {
          [Op.gte]: moment(moment(date).format('YYYY-MM-DD')).format('YYYY-MM-DD 00:00:00'),
          [Op.lte]: moment(moment(date).format('YYYY-MM-DD')).format('YYYY-MM-DD 23:59:59'),
        },
      },
    };

    let allSlotsOnThatDay = await slots.findAll({ where });
    if (allSlotsOnThatDay.length === 0) {
      let hours = Array.from(Array(25).keys());
      hours = hours.slice(9, 22);
      hours = hours.map((h) => (h > 9 ? `${h.toString()}:00` : `0${h}:00`));
      for (let eachSlot of hours) {
        const newSlotTime = getTimeOfTheDayAt(date, eachSlot);
        await slots.create({
          doctorId,
          startTime: moment(moment(newSlotTime)).format('YYYY-MM-DD HH:mm:ss'),
        });
      }
    }

    allSlotsOnThatDay = await slots.findAll({ where });

    let sortedSlots = allSlotsOnThatDay.sort(function (a, b) {
      return new Date(moment(b.startTime)) - new Date(moment(a.startTime));
    });

    let finalSlots = [];
    for (let eachSlot of sortedSlots) {
      let isFutureDate = moment(eachSlot.startTime).isAfter();
      if (isFutureDate) {
        finalSlots.push(eachSlot);
      }
    }
    res.json({
      success: true,
      slots: finalSlots,
    });
  } catch (error) {
    console.trace(error);
    res.json({
      success: false,
      error,
    });
  }
});

router.post('/book-slot', async (req, res) => {
  try {
    const { slotId, patientId, description } = req.body;
    let slotToBeBooked = await slots.findOne({ where: { id: slotId } });
    let doctor = await users.findOne({ where: { id: slotToBeBooked.doctorId } });
    let patient = await users.findOne({ where: { id: patientId } });

    if (!slotToBeBooked || slotToBeBooked.booked) {
      res.json({
        success: false,
        error: `selected slot is unavailable`,
      });
    }

    let appointment = await appointments.create({
      patientId,
      slotId: slotToBeBooked.id,
      description,
      doctorId: slotToBeBooked.doctorId,
    });

    slotToBeBooked.booked = true;

    await slotToBeBooked.save();

    // to doctor
    let messagetoDoctor = {
      to: doctor.email,
      subject: 'New Appointment',
      text: `${patient.name} had booked an appointment with you on ${moment(slotToBeBooked.startTime).format("MMMM Do YYYY, h:mm a")}.`,
    };

    // to patient
    let messagetoPatient = {
      to: patient.email,
      subject: 'Appointment booked successfully!',
      text: `You had booked an appointment with ${doctor.name} on ${moment(slotToBeBooked.startTime).format("MMMM Do YYYY, h:mm a")}.`,
    };

    await sendEmail(messagetoDoctor);
    await sendEmail(messagetoPatient);

    res.json({
      success: true,
      slot: slotToBeBooked,
      appointment,
    });
  } catch (error) {
    console.trace(error);
    res.json({
      success: false,
      error,
    });
  }
});

router.post('/appointments', async (req, res) => {
  try {
    const { id } = req.body;

    let apps = await appointments.findAll({ where: { [Op.or]: { patientId: id, doctorId: id } } });
    apps = JSON.parse(JSON.stringify(apps));

    for (let eachApp of apps) {
      let slot = await slots.findOne({ where: eachApp.slotId });
      let isPast = moment(slot.startTime).isBefore();
      let exclude = ['password'];
      if (!isPast) {
        exclude = [...exclude, 'email', 'phone'];
      }
      let patient = await users.findOne({
        where: eachApp.patientId,
        attributes: {
          exclude,
        },
      });
      let doctor = await users.findOne({
        where: eachApp.doctorId,
        attributes: {
          exclude,
        },
      });
      eachApp.slot = slot;
      eachApp.patient = patient;
      eachApp.doctor = doctor;
    }

    res.json({
      success: true,
      appointments: apps,
    });
  } catch (error) {
    console.trace(error);
    res.json({
      success: false,
      error,
    });
  }
});

router.post('/prescription', async (req, res) => {
  try {
    const { prescription, appointmentId } = req.body;

    let app = await appointments.findOne({ where: { id: appointmentId } });
    let doctor = await users.findOne({ where: { id: app.doctorId } });
    let patient = await users.findOne({ where: { id: app.patientId } });

    if (prescription) app.prescription = prescription;

    await app.save();

    // to patient
    let messagetoPatient = {
      to: patient.email,
      subject: 'Doctor has updated the prescription!',
      text: `Dr.${doctor.name} has updated the prescription / report for your consultation. Please have a look.`,
    };

    await sendEmail(messagetoPatient);

    res.json({
      success: true,
      appointment: app,
    });
  } catch (error) {
    console.trace(error);
    res.json({
      success: false,
      error,
    });
  }
});

router.post('/upload/:id', uploadAsync);

router.get('/image/:imageName', (req, res) => {
  let fullPath = path.join(__dirname, '..', `uploads/`, req.params.imageName);
  res.status(200).sendFile(fullPath);
});

const getTimeOfTheDayAt = (d, t) => {
  let dateTime = moment(d).format('YYYY-MM-DD');
  dateTime = moment(dateTime).set('hour', +t.split(':')[0]);
  dateTime = moment(dateTime).set('minute', +t.split(':')[1]);

  return dateTime;
};
module.exports = router;
