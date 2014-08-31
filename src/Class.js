Bonds.Class = function () {
  this._subscribers = {
    any: []
  };
};

Bonds.Class.extend = function (props) {

  // extended class with the new prototype
  var NewClass = function () {
    this._subscribers = {
      any: []
    };
	// call the constructor
	if (this.initialize) {
	  this.initialize.apply(this, arguments);
	}
  };

  // instantiate class without calling constructor
  var F = function () {};
  F.prototype = this.prototype;

  var proto = new F();
  proto.constructor = NewClass;

  NewClass.prototype = proto;

  //inherit parent's statics
  for (var i in this) {
  	if (this.hasOwnProperty(i) && i !== 'prototype') {
  	  NewClass[i] = this[i];
  	}
  }

  // merge options
  if (props.options && proto.options) {
  	props.options = Bonds.extend({}, proto.options, props.options);
  }

  // mix given properties into the prototype
  Bonds.extend(proto, props);

  NewClass.superclass = this.prototype;

  return NewClass;
};


// method for adding properties to prototype
Bonds.Class.include = function (props) {
  Bonds.extend(this.prototype, props);
};

// merge new default options to the Class
Bonds.Class.mergeOptions = function (options) {
  Bonds.extend(this.prototype.options, options);
};

Bonds.Class.prototype.on = function (type, fn, context) {
  type = type || 'any';
  fn = typeof fn === "function" ? fn : context[fn];
        
  if (typeof this._subscribers[type] === "undefined") {
    this._subscribers[type] = [];
  }
  
  this._subscribers[type].push({fn: fn, context: context || this});
};

Bonds.Class.prototype.off = function (type, fn, context) {
  this._visitSubscribers('unsubscribe', type, fn, context);
};
Bonds.Class.prototype.fire = function (type, publication) {
  this._visitSubscribers('publish', type, publication);
};
Bonds.Class.prototype._visitSubscribers = function (action, type, arg, context) {
    var pubtype = type || 'any',
        subscribers = this._subscribers[pubtype],
        i,
        max = subscribers ? subscribers.length : 0;
            
    for (i = 0; i < max; i += 1) {
      if (action === 'publish') {
      	subscribers[i].fn.call(subscribers[i].context, arg);
      } else {
        if (subscribers[i].fn === arg && subscribers[i].context === context) {
          subscribers.splice(i, 1);
        }
      }
    }
};
