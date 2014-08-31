
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

    this.createOwner(this._rootId, {source: this.options.source, level: 0, removed: false}, this.options.source);
    this.setLevel();
    //this.setShape();
  },
  
  createOwner: function(id,options, data) {
    // var newOwner = this.getOwner(id);
    // if (!newOwner) {
    //   newOwner = new this.options.Owner(this, id, { "source": this.options.source, "level": 0 }, data);
    // }

    // return newOwner;
    console.time("newOwner");
    var newOwner = this.getOwner(id) || new this.options.Owner(this, id, options, data);
    console.timeEnd("newOwner");
    return newOwner;

    return this.getOwner(id) || new this.options.Owner(this, id, options, data);
  },

  createBond: function(id, options, data){
    // var newBond = this.getBond(id);
    // if (!newBond) {
    //   newBond = new this.options.Bond(this, id, { "source": this.options.source, "level": 0 }, data);
    // }
    console.time("newBond");
    var newBond = this.getBond(id) || new this.options.Bond(this, id, options, data);
    console.timeEnd("newBond");
    return newBond;

    return this.getBond(id) || new this.options.Bond(this, id, options, data);
  },

  addOwner: function(obj) {
    var id = obj.getId(),
        level = obj.getLevel();

    this._owners[id] = obj;
    
    if ( !this._levelObj[level] ) {
      this._levelObj[level] = [];
    }

    this._levelObj[level].push( obj );

    //this._subscribeOnOwner(obj);

    this._appendObj(obj);
  },

  removeOwner: function(obj){
    var id = obj.getId(),
        levelObj = this._levelObj[obj.getLevel()] || [];

    delete this._owners[id];

    for (var i = levelObj.length - 1; i >= 0; i--) {
      if (levelObj[i] === obj) {
        levelObj.splice(i, 1);
      }
    };
  },

  addBond: function(obj) {
    var id = obj.getId();

    this._bonds[id] = obj;

    this._appendObj(obj);
  },

  removeBond: function(obj) {
    var id = obj.getId();

    delete this._bonds[id];
  },
  
  // _subscribeOnOwner: function(obj) {
  //   obj.on("create", "addOwner", this);
  //   //obj.on("remove");
  //   //obj.on("createChildren", "");
  // },

  _appendObj: function(obj) {
    this._element.append( obj._element.css( { top: obj.getLevel()*200 + 50 + "px", left: Math.random()*1200 + "px"} ) );
  },

  getBond: function(id){
    return this._bonds[id];
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
      } else if (i === level) {
        for (var j = levelObj.length - 1; j >= 0; j--) {
          levelObj[j].hideBonds();
        };
      }
    
    };

    this._curLevel = level;
  },
  
//-----------jsPlumb-----------------
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