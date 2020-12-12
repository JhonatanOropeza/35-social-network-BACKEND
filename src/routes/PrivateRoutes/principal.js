// -----------------------------------------
// HERE WE FIND ALL THE PRIVATE FUNCTIONS 
// -----------------------------------------
//Expess-Router
const { Router } = require('express')
const PrivateRoutes = Router()
const multer = require('multer');
const path = require('path');
//loading the functions for the application from the file "controllers"
const { whoami, exploreUsers, getUserForProfile, postImageProfile } = require('../../controllers/inside/user')
const { loadingImage, loadingImageWithData, getImagesForFeed, pruebas, explorePosts, getOnePost, getPostsOfOneUser } = require('../../controllers/inside/post')
const { postAmistad, getAmistades, deleteAmistad } = require('../../controllers/inside/amistad');
const { postLike, deleteLike } = require('../../controllers/inside/like');
const { getComentariosDeUnPost, postComentario } = require('../../controllers/inside/comentario')

//The root  of the proof /api/auth/inside
PrivateRoutes.get('/', (req, res) => { res.status(202).json({ message: 'Private route' }); });

PrivateRoutes.route('/whoami').get(whoami);
//-------------------------------------------------------------
//---------------------- USER  --------------------------------
//-------------------------------------------------------------
//api/auth/inside/...
PrivateRoutes.get('/explore/users', exploreUsers);//For vista EXPLORE
PrivateRoutes.get('/getUserForProfile/:idUser',getUserForProfile);
const multerMiddleware1 = multer({
    dest: path.join(__dirname, '../../public/images/temp')
}).single('imageProfile');
PrivateRoutes.post('/postImageProfile',[multerMiddleware1 ,postImageProfile]);
//-------------------------------------------------------------
//---------------------- POST  --------------------------------
//-------------------------------------------------------------
const multerMiddleware2 = multer({
    dest: path.join(__dirname, '../../public/images/temp')
}).single('image');
//api/auth/inside/...
PrivateRoutes.post('/postImage', [multerMiddleware2, loadingImage]);
PrivateRoutes.post('/postImageWithData', loadingImageWithData);
PrivateRoutes.get('/getPosts/:page?', getImagesForFeed);//For FEED
PrivateRoutes.get('/prueba', pruebas);
PrivateRoutes.get('/explore/posts', explorePosts);//For vista EXPLORE
PrivateRoutes.get('/getOnePost/:id', getOnePost);
PrivateRoutes.get('/getPostsOfOneUser/:id', getPostsOfOneUser);

//-------------------------------------------------------------
//---------------------- AMISTAD ------------------------------
//-------------------------------------------------------------
//api/auth/inside/...
PrivateRoutes.post('/postAmistad/:id', postAmistad);
PrivateRoutes.get('/getAmistades', getAmistades);
PrivateRoutes.delete('/deleteAmistad/:id', deleteAmistad);

//-------------------------------------------------------------
//---------------------- LIKE ---------------------------------
//-------------------------------------------------------------
//api/auth/inside/...
PrivateRoutes.post('/postLike/:id', postLike);
PrivateRoutes.delete('/deleteLike/:id', deleteLike);

//-------------------------------------------------------------
//---------------------- COMENTARIO ---------------------------
//-------------------------------------------------------------
//api/auth/inside/...
PrivateRoutes.get('/getComentariosDeUnPost/:id', getComentariosDeUnPost);
PrivateRoutes.post('/postComentario/:id', postComentario);

module.exports = PrivateRoutes;