"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("departments", [
      // Khối Quản lý
      {
        name: "Ban Giám Hiệu",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "Phòng Đào Tạo",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "Phòng Hành Chính - Nhân Sự",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },

      // Khối Chuyên môn (Tổ bộ môn)
      {
        name: "Tổ Toán - Tin",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "Tổ Ngữ Văn",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "Tổ Ngoại Ngữ",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "Tổ Khoa Học Tự Nhiên (Lý - Hóa - Sinh)",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "Tổ Khoa Học Xã Hội (Sử - Địa - GDCD)",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "Tổ Thể Dục - Giáo Dục Quốc Phòng",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        name: "Tổ Nghệ Thuật (Âm nhạc - Mỹ thuật)",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("departments", null, {});
  },
};
