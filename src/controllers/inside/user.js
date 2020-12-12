const path = require('path');
const fse = require('fs-extra');
const uuid4 = require('uuid4');
const User = require('../../models/collections/user');
const Amistad = require('../../models/collections/amistades');

const user_controller = {}

const { APP_IMAGE_ROUTE_POST } = process.env;

// -----------------------------------------
// DIFFERENT FUNCTION TO USE
// -----------------------------------------
function normalizeInfoUser(request) {
    return {
        _id: request._id,
        nombre: request.nombre,
        correo: request.correo,
        imagen: request.imagen
    }
}

// -----------------------------------------
// USER_CONTROLLER´S FUNCTIONS
// -----------------------------------------
user_controller.whoami = (req, res) => {
    let userInfo = normalizeInfoUser(req.user)
    res.json({
        user: userInfo
    })
}

user_controller.exploreUsers = async (req, res) => {
    try {
        const user = req.user._id;
        const resultAmistad = await Amistad.find({ usuario: req.user._id });
        const idSeguidores = resultAmistad.map(s => s.seguidor);
        const resultUsers = await User.find({ _id: { $nin: idSeguidores } });
        //Deleteing the user loged, because the user loged should not follow himself
        const resultLessUserLoged = resultUsers.filter((usuario) => {
            return (String(usuario._id) !== String(user))
        })
        return res.status(200).send(resultLessUserLoged);//resultLessUserLoged
    } catch (error) {
        console.log(error);
        return res.status(400).send({ message: 'Error en servidor al buscar a los usuarios.' });
    }
}

user_controller.getUserForProfile = async (req, res) => {
    const userOfProfile = req.params.idUser;
    try {
        const result = await User.find({ _id: userOfProfile }, {contrasena: 0})
        .populate('numSeguidores')
        .populate('numSiguiendo');
        if (result.length === 0) {
            return res.status(404).send({ message: 'No existe el usuario' })
        }
        //let userInfo = normalizeInfoUser(result[0]);
        let userInfo = result[0];
        const seguimiento = await Amistad.find({ usuario: req.user._id, seguidor: userOfProfile });
        //Agregando Estado de seguimiento (virtual)
        seguimiento.length > 0
            ? 
            userInfo.seguimiento = true
            :
            userInfo.seguimiento = false
        return res.status(200).send(userInfo);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ message: 'Error en el servidor' })
    }
}

user_controller.postImageProfile = async (req, res) => {
    const newName = uuid4();
    const imageTempPath = req.file.path;
    const user = req.user._id;
    const lastImage = req.user.imagen;
    const extension = path.extname(req.file.originalname).toLowerCase();

    const finalPath = path.resolve(`src/public/images/final/${newName}${extension}`);
    const url = (APP_IMAGE_ROUTE_POST.concat(`${newName}${extension}`));

    if (extension === '.png' || extension === '.jpg' || extension === '.jpeg' || extension === '.gif') {
        try {
            await fse.move(imageTempPath, finalPath);
            await User.findByIdAndUpdate(
                { _id: user },
                { imagen: url }
            );
            if (lastImage) {
                //Removing the last image od the profile, if exists
                const nameOfOldImageProfile = path.basename(lastImage);
                await fse.remove(path.join(__dirname, '../../public/images/final/', nameOfOldImageProfile));
            }
            res.status(201).json({ url });
        } catch (error) {
            console.log(error);
            res.status(400).send({ message: 'Error al guardar imagen' })
        }
    } else {
        res.status(422).send({
            message: 'File with wrong extension'
        })
    }
}
module.exports = user_controller;