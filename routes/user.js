var express = require('express');
var router = express.Router();
const User = require('../server/models/User')
const Product = require('../server/models/Product')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;


const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}



/* GET home page. */
router.get('/',authMiddleware ,async function(req, res, next) {
    

    const user = req.session.user
    try {
      const products = await Product.find().lean();
      // console.log("products",products[0].name);
      res.render('user/view-products',{
        products:products
        });
    } catch (error) {
      console.log(error);
    }
    
});



router.get('/product/:id',authMiddleware ,async function(req, res, next) {
    
  try {
    let slug = req.params.id
    const products = await Product.findById({_id:slug}).lean()
    console.log("products",products);
    res.render('user/product',{
      products
      });
  } catch (error) {
    console.log(error);
  }
  
});



router.get('/add-product',authMiddleware,function(req,res){
  res.render('user/add-product')
  })


  router.post('/add-product',authMiddleware, async (req, res) => {
    console.log(req.body);
    try {
      try {
        const newPost = new Product({
          name: req.body.name,
          category: req.body.category,
          price:req.body.price,
          description:req.body.description
        });
  
        await Product.create(newPost);
        res.send("User Data Added")
      } catch (error) {
        console.log(error);
      }
  
    } catch (error) {
      console.log(error);
    }
  });


router.get('/login',(req,res)=>{
  const user = req.session.user
  res.render('user/login',{user})
})

router.post('/login',async (req,res)=>{

  try {
    const { username, password } = req.body;
    const user = await User.findOne( { username } );
    req.session.user=req.body
    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const token = jwt.sign({ userId: user._id}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    console.log("cookie",token);
    // res.send("logged in")
    res.redirect('/');
    
} catch (error) {
  console.log(error);
} 
 
})


router.get('/signup',(req,res)=>{
  res.render('user/signup')
  
})

router.post('/signup',async (req,res)=>{
   
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password:hashedPassword });
      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).json({ message: 'User already in use'});
      }
      res.status(500).json({ message: 'Internal server error'})
    }

  } catch (error) {
    console.log(error);
  }

})


router.get('/edit-post/:id',authMiddleware, async (req, res) => {
  try {


    const data = await Product.findOne({ _id: req.params.id }).lean()
    // console.log("data",data);

    res.render('user/edit-post', {
      data
    })

  } catch (error) {
    console.log(error);
  }

});

router.put('/edit-post/:id',authMiddleware, async (req, res) => {
  try {


    await Product.findByIdAndUpdate(req.params.id,{
      name:req.body.name,
      category:req.body.category,
      description:req.body.description,
      updatedAt:Date.now()
  }).lean()

  // res.redirect(`/edit-post/${req.params.id}`)
  res.redirect('/')

  } catch (error) {
    console.log(error);
  }

});


router.delete('/delete-post/:id',authMiddleware, async (req, res) => {
  try {
    await Product.deleteOne({_id:req.params.id})
  res.redirect('/')

  } catch (error) {
    console.log(error);
  }

});


router.get('/logout',(req,res)=>{
  res.clearCookie('token')
  res.redirect('/')
})

module.exports = router;
