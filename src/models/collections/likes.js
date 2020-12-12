const {Schema, model} = require('mongoose');
//const mongoose = require('mongoose')
//const ObjectId = mongoose.Schema.Types.ObjectId;

const likesSchema = new Schema({
    post: {type: Schema.ObjectId, ref: 'Post'},
    usuario: {type: Schema.ObjectId, ref: 'User'}
})



module.exports = model('Like', likesSchema)