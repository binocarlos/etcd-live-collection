var etcdjs = require('etcdjs')
var flatten = require('etcd-flatten')

var EventEmitter = require('events').EventEmitter
var util = require('util')

function loadValues(etcd, key, done){
	etcd.get(key, {
		recursive:true
	}, function(err, result){
		if(err) return done(err)
		if(!result || !result.node){
			return done(null, [])
		}
		result = flatten(result.node)
		done(null, result)
	})
}

function LiveCollection(etcd, key){
	var self = this;
	EventEmitter.call(this)
	this._etcd = etcd
	this._key = key
	this._values = {}

	this.listen()
	this.refresh(function(){
		self.emit('ready')
	})
}

util.inherits(LiveCollection, EventEmitter)

LiveCollection.prototype.refresh = function(done){
	var self = this;
	loadValues(this._etcd, this._key, function(err, values){
		if(err) return done(err)
		self._values = values || {}
		done()
	})
}

LiveCollection.prototype.listen = function(){
	var self = this;

	function onChange(err, result, next) {
		if(err) return next(onChange)
		if(!result) return next(onChange)

		self.refresh(function(){
			self.emit('action', result.action, result.node.key, result.node.value)
			next(onChange)
		})
	}

	this._etcd.wait(this._key, {
		recursive:true
	}, onChange)
}


LiveCollection.prototype.values = function(){
	return this._values
}

module.exports = function(etcd, key){
	if(typeof(etcd)=='string'){
		etcd = etcdjs(etcd)
	}
	return new LiveCollection(etcd, key)
}