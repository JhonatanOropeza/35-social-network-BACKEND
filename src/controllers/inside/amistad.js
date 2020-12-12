const Amistad = require('../../models/collections/amistades');

const Amistad_Controller = {};

Amistad_Controller.postAmistad = async (req, res) => {
    //console.log(req.user._id,req.params);
    var params = req.params;

    var amistad = new Amistad();
    amistad.usuario = req.user._id;
    amistad.seguidor = params.id;

    amistad.save((err, nuevaAmistad) => {
        if (err) return res.status(500).send({ message: 'Error al guardar el seguimiento' });
        if (!nuevaAmistad) return res.status(404).send({ message: 'El seguimiento no se ha guardado' });
        return res.status(200).send({ nuevaAmistad });
    });
}

Amistad_Controller.deleteAmistad = async (req, res) => {
    var usuario = req.user._id;
    var seguidor = req.params.id;

    //1.- Eliminando al amistad
    const amistad = await Amistad.findOneAndDelete({usuario, seguidor});
    if(!amistad) {
        return res.status(404).send({message:'No existe seguimiento a eliminar'})
    }
    return res.status(200).send(amistad);
}

Amistad_Controller.getAmistades =async (req, res) => {
    const result = await Amistad.find(req.user._id, 'usuario');
    res.send(result);
}

module.exports = Amistad_Controller;