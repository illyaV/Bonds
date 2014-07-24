
Bonds.Bond = Bonds.Obj.extend({
  options: {
    cssClass: "bonds-obj-bond"
  },
  initialize: function (manager, id, options, data) {
    Bonds.setOptions(this, options);

    this._root = null;
    this._branches = [];

    Bonds.Obj.prototype.initialize.apply( this, arguments );

    this._manager.addBond(this);

    this._initBranches();
    this._buildLinks();
  },

  _initBranches: function() {
    var links = this._data.link;

    this._root = this._manager.getOwner( this._data.rootId );
    
    for (var i = links.length - 1; i >= 0; i--) {
      this._branches.push( this._manager.getOwner(links[i].gid) );
    };
  },

  _buildLinks: function() {
    this._buildLink( this._root.getId(), this._id );

    for (var i = this._branches.length - 1; i >= 0; i--) {
      this._buildLink( this._id, this._branches[i].getId() );
    };
  },

  _buildLink: function(source, target, options) {
    if (!this._manager.jsPlumb) {
      this._manager.jsPlumb = window.jsPlumb.getInstance({
		DragOptions : { cursor: "pointer", zIndex:2000 }
	  });
    }
  	
  	var jsPlumb = this._manager.jsPlumb,
  	    src = jsPlumb.addEndpoint(source),
  	    trg = jsPlumb.addEndpoint(target);		    	      
    
    jsPlumb.connect( {
      source: src,
      target: trg,
      anchors:["Center", "Center"],
      endpointStyle:{
        fillStyle:"#4a7",
	    radius: 3
	  },
      paintStyle:{ 
	    lineWidth: 4,
	    strokeStyle: "#6c9",
	    outlineWidth: 1,
	    outlineColor: "#4a7"
	  }
	} );

	jsPlumb.draggable(jsPlumb.getSelector(".bonds-obj")/*, { containment:".demo"}*/); 
  }
});