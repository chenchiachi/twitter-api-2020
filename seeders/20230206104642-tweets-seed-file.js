'use strict';

const faker = require('faker')

const DEFAULT_COUNT = 3

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 先去查詢現在 User 的 id 有哪些 
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )

    await queryInterface.bulkInsert('Tweets',
      Array.from({ length: users.length * DEFAULT_COUNT }).map((_, i) => ({
        UserId: users[Math.floor(i / DEFAULT_COUNT)].id,
        description: faker.lorem.text().substring(0, 50),
        createdAt: faker.date.between('2021-01-01T00:00:00.000Z', '2022-01-01T00:00:00.000Z'),
        updatedAt: new Date()
      })
      ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Tweets', null, {})
  }
};
