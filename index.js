/*
 * SQL to Elastic Query converter
 * (c) QXIP BV 2018
 */

var parse = require('node-sqlparser').parse;
var stringify = JSON.stringify;

function index(obj,is,value) {
    if (typeof is == 'string')
        return index(obj,is.split('.'), value);
    else if (is.length==1 && value!==undefined)
        return obj[is[0]] = value;
    else if (is.length==0)
        return obj;
    else
        return index(obj[is[0]],is.slice(1), value);
}

var convert = function(q){
  var dsl = {
    "query": {}
  };
  var query = parse(q);

  if (Array.isArray(query.columns)){
  	var aggs = {};
	var parent = [];
	query.columns.forEach(function(key,i){
	  parent.push(key.expr.column);
	  var jid = parent.join('.')
	  index(aggs,jid,{ "terms" : { "field" : key.expr.column } });
	  if(i<query.columns.length-1){
	    index(aggs,jid+".aggregations",{});
	    parent.push('aggregations');
	  }
	})

	/*
  	query.columns.forEach(function(col){
  	  if (col.expr.column) {
  	    aggs[col.expr.column] = { "terms" : { "field" : col.expr.column } };
	    parent = col.expr.column;
  	  }
  	})
	*/

	dsl.aggregations = aggs;
  }

  function leftRight(operator,data){
	switch( operator ){
	  case "=":
		bool.must.push( { match: { [data.left.column]: data.right.value }} );
		break;
	  case ">":
		range[data.left.column] = {};
		range[data.left.column].gte = data.right.value;
		break;
	  case "<":
		range[data.left.column] = {};
		range[data.left.column].lte = data.right.value;
		break;
	  case "BETWEEN":
		range[data.left.column] = {};
		range[data.left.column].gte = data.right.value[0];
		range[data.left.column].lte = data.right.value[1];
		break;
	}
  }


  if (query.where.operator){
	var bool = {
          "must": [],
          "must_not": [],
	  "filter": [],
        }
	var range = {};

	if(query.where.operator == "AND" && query.where.left.right){
		leftRight(query.where.left.operator,query.where.left);
		leftRight(query.where.right.operator,query.where.right);
	} else {

	  switch( query.where.operator ){
	    case "=":
		bool.must.push( { match: { [query.where.left.column]: query.where.right.value }} );
		break;
	    case ">":
		range[query.where.left.column] = {};
		range[query.where.left.column].gte = query.where.right.value;
		break;
	    case "<":
		range[query.where.left.column] = {};
		range[query.where.left.column].lte = query.where.right.value;
		break;
	    case "BETWEEN":
		range[query.where.left.column] = {};
		range[query.where.left.column].gte = query.where.right.value[0];
		range[query.where.left.column].lte = query.where.right.value[1];
		break;
	 }
	}

	bool.filter.push({ range: range });
	dsl.query.bool = bool;
  } else {

    dsl.query = { "match_all": {} };
  }
  return dsl;

}

exports.parse = parse;
exports.convert = convert;


