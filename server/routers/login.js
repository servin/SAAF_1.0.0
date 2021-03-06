const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {Usuario} = require('../models/SchemaUsuarios');

router.post('/', async(req, res)=>{

    let body = req.body;
    
    let user = await Usuario.findOne({"datos.email": body.email}).populate({path:'company', populate: { path:'empresa' } }).populate({path:'permisos'});   
        if(!user) return res.status(400).json('USUARIO y contraseña incorrectos');

    const valipass = await bcrypt.compare(body.password, user.datos.password);
    if(!valipass) return res.status(400).json('usuario y CONTRASEÑA incorrectos');

    let key = user.loginJWT();
    let token = user.tokenJWT();

    res.status(201).header('Authorization', key).json({
        ok: true,
        Access: 'Login success',
        nombre: user.datos.nombre,
        email: user.datos.email,
        permisos: user.permisos,
        token 
    });
});

module.exports = router;