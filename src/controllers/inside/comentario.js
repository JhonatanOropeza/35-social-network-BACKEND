const Comentario = require('../../models/collections/comentarios')
const Post = require('../../models/collections/post');

const moment = require('moment');

const comentario_Controller = {};

comentario_Controller.getComentariosDeUnPost = async (req, res) => {
    const post = req.params.id;
    console.log(post);
    const result = await Comentario.find({ post });
    if (result.length === 0) {
        return res.status(401).send({ message: 'No hay comentarios asosciados a este post' })
    }
    return res.status(201).send(result)
};

comentario_Controller.postComentario = async (req, res) => {
    //1-. Assigning nomber to the data that arrived
    const post = req.params.id;
    const usuario = req.user._id;
    const mensaje = req.body.mensaje;
    //2.- Searching post and incrementing its numlikes
    const postWithNewComent = await Post.findOneAndUpdate(
        { _id: post },
        {
            $inc: { numComentarios: 1 }
        }
    );
    if (!postWithNewComent) {
        return res.status(404).send({ message: "Post doesn´t exist" });
    }
    try {
        const comentario = new Comentario({
            post,
            usuario,
            mensaje,
            fechaCreacion: moment().format()
        });
        await comentario.save();
        res.status(200).send(comentario);
    } catch (error) {
        console.log(error);
        res.status(409).send({ message: 'Error al guardar comentario' });
    }

};

module.exports = comentario_Controller;