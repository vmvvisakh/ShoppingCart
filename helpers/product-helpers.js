
var db=require('../config/connection')
var collection = require('../config/collections')

module.exports={
    addProduct:(product,callback) =>{
        console.log(product);
        db.get().collection('product').insertOne(product).then((data)=>{
            // console.log(data.insertedId);
            callback(data.insertedId)
        })
    },
    getAllProducts: () =>{
        return new Promise(async(resolve,reject)=>{
            let products = db.get().collection(collection.PRODUCT).find().toArray()
            resolve(products)
        })
    }
}