const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('../users/usersModel.js');
// import secrets
const {jwtSecret} = require('../config/secrets.js');

router.post('/register', (req, res) => {
    let user = req.body;
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;

    Users.add(user)
        .then(saved => {
            res.status(201).json({message: `Welcome aboard, ${user.username}!`, id: user.id});
        })
        .catch(error => {
            res.status(500).json(console.log(error));
        });
});

router.post('/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                const token = makeToken(user);
                res.status(200).json({
                    message: `Good to see ya, ${user.username}!`,
                    token,
                });
            } else {
                res.status(401).json({ message: "Those credentials are wrong!" });
            }
        })
        .catch(error => {
            res.status(500).json(console.log(error));
        });
});

function makeToken(user) {
    const payload = {
        subject: user.id,
        username: user.username,
    };

    const options = {
        expiresIn: '1h',
    };

    return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;

