const picturePasswords = require('school-schema').picturePasswords
const generate = require('nanoid/generate')

const alphabet = 'abcdefghijklmnopqrstuvwxyz123456789'

function getRandomPicturePassword () {
  return picturePasswords[Math.floor(Math.random() * picturePasswords.length)]
    .value
}

function getRandomTextPassword () {
  return generate(alphabet, 5)
}

const types = {
  text: getRandomTextPassword,
  image: getRandomPicturePassword
}

exports.getRandomPassword = type => {
  return types[type]()
}
