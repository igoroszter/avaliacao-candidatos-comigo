require('dotenv').config();

module.exports = {
    SECRET_KEY: process.env.SECRET_KEY || 'secretK',
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL,
};
