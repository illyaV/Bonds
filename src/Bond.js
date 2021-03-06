
Bonds.Bond = Bonds.Obj.extend({
  options: {
    cssClass:   "bonds-obj-bond",
    conections: { 
      type:       "Bezier",
      color:      "#CC3300",
      assign:     null,
      importance: "2"
    }
  },

  initialize: function (manager, id, options, data) {
    Bonds.setOptions(this, options);

    this._setConectionsOptions(data);

    Bonds.Obj.prototype.initialize.apply( this, arguments );

    this._manager.addBond(this);
    this.jsPlumb = this._manager.jsPlumb();
    this._connections = {}

    this._initBranches();
    this._buildConnects();
  },

  _setConectionsOptions: function(data) {
    for ( key in this.options.conections ) {
      if ( this.options.conections.hasOwnProperty(key) ) {
      	this.options.conections[key] = data['l'+key] || this.options.conections[key];
      }
    }
  },

  _initBranches: function() {
    var data  = this._data,
        links = data.link;

    for( var i = data.rootsId.length - 1; i >=0; i-- ) {
      this.addRoot(this._manager.getOwner( data.rootsId[i] ));
    }

    for (var i = links.length - 1; i >= 0; i--) {
      this.addBranch( this._manager.getOwner(links[i].gid) );
    };
  },
  
  _addRootListeners: function(obj) {
    obj.on("remove", "remove", this);
    obj.on("removeBranches", "remove", this);
  },
  _removeRootListeners: function(obj) {
  	obj.off("remove", "remove", this);
  	obj.off("removeBranches", "remove", this);
  },

  _addBranchListeners: function(obj) {
   obj.on("remove", "removeBranch", this);
  },
  
  _removeBranchListeners: function(obj) {
  	obj.off("remove", "removeBranch", this);
  },

  _buildConnects: function() {
    this._connections[this._roots[0].getId()] = this._connect( this._roots[0].getId(), this._id );

    for (var i = this._branches.length - 1; i >= 0; i--) {
      this._connections[this._branches[i].getId()] = this._connect( this._id, this._branches[i].getId() );
    };
  },

  _removeConnect: function(obj) {
    var connection = this._connections[obj.getId()];

    if ( connection ) {
      this.jsPlumb.detach(connection);
    }
    delete this._connections[obj.getId()];
  },

  _removeAllConnects: function() {
    this.jsPlumb.detachAllConnections(this._id);
    this._connections = {};
  },

  removeBranch: function(obj) {
    this._removeConnect(obj);
    if ( Bonds.Obj.prototype.removeBranch.apply( this, arguments ) === 0 ) {
      this.remove();
    }
  },
   
  _connect: function(source, target, options) {
  	var jsPlumb = this.jsPlumb,
  	    pointOpt = {
  	      endpoint: "Blank",
  	      anchor:   "AutoDefault"
	    },
  	    src     = jsPlumb.addEndpoint(source, pointOpt),
  	    trg     = jsPlumb.addEndpoint(target, pointOpt),
  	    connOpt = this.options.conections,
  	    connect;		    	      
    
    connect = jsPlumb.connect( {
      source: src,
      target: trg,
      connector: ["Bezier", { curviness:70 }],
      cssClass:  "bonds-connect",
      paintStyle:{ 
	      lineWidth:    connOpt.importance-0,
	      strokeStyle:  connOpt.color,
	      outlineWidth: 1,
	      outlineColor: "#555"
	    }
	  } );

	  jsPlumb.draggable(jsPlumb.getSelector(".bonds-obj")/*, { containment:".demo"}*/); 
  
    return connect;
  },

  remove: function() {
    this._removeAllConnects();

    for (var i = this._branches.length - 1; i >= 0; i--) {
    	this._branches[i].removeRoot( this._roots[0] );
    };
    this._roots = [];
    this._branches = [];

  	this._manager.removeBond(this);
  	Bonds.Obj.prototype.remove.apply( this, arguments );
  }
});