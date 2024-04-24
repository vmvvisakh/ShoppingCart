var db=require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
         userData.Password=await bcrypt.hash(userData.Password,10)
         db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
            // console.log(data);
            resolve(data)
         })
        })   
    },

    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
 
            if(user){
               
                bcrypt.compare(userData.Password,user.Password).then((response)=>{
                if(response){
                    console.log("Login Succes");
                    resolve(user)
                    console.log('user', user)   
                }else {
                    console.log("Login Failed");
                    resolve({status:false})
                }
                })
                
                //userdata password from web browser and user password from database
            }else{
                console.log("User not found");
                resolve({status:false})
            }
            // console.log('myObj', myObject)
        })   
    }

}