'use strict';
const faker = require('faker')
const DEFAULT_COUNT = 2

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const checkArray = Array.from({ length: users.length }).map((_, i) => [])
    await queryInterface.bulkInsert('Followships',
      Array.from({ length: users.length * DEFAULT_COUNT }).map((_, i) => {
        const followerId = Math.floor(i / DEFAULT_COUNT)
        let followingId = Math.floor(Math.random() * users.length)
        while (followerId === followingId || checkArray[followerId].includes(followingId)) {
          followingId = Math.floor(Math.random() * users.length)
        }
        checkArray[followerId].push(followingId)
        return {
          followerId: users[followerId].id,
          followingId: users[followingId].id,
          createdAt: faker.date.between('2021-01-01T00:00:00.000Z', '2023-01-01T00:00:00.000Z'),
          updatedAt: new Date()
        }
      })
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Followships', null, {})
  }
};
