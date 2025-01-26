const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'userTypes',
        key: 'id'
      }
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(225),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(225),
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(225),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(225),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(225),
      allowNull: true
    },
    openForAppointments: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photo: {
      type: DataTypes.STRING(225),
      allowNull: true
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "userTypeId",
        using: "BTREE",
        fields: [
          { name: "userTypeId" },
        ]
      },
      {
        name: "departmentId",
        using: "BTREE",
        fields: [
          { name: "departmentId" },
        ]
      },
    ]
  });
};
