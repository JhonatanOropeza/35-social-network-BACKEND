const ObjectId = require('mongodb').ObjectID;
const Like = require('../../models/collections/likes');
const Post = require('../../models/collections/post');

like_controller = {}

like_controller.postLike = async (req, res) => {
    //req.user._id && req.params.id (Post info)
    const post = req.params.id;
    const search = await Like.findOne({
        post,
        usuario: req.user._id
    });
    //1.- Validating if like already exists
    if (search) {
        return res.status(409).send({message:"Like ya registrado"});
    }
    //2.- Searching post and incrementing its numlikes
    const postWithNewLike = await Post.findOneAndUpdate(
        {_id: req.params.id},
        {
            $inc: {numLikes: 1}
        }
    );
    if (!postWithNewLike) {
        return res.status(404).send({message:"Post doesn´t exist"});
    }
    try {
        await new Like({
            post: req.params.id,
            usuario: req.user._id
        }).save();
        return res.status(200).send({message:"Like saved"});
    } catch (error) {
        console.log(error);
        res.status(500).send({message:"Server didn´t saved the post"});
    }
}; 

like_controller.deleteLike = async (req, res) => {
    //req.user._id && req.params.id (Post info)
    
    const post = req.params.id;
    console.log('post: ',post);
    console.log('user: ',req.user._id)
    //1.- Removing like
    const likeRemoved = await Like.findOneAndRemove({
        post,
        usuario: req.user._id
    });
    if (!likeRemoved) {
        return res.status(409).send({message:"Like no registrado"});
    }
    //2.- Updating the data in the post
    const postModified = await Post.findOneAndUpdate(
        {_id : post},
        {$inc: { numLikes: -1 }}
    );
    if (!postModified) {
        return res.status(409).send({message:"No exite post con like a remover"});
    }
    return res.status(200).send(likeRemoved);
}
module.exports = like_controller;