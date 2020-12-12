const path = require('path');
const fse = require('fs-extra');
const uuid4 = require('uuid4');
const moment = require('moment');
const Post = require('../../models/collections/post');
const Amistad = require('../../models/collections/amistades');
const Like = require('../../models/collections/likes');

const post_Controller = {};

const { APP_IMAGE_ROUTE_POST } = process.env;

post_Controller.loadingImage = async (req, res) => {
    //let contentType = req.get('content-type');
    const newName = uuid4();
    const imageTempPath = req.file.path;//Where it was stored
    const extension = path.extname(req.file.originalname).toLowerCase();

    const finalPath = path.resolve(`src/public/images/final/${newName}${extension}`);
    const finalPathSecondary = (APP_IMAGE_ROUTE_POST.concat(`${newName}${extension}`));

    if (extension === '.png' || extension === '.jpg' || extension === '.jpeg' || extension === '.gif') {
        try {
            await fse.move(imageTempPath, finalPath);
            res.status(201).json({
                url: finalPathSecondary
            })
        } catch (error) {
            console.log(error);
        }
    } else {
        res.status(422).send({
            message: 'File with wrong extension'
        })
    }
}

post_Controller.loadingImageWithData = async (req, res) => {
    //req.user & rea.body
    var params = req.body;

    if (!params.mensajeDelPost) return res.status(200).send({ message: 'Debes enviar un texto!' });

    var post = new Post();
    post.url = params.url;
    post.usuario = req.user._id;
    post.texto = params.mensajeDelPost;
    post.numLikes = 0;
    post.numComentarios = 0;
    post.fechaCreacion = moment().format();

    await post.save((err, postSaved) => {
        if (err) return res.status(500).send({ message: 'Error al guardar la publicación' });

        if (!postSaved) return res.status(422).send({ message: 'La publicación NO ha sido guardada' });

        return res.status(200).send({ postSaved });
    });

}

post_Controller.getImagesForFeed = async (req, res) => {
    //Here, we get POSTS, 3 BY 3
    const userFollowing = req.user;
    let ActualPage = 1;
    actualPage = req.params.page;
    if (actualPage && actualPage >= 1) {
        ActualPage = actualPage;
    }

    //1.- Obteniendo los seguidores del usuario
    await Amistad.find({ usuario: userFollowing }, 'seguidor')
        .populate({ path: 'seguidor' })
        .exec((err, seguidores) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ message: 'Error devolver el seguimiento' });
            }
            if (!seguidores) {
                return res.status(422).send({ message: 'Aún no estas siguiendo a alguien (1)' });
            }
            //2.- Guardando los _id de los seguidores en un arreglo
            var seguidoresClean = [];
            seguidores.forEach((seguidor2) => {
                seguidoresClean.push(seguidor2.seguidor._id);
            });

            //3.- Buscando publicaciones de los seguidores (seguidoresClean)            
            const optionsOfPagiante = {
                page: ActualPage,
                limit: 3,
                sort: '-fechaCreacion',
                populate:
                    [
                        { path: 'usuario', select: { 'contrasena': 0, } },
                        {
                            path: 'comentarioss',
                            populate: {
                                path: 'usuario',
                                select: '_id nombre'
                            }
                        }
                    ]
            }
            Post.paginate({ usuario: { $in: seguidoresClean } }, optionsOfPagiante, async (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ message: 'Error posts de seguidores' });
                }
                if (result.docs.length === 0) {
                    return res.status(201).send(result);
                }
                //4.- Agregar el estado "estalike"               
                const estadosConLike = await agregarEstadoLike(userFollowing._id, result.docs);
                var aux = {};
                aux = result;
                delete aux.docs;
                aux.docs = estadosConLike;
                return res.status(200).send(aux);
                //
            });
        });
}

// Function to add the virtual likes
async function agregarEstadoLike(userId, newPosts) {
    //1.- Obtenemos ids de los 3 posts que nos llegaron y se almacenar en un array
    const postsIds = newPosts.map(newPost => newPost._id);
    //2.- Buscar si hay like entre post del arreglo y usuario registrados
    return await Like.find({
        usuario: userId,
        post: { $in: postsIds }
    }).then((likes) => {
        const idDeLosPostsConLike = likes.map(like => like.post);
        newPosts.forEach(newPost => {
            // 3.- Revisar si el usuario loggeado le dío like a la foto
            if (idDeLosPostsConLike.some(id => id.equals(newPost._id))) {
                newPost.estaLike = true;
            }
        });
        return newPosts;
    });
}

post_Controller.explorePosts = async (req, res) => {
    function stirArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let indiceAleatorio = Math.floor(Math.random() * (i + 1));
            let aux = array[i];
            array[i] = array[indiceAleatorio];
            array[indiceAleatorio] = aux;
        }
        return array;
    }

    try {
        //1.- Getting the last 18 posts posted
        const result = await Post.find().sort({ fechaCreacion: -1 }).limit(18);
        //2.- Revolvemos le orden los posts
        const stirResult = stirArray(result);
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
    }
}

post_Controller.pruebas = async (req, res) => {
    try {
        const result = await Post.find();
        res.send(result);
    } catch (error) {
        console.log(error)
    }

}

post_Controller.getOnePost = async (req, res) => {
    //Necesary data to process the response
    const user = req.user._id;
    const idPost = req.params.id;

    try {
        const result = await Post.find({ _id: idPost })
            .populate('usuario', '_id username imagen nombre')
            .populate({
                path: 'comentarioss',
                populate: {
                    path: 'usuario',
                    select: '_id nombre'
                }
            });
        if (!result) {
            return res.status(404).send({ message: 'No hay post con id indicado' });
        }
        // Agregar el estado "estalike"               
        const postConLike = await agregarEstadoLike(user, result);
        
        return res.status(200).send(postConLike);
    } catch (error) {
        return res.status(404).send({ message: 'Id del post mal escrito' });
    }
}

post_Controller.getPostsOfOneUser = async (req, res) => {
    const user = req.params.id;
    const result = await Post.find({ usuario: user}).limit(18);
    try {
        if (result.length === 0) {
            return res.status(200).send({ message: 'No hay resultados de la busqueda'})
        }
        return res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(404).send({ message:'Problema en el servidor para encontrar publicaciones'})
    }
}
module.exports = post_Controller;