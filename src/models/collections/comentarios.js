const {Schema, model} = require('mongoose')

const comentarioSchema = new Schema({
    post: {type: Schema.ObjectId, ref: 'Post'},
    usuario: {type: Schema.ObjectId, ref: 'User'},
    mensaje: String,
    fechaCreacion: String
})

module.exports = model('Comentario', comentarioSchema)