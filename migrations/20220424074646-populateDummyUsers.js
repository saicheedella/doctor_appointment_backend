'use strict';
const { users } = require('../models');
const dummyUsers = require('../dummyusers.json');
const _ = require('lodash');
const moment = require('moment');

module.exports = {
  async up(queryInterface, Sequelize) {
    for (let user of dummyUsers) {
      let { name, userTypeId, email, phone, dob, gender, password, about } = user;

      let departmentId = null;
      if (userTypeId === 2) {
        let dept = Array.from(Array(16).keys());
        dept = dept.slice(1, dept.length);
        departmentId = _.shuffle(dept)[0];
      }

      await users.create({
        name,
        userTypeId,
        email,
        phone,
        dob: moment(dob.split('T')[0]),
        gender,
        password,
        departmentId,
        about,
        openForAppointments: userTypeId === 2 ? 1 : 0,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
