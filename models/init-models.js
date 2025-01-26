var DataTypes = require("sequelize").DataTypes;
var _SequelizeMeta = require("./SequelizeMeta");
var _appointments = require("./appointments");
var _departments = require("./departments");
var _slots = require("./slots");
var _userTypes = require("./userTypes");
var _users = require("./users");

function initModels(sequelize) {
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var appointments = _appointments(sequelize, DataTypes);
  var departments = _departments(sequelize, DataTypes);
  var slots = _slots(sequelize, DataTypes);
  var userTypes = _userTypes(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  users.belongsTo(departments, { as: "department", foreignKey: "departmentId"});
  departments.hasMany(users, { as: "users", foreignKey: "departmentId"});
  appointments.belongsTo(slots, { as: "slot", foreignKey: "slotId"});
  slots.hasMany(appointments, { as: "appointments", foreignKey: "slotId"});
  users.belongsTo(userTypes, { as: "userType", foreignKey: "userTypeId"});
  userTypes.hasMany(users, { as: "users", foreignKey: "userTypeId"});
  appointments.belongsTo(users, { as: "doctor", foreignKey: "doctorId"});
  users.hasMany(appointments, { as: "appointments", foreignKey: "doctorId"});
  appointments.belongsTo(users, { as: "patient", foreignKey: "patientId"});
  users.hasMany(appointments, { as: "patient_appointments", foreignKey: "patientId"});
  slots.belongsTo(users, { as: "doctor", foreignKey: "doctorId"});
  users.hasMany(slots, { as: "slots", foreignKey: "doctorId"});

  return {
    SequelizeMeta,
    appointments,
    departments,
    slots,
    userTypes,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
