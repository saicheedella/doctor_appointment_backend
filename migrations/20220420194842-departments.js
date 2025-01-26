'use strict';
const _ = require('lodash');
const LoremIpsum = require('lorem-ipsum').LoremIpsum;

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

module.exports = {
  async up(queryInterface, Sequelize) {
    const str =
      'surgery, gynaecology, obstetrics, paediatrics, eye, ENT, dental, orthopaedics, neurology, cardiology, psychiatry, skin, V.D., plastic surgery, nuclear medicine, infectious disease';
    let depts = str.split(', ');
    await queryInterface.bulkInsert(
      'departments',
      depts.map((d) => ({
        name: _.kebabCase(d),
        label: d[0].toUpperCase() + d.slice(1, d.length),
        description: lorem.generateParagraphs(2),
      }))
    );
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
