const { Schema, model } = require('mongoose');

const amistadSchema = new Schema({
    usuario: { type: Schema.ObjectId, ref: 'User' },//El usuario que decidio estar siguiendo
    seguidor: { type: Schema.ObjectId, ref: 'User' }//A quien esta siguiendo el'usuario'
});

amistadSchema.index({
    usuario: 1,
    seguidor: 1
});

module.exports = model('Amistad', amistadSchema);