etcd-live-collection
--------------------

A local cache of objects that auto-updates from etcd wait listeners

## install

```
$ npm install etcd-live-collection
```

## usage

Create a collection based on an etcd key - the collection will automatically keep in sync.

```js
var liveCollection = require('etcd-live-collection')
var etcdjs = require('etcdjs')

var etcd = etcdjs('127.0.0.1:4001')
var collection = liveCollection(etcd, '/my/key')

// once the collection has initialized with values
collection.on('ready', function(map){
	// map is a flat object with etcd keys and values
	console.dir(collection.values())
})

collection.on('add', function(key, value){

})

collection.on('remove', function(key){

})

collection.on('change', function(){

})
```

## api

#### `var collection = liveCollection(etcdConnection, key)`

Create a new collection - etcdConnection can be a connection string or an existing etcdjs object

key is the base key for values to be saved.

If the base key is `/apples` and you add a `/green` key to the collection then the etcd key will be `/apples/green`

#### `var map = collection.values()`

Return all the current values in the collection

Map is a flat object of keys onto values:

```js
{
	"/apples/green":10,
	"/oranges":12
}
```

## events

#### `collection.on('action', function(action, key, value){})`

Called when a change has happened to a value in the collection.

## license

MIT