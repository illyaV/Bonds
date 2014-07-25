
Bonds.Manager = Bonds.Class.extend({
  options: {
    Owner:  Bonds.Owner,  //constructor of objects-owner
    Bond:   Bonds.Bond,   //constructor of objects-link

    level:  1,
    shape:  "vertical",   // "vertical", "horizontal", "radial", "free"

    source: "" 
  },

  initialize: function ( elementId, rootId, options) {
    options = Bonds.setOptions(this, options);

    this._init(rootId);

    this._collect( elementId );

    //this._initHandler();

    this.refresh();
  },

  _init: function(rootId) {
    this._rootId   = rootId;
    this._curShape = null;
    this._curLevel = 0; 
    
    this._bonds    = {};
    this._owners   = {};
    this._levelObj = [];
  },

  _collect: function( id ) {
    this._element = $( "#"+id ).addClass( "bonds-container" );
  },

  // _initHandler: function() {
  //   this.on("newObj", "_addObj", this);
  //   //this.on("initObj", "_createChildren", this);
  // },

  refresh: function() {

    this._createOwner(0, this._rootId, this.options.source);
    this.setLevel();
    //this.setShape();
  },
  
  _createOwner: function(level, id, data) {
    var newOwner = this.getOwner(id);
    if (!newOwner) {
      newOwner = new this.options.Owner(this, id, { "source": this.options.source, "level": level }, data);
    }
  },

  createBond: function(level, id, data){
    new this.options.Bond(this, id, {level: level}, data);
  },

  addOwner: function(obj) {
    var objId = obj.getId(),
        objLevel = obj.getLevel();

    this._owners[objId] = obj;
    
    if ( !this._levelObj[objLevel] ) {
      this._levelObj[objLevel] = [];
    }

    this._levelObj[objLevel].push( obj );

    //this._subscribeOnOwner(obj);

    this._appendObj(obj);
  },

  removeOwner: function(obj){

  },

  addBond: function(obj) {
    var objId = obj.getId();

    this._bonds[objId] = obj;

    this._appendObj(obj);
  },

  removeBond: function(obj) {

  },
  
  // _subscribeOnOwner: function(obj) {
  //   obj.on("create", "addOwner", this);
  //   //obj.on("remove");
  //   //obj.on("createChildren", "");
  // },

  _appendObj: function(obj) {
    this._element.append( obj._element.css( { top: obj.getLevel()*200 + 50 + "px", left: Math.random()*1200 + "px"} ) );
  },

  getOwner: function(id){
    return this._owners[id];
  },

  setLevel: function(level){
    level = level || this.options.level;
    
    var levelObj = [],
        callback = function callback(obj) {
          if (obj.getLevel() < level) {
            obj.createBonds(callback);
          }
        };

    for (var i = 0, l = this._levelObj.length; i < l; i++) {
      levelObj = this._levelObj[i];

      if (i < level) {
        for (var j = levelObj.length - 1; j >= 0; j--) {
          levelObj[j].createBonds(callback);
        };
      } else if (i > level) {
        for (var j = levelObj.length - 1; j >= 0; j--) {
          levelObj[j].remove();
        };
      }
    
    };

    this._curLevel = level;
  },

  jsPlumb: function() {
    if (!this._jsPlumb) {
      this._jsPlumb = window.jsPlumb.getInstance();
    }

    return this._jsPlumb;
  }
});

  Bonds.manager = function(elementId, id, options) {
    return new Bonds.Manager( elementId, id, options );
  }