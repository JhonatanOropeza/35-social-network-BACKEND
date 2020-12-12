const express = require('express')
const passport = require('passport')

const router = express.Router()
const authRoutes = express.Router()

const {logup, login} = require('../controllers/passport_log')

//Loading all the all the PRIVATE ROUTES
const PRIVATE_ROUTES = require('./PrivateRoutes/principal')
//Passport_JWT
require('../config/passport_JWT')
const PAuthToken = passport.authenticate('jwt', { session: false });

//---------------------------------------------
//----------Begin use of routes ---------------
//---------------------------------------------

//  api/auth
router.use('/auth',authRoutes);

// ---------------------------------
//0.- Public route
// ---------------------------------
// /api/auth/public
authRoutes.get('/public',(req, res) =>{
    res.status(200).json({message: 'Public route'})
})

// ---------------------------------
//1.- Access: logup, login, logout
// ---------------------------------
// /api/auth/logup
authRoutes.post('/logup',logup);
// /api/auth/login
authRoutes.post('/login',login);

// ---------------------------------
//2.- Authenticated access (inside)
// ---------------------------------
//  It´s used to make the first proof api/auth/proofPrivate
authRoutes.get('/proofPrivate',PAuthToken,(req, res) =>{
    res.status(200).json({message: 'Proof rout (Private)'});
})
// The rest of the routes api/auth/inside
authRoutes.use('/inside',PAuthToken,PRIVATE_ROUTES)

module.exports = router;