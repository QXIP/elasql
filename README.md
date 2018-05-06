# sqlastic
Generic SQL to Elasticsearch query translator

## Installation
```
npm install sqlastic
```
## Usage
```
const convert = require('sqlastic').convert
convert('SELECT id,name from shop where shop_id between 5 and 10 AND type = "cat"')
```
##### Output
```
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "type": "cat"
          }
        }
      ],
      "must_not": [],
      "filter": [
        {
          "range": {
            "shop_id": {
              "gte": {
                "type": "number",
                "value": 5
              },
              "lte": {
                "type": "number",
                "value": 10
              }
            }
          }
        }
      ]
    }
  },
  "aggregations": {
    "id": {
      "terms": {
        "field": "id"
      },
      "aggregations": {
        "name": {
          "terms": {
            "field": "name"
          }
        }
      }
    }
  }
}

```
