const { Schema, model } = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');

const postSchema = new Schema({
    url: String,
    usuario: { type: Schema.ObjectId, ref: 'User' },
    texto: String,
    numLikes: 0,
    numComentarios: 0,
    fechaCreacion: String
})

postSchema.set('toObject', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

postSchema.virtual('comentarioss', {
    ref: 'Comentario',
    localField: '_id',
    foreignField: 'post',//From comentario Model
    justOne: false,
    options: { sort: { fechaCreacion: 1 }}
  });

postSchema
    .virtual('estaLike')
    .get(function () {
        if (this._estaLike == null) {
            return false;
        }
        return this._estaLike;
    })
    .set(function (v) {
        this._estaLike = v;
    });

postSchema.plugin(mongoosePaginate);

module.exports = model('Post', postSchema);