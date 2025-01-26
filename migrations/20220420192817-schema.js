'use strict';
const fs = require('fs');
module.exports = {
  async up(queryInterface, Sequelize) {
    var sql_string = fs.readFileSync('schema.sql', 'utf8');
    const sequelize = new Sequelize('doctor_appointment', 'root', 'foobar@123', {
      host: 'localhost',
      dialect: 'mysql',
      dialectOptions: {
        multipleStatements: true,
      },
    });

    await sequelize.query(sql_string);
  },

  async down(queryInterface, Sequelize) {
  },
};
