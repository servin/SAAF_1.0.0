const express = require('express');
const router = express.Router();
const {Proveedores} = require('../models/SchemaProveedores');
const {Empresa} = require('../models/SchemaEmpresa');
const { check, validationResult } = require('express-validator');

router.post('/post/:idcompany/:idempresa',[
    check('datos.email').isEmail(),
    check('datos.telefono').isLength({ min: 10 }),
    check('datos.clave').isLength({ min: 2 }),
    check('datos.nombre').isLength({ min: 2 }),
  ],async(req, res)=>{
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let body = req.body;
    let company = req.params.idcompany;
    let empresa = req.params.idempresa;

    try {
        let proveedordb = new Proveedores({
            datos:{
                clave: body.datos.clave,
                nombre: body.datos.nombre,
                email: body.datos.email,
                telefono: body.datos.telefono,
                rfc: body.datos.rfc,
            },
            company,
            empresa
        });
        let proveedor = await proveedordb.save();
        res.json({
            ok: true,
            proveedor,
        });     
    } catch (e) {
        res.status(500).json(e);
    }
});


router.put('/put/:idcompany/:idempresa/:idproveedor',[
    check('datos.email').isEmail(),
    check('datos.telefono').isLength({ min: 10 }),
    check('datos.clave').isLength({ min: 2 }),
    check('datos.nombre').isLength({ min: 2 }),
  ],async(req, res)=>{
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let body = req.body;
    let company = req.params.idcompany;
    let empresa = req.params.idempresa;
    let id = req.params.idproveedor;

    try {
        let proveedor = await Proveedores.findOneAndUpdate({_id: id,company,empresa},{$set:{'datos':body.datos}});
        res.json({
            ok: true,
            proveedor
        });     
    } catch (e) {
        res.status(500).json(e);
    }
});

router.get('/get/:idcompany/:idempresa',async(req, res)=>{
    let company = req.params.idcompany;
    let empresa = req.params.idempresa;
    let search = req.query.search;

    let orderby_clave = req.query.orderby_clave;
    orderby_clave = Number(orderby_clave);
  
    let orderby_nombre = req.query.orderby_nombre;
    orderby_nombre = Number(orderby_nombre);
  
    let orderby_correo = req.query.orderby_correo;
    orderby_correo = Number(orderby_correo);

    let orderby_telefono = req.query.orderby_telefono;
    orderby_telefono = Number(orderby_telefono);

    let orderby_rfc = req.query.orderby_rfc;
    orderby_rfc = Number(orderby_rfc);

    let orderby_estado = req.query.orderby_estado;
    orderby_estado = Number(orderby_estado);

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 10;
    limite = Number(limite);

    try {
        let proveedores = await Proveedores.find({'company': company, 'empresa': empresa}).or([
            {'datos.clave':{$regex: search}},
            {'datos.nombre':{$regex: search}},
            {'datos.email':{$regex: search}}
        ]).sort({
            'datos.clave': orderby_clave,
            'datos.nombre': orderby_nombre,
            'datos.email': orderby_correo,
            'datos.telefono': orderby_telefono,
            'datos.rfc': orderby_rfc,
            'datos.estado': orderby_estado,
        }).skip(desde).limit(limite);

        //valuar documentos con la porpierdad datos existente para el conteo
        let where = { datos: {$exists: true, $not: {$size: 0}} };
        let tota_document = await Proveedores.count({company, empresa}).where(where);

        res.json({
            ok: true,
            proveedores,
            tota_document
        });
    } catch (e) {
      res.status(500).json(e);
    }
  });

router.get('/get/:idcompany/:idempresa/:idproveedor',async(req, res)=>{
    let company = req.params.idcompany;
    let empresa = req.params.idempresa;
    let id = req.params.idproveedor;

    try {
        let proveedor = await Proveedores.findOne({_id: id, company, empresa });  
        res.json({
        ok: true,
        proveedor
        });
    } catch (e) {
        res.status(500).json(e);
    }
});

router.delete('/delete/:idcompany/:idempresa/:idproveedor',async(req, res)=>{
    let company = req.params.idcompany;
    let empresa = req.params.idempresa;
    let id = req.params.idproveedor;
    try {
        let proveedor = await Proveedores.findOneAndDelete({_id: id, company, empresa });  
        res.json({
        ok: true,
        proveedor,
        message:"Proveedor Eliminado"
        });
    } catch (e) {
        res.status(500).json(e);
    }
});

module.exports = router;