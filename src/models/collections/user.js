const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
    correo: String,
    nombre: String,
    contrasena: String,
    imagen: {
        type: String,
        default: null
    }
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

userSchema.virtual('numSeguidores',{
    ref: 'Amistad',
    localField: '_id',
    foreignField: 'seguidor',
    count:true
});

userSchema.virtual('numSiguiendo',{
    ref: 'Amistad',
    localField: '_id',
    foreignField: 'usuario',
    count:true
});

userSchema.virtual('seguimiento')
    .get(function(){
        if (this._seguimiento == null) {
            return false;
        }
        return this._seguimiento;
    })
    .set(function(v){
        this._seguimiento = v;
    });

//METHODS
// 1.- To encrypt password
userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

//2.- To compare password
userSchema.methods.comparePassword = async function (contrasena) {
    return await bcrypt.compare(contrasena, this.contrasena);
}

module.exports = model('User', userSchema)