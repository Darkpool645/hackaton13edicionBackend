const crypto = require('crypto');

function generateHashedPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return {
        salt: salt,
        hash: hashedPassword
    };
}

function verifyPassword(password, salt, hash) {
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hashedPassword === hash;
}

module.exports = {
    generateHashedPassword,
    verifyPassword
};