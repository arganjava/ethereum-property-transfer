var express = require('express');
var router = express.Router();
var propertyTransfer = require('../service/propertyTransfer');

/* GET users listing. */
router.get('/', function(req, res, next) {
  propertyTransfer.getAllAccounts((data) =>{
    res.json(data);
  })
});

router.post('/showAllProperties', function(req, res, next) {
  let body = req.body
  console.log("body", body);
  if(body.address.length > 0){
    propertyTransfer.showAllProperties(body.address).then((data) => {
      console.info(data)
      res.json(data);
    }).catch((err) => {
      console.info(err)
      res.json(data);
    });
  }else {
    res.json([]);
  }

});



router.post('/createAccount', function(req, res, next) {
  let body = req.body
  console.log("body", body);
  propertyTransfer.createAccount(body.password, (err, data) =>{
    if(data){
      res.json(data);
    }
  })
});

router.post('/sendEther', function(req, res, next) {
  let body = req.body
  console.log("body", body);
  propertyTransfer.sendEther(body, (err, data) =>{
    if(data){
      res.json(data);
    }
  })
});

router.post('/allotProperty', function(req, res, next) {
  let body = req.body
  console.log("body allot", body);
  propertyTransfer.allotProperty(body,(err, data) =>{
    if(data){
      res.json(data);
    }else {
      res.json(err);
    }
  })
});

router.post('/transferProperty', function(req, res, next) {
  let body = req.body
  propertyTransfer.transferProperty(body,(err, data) =>{
    if(data){
      res.json(data);
    }else {
      res.json(err);
    }
  })
});

router.post('/isOwner', function(req, res, next) {
  let body = req.body
  propertyTransfer.isOwner(body,(err, data) =>{
    if(data){
      res.json(data);
    }else {
      res.json(err);
    }
  })
});

router.post('/getPropertyCountOfAnyAddress', function(req, res, next) {
  let body = req.body
  propertyTransfer.getPropertyCountOfAnyAddress(body.ownerAddress, (err, data) =>{
    if(data){
      res.json(data);
    }else {
      res.json(err);
    }
  })
});

module.exports = router;
