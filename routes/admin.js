var express = require('express');
var router = express.Router();


/* GET users listing. */

router.get('/', function(req, res, next) {
 
    res.render('admin/view-products',{admin:true,products});
  
});



router.post('/add-product',(req,res)=>{
  // console.log(req.body);
  // console.log(req.files.Image);
  
  })

  

module.exports = router;
