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

	collection.on('action', function(action, key, value){
		var vals = collection.values()
		if(action=='set'){
			t.equal(key, '/fruit/pear', 'pear key')
			t.equal(value, 'yum', 'pear value')
			t.equal(Object.keys(vals).length, 3, 'there are 3 values now')
		}
		else if(action=='delete'){
			t.equal(key, '/fruit/apples')
			t.equal(Object.keys(vals).length, 2, 'there are 2 values now')
			t.end()
			process.exit()
		}
	})

	collection.on('ready', function(){
		var vals = collection.values()

		t.equal(vals['/fruit/oranges/satsuma'], 'orange')
		t.equal(vals['/fruit/apples'], 'green')

		etcd.set('/fruit/pear', 'yum', function(err){

			setTimeout(function(){
				etcd.del('/fruit/apples', function(err){
					
				})	
			}, 150)
			
		})

	})
})