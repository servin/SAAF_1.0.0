const express = require('express');
const router = express.Router();
const {Usuario} = require('../models/SchemaUsuarios');
const {Company} = require('../models/SchemaCompany');
const {Permisos} = require('../models/SchemaRoles');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const {verificarLogin} = require('../middlewares/autenticacion');

  router.post('post/:idcompany',[
    check('datos.email').isEmail(),
    check('datos.password').isLength({ min: 4 })
  ],async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let body = req.body;
    let id = req.params.idcompany;
    const hashPassword = await bcrypt.hash(body.datos.password, 10)
    
    //let company = await Company.find().where('_id').in(body.company);
    
    try {
      
      let usuario = new Usuario({
        datos:{
          nombre: body.datos.nombre,
          apellido: body.datos.apellido,
          email: body.datos.email,
          password: hashPassword
        },
        company: id
      });
      
      let usuarioDB = await usuario.save();  
      //let company = await Company.updateOne({_id: id}, {$push: {usuarios: usuario.id }});

        res.json({
          ok: true,
          usuario: usuarioDB,
          //company
        });
    } catch (e) {
      res.status(500).json(e);
    }
  });
 

router.get('/get/:idcompany',async(req, res)=>{
  let body = req.body;
  let company = req.params.idcompany;

  let desde = req.query.desde || 0;
    desde = Number(desde);

  let limite = req.query.limite || 10;
    limite = Number(limite);  

  try {
    let usuarios = await Usuario.find({'company': company}).skip(desde).limit(limite);  
    res.json({
      ok: true,
      usuarios
    });
  } catch (e) {
    res.status(500).json(e);
  }
});

router.get('/get/:idcompany/:idUser',async(req, res)=>{
  let body = req.body;
  let id = req.params.idUser;
  let company = req.params.idcompany;

  try {
    let usuario = await Usuario.find({_id: id ,company });
    res.json({
      ok: true,
      usuario
    });
  } catch (e) {
    res.status(500).json(e);
  }
});


router.delete('/delete/:idcompany/:idUser',async(req, res)=>{
  let body = req.body;
  let id = req.params.idUser;
  let company = req.params.idcompany;
  try {
    let Usuarios = await Usuario.findOneAndDelete({_id: id, company});
    res.json({
      ok: true,
      usuario: Usuarios,
      message: "El usuario fue Eliminado"
    });
  } catch (e) {
    res.status(500).json(e);
  }
});

router.put('/permisos/:idcompany/:idUser/',async(req, res)=>{
  let body = req.body;
  let id = req.params.idUser;
  let company =  req.params.idcompany;
  let idpermisos =  body.permisos;
  
  try {
    let usuario =  await Usuario.findById({_id: id}).populate({path:'permisos'});
    let permisos = await Usuario.updateOne({_id: id}, {$set: {permisos: idpermisos }});
    res.json({
      ok: true,
      usuario,
      message: "Permiso modificado"
    });
  } catch (e) {
    res.status(500).json(e);
  }

});

router.put('/put/:idcompany/:idUser',async(req, res)=>{
  let body = req.body;
  let id = req.params.idUser;
  let company =  req.params.idcompany;
  
  const hashPassword = await bcrypt.hash(body.datos.password, 10);
  
  try {
    let usuario = new Usuario({
      datos:{
        nombre: body.datos.nombre,
        apellido: body.datos.apellido,
        email: body.datos.email,
        password: hashPassword,
      },
    });

    let Usuarios = await Usuario.findOneAndUpdate({_id: id, company},{$set:{datos: usuario.datos}});
    
    res.json({
      ok: true,
      usuario: Usuarios,
      message: "Usuario Actualizado"
    });
  } catch (e) {
    res.status(500).json(e);
  }
});

  module.exports = router;