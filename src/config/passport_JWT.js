// -----------------------------------------
// USO DE JWT PARA VALIDAR RUTAS PRIVADAS
// -----------------------------------------
const passport = require('passport');
const JwtStategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/collections/user');

// -----------------------------------------
// ----------   PASSPORT JWT      ----------
// -----------------------------------------
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
}
//Normalizando la información
function normalizeInfo(req) {
    return {
        _id: req._id,
        nombre: req.nombre,
        correo: req.correo,
        imagen: req.imagen
    };
}
//fromAuthHeader()
// establecer la estrategia para validar el JWT
const PAuthToken = new JwtStategy(jwtOptions, function (payload, done) {
    // una vez decodificado el token, recupera del payload el id y lo busca
    User.findById(payload._id, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (!user) {
            done(null, false);
        }
        // devuelve usuario si corresponde con un usuario de la base de datos
        const userNormalized = normalizeInfo(user)
        done(null, userNormalized);
    });
});

// incluye en passport el uso de la estrategia de JWT
passport.use(PAuthToken);