var convert = require('./index.js').convert;

/* testcode */
var sql1 = 'SELECT * from mysql.shop where shop_id > 5 group by id';
console.log( convert(sql1) );
var sql1 = 'SELECT id,name from shop where shop_id between 5 and 10';
console.log( convert(sql1) );
