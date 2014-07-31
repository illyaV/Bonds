
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

    this._root = null;
    this._branches = [];

    Bonds.Obj.prototype.initialize.apply( this, arguments );

    this._manager.addBond(this);

    this._initBranches();
    this._initHandlers();
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
    var links = this._data.link;

    this._root = this._manager.getOwner( this._data.rootId );
    
    for (var i = links.length - 1; i >= 0; i--) {
      this._branches.push( this._manager.getOwner(links[i].gid) );
    };
  },

  _initHandlers: function() {
    this._root.on("remove", "remove", this);
    
    var branches = this._branches;

    for (var i = branches.length - 1; i >= 0; i--) {
      branches[i].on("remove", "_removeBranch", this);
    };
  },
  
  _removeHandlers: function() {
  	if ( this._root ) {
      this._root.off("remove", "remove", this);
    }

    var branches = this._branches;

    for (var i = branches.length - 1; i >= 0; i--) {
      if (branches[i]) {
      	branches[i].off("remove", "_removeBranch", this);
      }
    };
  },

  _buildConnects: function() {
    this._connect( this._root.getId(), this._id );

    for (var i = this._branches.length - 1; i >= 0; i--) {
      this._connect( this._id, this._branches[i].getId() );
    };
  },

  _removeConnects: function() {
    var jsPlumb = this._manager.jsPlumb()

    jsPlumb.detachAllConnections(this._id);
  },

  _removeBranch: function(obj) {
    var branches = this._branches;
    
    for (var i = branches.length - 1; i >= 0; i--) {
      if (branches[i] === obj) {
      	branches.splice(i, 1);
      }
    };

    if ( this._branches.length === 0 ) {
      this.remove();
    }
  },
   
  _connect: function(source, target, options) {
  	var jsPlumb = this._manager.jsPlumb(),
  	    pointOpt = {
  	      endpoint: "Blank",
  	      anchor:   "AutoDefault"
	    },
  	    src     = jsPlumb.addEndpoint(source, pointOpt),
  	    trg     = jsPlumb.addEndpoint(target, pointOpt),
  	    connOpt = this.options.conections;		    	      
    
    jsPlumb.connect( {
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
  },

  remove: function() {
    this._removeConnects();

    this._removeHandlers();

    this._root = null;
    this._branches = [];

  	this._manager.removeOwner(this);
  	Bonds.Obj.prototype.remove.apply( this, arguments );
  }
});