// keys for mongoDb and passport
require('dotenv').config()
module.exports = {
    mongoURI: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}?retryWrites=true&w=majority`,
    secretOrKey: 'secretFaceMe'
}
