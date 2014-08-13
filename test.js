var tape = require('tape')
var async = require('async')
var etcdjs = require('etcdjs')
var flatten = require('etcd-flatten')
var Collection = require('./')

var baseKey = '/fruit'
var etcd = etcdjs('127.0.0.1:4001')

function writeValue(key, value, next){
	etcd.set(baseKey + key, value, next)
}

tape('reset etcd', function(t){
	etcd.del(baseKey, {
		recursive:true
	}, function(err){
		if(err){
			t.fail(err, 'del keys')
			t.end()
			return
		}
		t.end()
	})
})

tape('write initial values', function(t){
	async.series([
		function(next){
			writeValue('/apples', 'green', next)
		},
		function(next){
			writeValue('/oranges/satsuma', 'orange', next)
		}
	], function(err){
		if(err){
			t.fail(err, 'write initial values')
			t.end()
			return
		}
		t.end()
	})
})

tape('check the collection as etcd events happen', function(t){
	var collection = Collection(etcd, '/fruit')

	collection.on('ready', function(){
		var vals = collection.values()

		console.log('-------------------------------------------');
		console.dir(vals)
		process.exit()
	})
})