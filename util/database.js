var mongojs = require('mongojs');
var dbobject=mongojs('mongodb://gayatri:gayii@cluster0-shard-00-00.rsjhd.mongodb.net:27017,cluster0-shard-00-01.rsjhd.mongodb.net:27017,cluster0-shard-00-02.rsjhd.mongodb.net:27017/educationalhub?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority',['login']);
console.log(dbobject)
module.exports.dbobject=dbobject;

/*dbobject.librarian.find(function (err,docs){
    console.log(docs)
})*/
 
