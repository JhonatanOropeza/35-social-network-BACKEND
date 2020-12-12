const mongoose = require('mongoose');
const { DB_URL } = process.env;
const URI = DB_URL;

mongoose.connect(URI,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

//Conociendo si se realizó la conexión
const conexion = mongoose.connection;

conexion.once('open', () => {
    console.log('DB Social_Network is connected');
});
