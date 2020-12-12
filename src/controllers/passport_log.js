// -----------------------------------------
// GENERARCIÓN DE TOKEN EN SIGNIN Y SIGNUP
// -----------------------------------------
const AuthCtrl = {}
const jwt = require('jsonwebtoken')
const User = require('../models/collections/user')

// -----------------------------------------
// 0.- Different functions
// -----------------------------------------
//Generando token
function generateToken(user) {
    return jwt.sign(user, 'secret', {
        expiresIn: 60 * 60 * 24
    });
}
//Normalizando la información
function normalizeInfo(req) {
    return {
        _id: req._id,
        nombre: req.nombre,
        correo: req.correo
    };
}

// -----------------------------------------
// 1.- Function for logup
// -----------------------------------------
AuthCtrl.logup = async (req, res) => {
    const { nombre, correo, contrasena,  } = req.body;
    //Validating form
    if (!nombre || !correo || !contrasena) {
        return res.status(422).send({
            message: 'Enter complete data'
        })
    }
    //1.2 Validating that the data isn´t repeated
    const userRepeated = await User.findOne({ correo: correo });
    if (userRepeated) {
        return res.status(422).send({
            message: 'The email was already taken'
        })
    }
    //1.3 Creating the new document in bd
    let newUser = new User();
    newUser.correo = correo;
    newUser.nombre = nombre;
    newUser.contrasena = newUser.encryptPassword(contrasena);
    //1.4 Trying to save the new object in db
    try {
        const user = await newUser.save()
        let userToSend = normalizeInfo(user);
        res.status(201).json({
            token:generateToken(userToSend),
            user: userToSend
        })
    } catch (error) {
        console.log(error)
    }
};
// -----------------------------------------
// 2.- Function for login
// -----------------------------------------
AuthCtrl.login = async (req, res) => {
    const {correo, contrasena } = req.body;
    //Validating form
    if (!correo || !contrasena) {
        return res.status(422).send({
            message: 'Enter complete data'
        })
    }
    //1.2 Validating user
    //1.2 Validating user
    const userFound = await User.findOne({ correo: correo });
    if (!userFound) {
        //true
        return res.status(400).send({ message: 'Incorrect data in SignIn (1)' });
    }
    const result = await userFound.comparePassword(contrasena);
    if (!result) {
        return res.status(400).send({ message: 'Incorrect data in SignIn (2)' });
    }
    let userInfo = normalizeInfo(userFound);
    res.status(201).json({
        token: generateToken(userInfo),
        user: userInfo
    });
}
// -----------------------------------------
// 3.- 
// -----------------------------------------

module.exports = AuthCtrl;