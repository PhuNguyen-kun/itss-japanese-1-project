"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("12345678", salt);

    return queryInterface.bulkInsert("users", [
      {
        username: "admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        full_name: "Admin",
        role: "admin",
        department_id: null,
        avatar_url: null,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        username: "teacher1",
        email: "teacher1@gmail.com",
        password: hashedPassword,
        full_name: "Giáo viên 1",
        role: "teacher",
        department_id: null,
        avatar_url: null,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete(
      "users",
      {
        username: ["admin", "teacher1"],
      },
      {}
    );
  },
};
