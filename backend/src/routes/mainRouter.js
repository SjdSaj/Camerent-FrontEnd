const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const genPassword = require('../lib/passwordUtils').genPassword;
const validPassword = require('../lib/passwordUtils').validPassword;
const user = require("../model/UserModel");
const cart = require("../model/Cart");
const products = require("../model/products");
const isAuth= require("./authMiddleware").isAuth;


// Login 
router.post('/login', (req, res, next) => {
    res.header("Access-Control-Allow-Orgin", "*");
    res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTION");
    // user inputed data
    let userData = req.body.userData;
    console.log(userData)
    // checking if the entered email exist in database
    user.findOne({email:userData.email})
    .then((user)=>{
        // no user
        if(!user){
            res.status(401).send('invald User')
        }
        // valid function is checked with the hash and salt-password 
        if (!validPassword(userData.password, user.hash, user.salt))
        {
            res.status(401).send('invald User')

        }
        else
        {   
            // assigining admin boolen
            let isadmin = user.admin;
            let userID=user._id;
            let user_name=user.name;
            // fayload for jwt
            let payload = {subject:userData.email+userData.password}
            // token creation useing sign function
            let token = jwt.sign(payload,'secretKey')
            res.status(200).send({token,isadmin,userID,user_name});
        }
    })

});

// TODO
router.post('/register', (req, res, next) => {
    res.header("Access-Control-Allow-Orgin", "*");
    res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTION");
    console.log(req.body);
    const saltHash = genPassword(req.body.user.password);

    var salt = saltHash.salt;
    var hash = saltHash.hash;

    const newUser = new user({
        name: req.body.user.name,
        email:req.body.user.email,
        age:req.body.user.age,
        phoneNumber: req.body.user.phoneNumber,
        hash: hash,
        salt: salt,
        admin:false
    })

    newUser.save();
});



// Cart
router.post("/cart",(req,res,next)=>{
    res.header("Access-Control-Allow-Orgin", "*");
    res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTION");
    let cartData = req.body.cart;

    console.log(cartData);
    cart.findOne({user_id:cartData.userID})
    .then(async (data)=>{
        if(!data){
            let newItem = new cart({
                user_id:cartData.userID,
                product:[cartData.pID]
            })
            newItem.save();
        }else{
            await cart.findOneAndUpdate({user_id:cartData.userID},
            {
                $push:{product:cartData.pID}
            })
        }
    })
    
})

// Cartdata when initialising
router.get("/cart/:id", (req, res, next) => {
    res.header("Access-Control-Allow-Orgin", "*");
    res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTION");
    let cdata = [];
    cart.find({ user_id: req.params.id })
    .then((response)=>{
        let [data] = response;
        for(let i=0;i<data.product.length;i++){
            products.findOne({_id:data.product[i]})
            .then(async (res)=>{
               await cdata.push(res)
                console.log(cdata);
            })
        }
    })

})

// cart delete
router.post("/cart",(req,res)=>{
    res.header("Access-Control-Allow-Orgin", "*");
    res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTION");
    cart.updateOne({user_id:req.body.userID},
        {
            $pull: { product: [req.body.index] }
        })
   
})


/**
* -------------- GET ROUTES ----------------
*/


router.get('/login-success', isAuth,(req, res, next) => {
    res.header("Access-Control-Allow-Orgin", "*");
    res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTION");
    console.log("logged in!") 
})


router.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

module.exports = router;

