var convert = require('./index.js').convert;

/* testcode */
//var sql1 = 'SELECT * from mysql.shop where shop_id > 5 group by id';
//console.log( convert(sql1) );
var sql1 = 'SELECT id,name from shop where shop_id between 5 and 10';
console.log( JSON.stringify( convert(sql1),null,2) );
var sql1 = 'SELECT id,name from shop where shop_id BETWEEN 5 and 10 AND test = "cat"';
console.log( JSON.stringify( convert(sql1),null,2) );
