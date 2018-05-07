# sql{el}astic <img src="https://user-images.githubusercontent.com/1423657/38137158-590eefbc-3423-11e8-96dd-487022b5618c.gif" width=100 />

Generic SQL to Elasticsearch query translator. Designed for [SENTINL](https://github.com/sirensolutions/sentinl)

## Installation
```
npm install sqlastic
```
## Usage
```
const convert = require('sqlastic').convert
convert('SELECT id,name FROM shop WHERE shop_id BETWEEN 5 AND 10 AND type = "cat"')
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

### License
(C) QXIP BV 2018, released under the MIT License
