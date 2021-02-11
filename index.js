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
          if (query.groupby && query.groupby[i].column) {
                index(aggs, jid, { 'terms': { 'field': query.groupby[i].column } })
          } else {
                index(aggs, jid, { 'terms': { 'field': key.expr.column } })
          }
	  if(i<query.columns.length-1){
	    index(aggs,jid+".aggregations",{});
	    parent.push('aggregations');
	  }
	})

	dsl.aggregations = aggs;
  }

  function leftRight(operator,data){
	if(operator == "AND" && data.left.right){
		leftRight(data.left.operator,data.left);
		leftRight(data.right.operator,data.right);
		return;
	}
	if(operator == "OR" && data.left.right){
		orLeftRight(data.left.operator,data.left);
		orLeftRight(data.right.operator,data.right);
		return;
	}
	if(operator == "NOT" && data.expr && data.expr.left && data.expr.right){
		bool.must_not.push( { match: { [data.expr.left.column]: data.expr.right.value }} );
		return;
	}
	switch( operator ){
		case "=":
			bool.must.push( { match: { [data.left.column]: data.right.value }} );
			break;
		case "<>":
			bool.must_not.push( { match: { [data.left.column]: data.right.value }} );
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
			range[data.left.column].gte = data.right.value[0].value;
			range[data.left.column].lte = data.right.value[1].value;
			break;
	}
  }

  function orLeftRight(operator,data){
	if(operator == "NOT" && data.expr && data.expr.left && data.expr.right){
		bool.must_not.push( { match: { [data.expr.left.column]: data.expr.right.value }} );
		return;
	}
	switch( operator ){
		case "=":
			bool.should[0].bool.must.push( { match: { [data.left.column]: data.right.value }} );
			break;
		case "<>":
			bool.should[0].bool.must_not.push( { match: { [data.left.column]: data.right.value }} );
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
			range[data.left.column].gte = data.right.value[0].value;
			range[data.left.column].lte = data.right.value[1].value;
			break;
	}
  }

  if (query.where && query.where.operator){
	var bool = {
		"must": [],
		"must_not": [],
		"filter": [],
		"should": [{
			"bool":{
				"must": [],
				"must_not": []
			}
		}]
	}
	var range = {};

	leftRight(query.where.operator,query.where);

	if(Object.keys(range).length !== -1){
		const rangeArr = Object.keys(range).map(val => {
			const rangeObj = {
				range: {
					[val]: range[val]
				}
			}
			return rangeObj;
		})
		bool.filter = rangeArr;
	}
	
	dsl.query.bool = bool;

  } else {

    	dsl.query = { "match_all": {} };
  }

  return dsl;

}

exports.parse = parse;
exports.convert = convert;


