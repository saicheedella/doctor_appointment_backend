'use strict';

const { sequelize } = require("../models");

module.exports = {
  async up(queryInterface, Sequelize) {
    await sequelize.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    queryInterface.removeColumn('appointments', 'startTime');
    await queryInterface.addColumn('appointments', 'slotId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'slots',
        key: 'id',
      },
    });
    await sequelize.query(`SET FOREIGN_KEY_CHECKS = 1;`);
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
