
Bonds.Manager = Bonds.Class.extend({
  options: {
    Owner:  Bonds.Owner,  //constructor of objects-owner
    Bond:   Bonds.Bond,   //constructor of objects-link

    level:  1,
    shape:  "vertical",   // "vertical", "horizontal", "radial", "free"

    source: "",

    padding: 5 
  },

  initialize: function ( elementId, rootId, options) {
    options = Bonds.setOptions(this, options);

    this._init(rootId);

    this._collect( elementId );

    this._initHandler();

    this.refresh();
  },

  _init: function(rootId) {
    this._rootId   = rootId;
    this._curShape = null;
    this._curLevel = 0; 
    
    this._bonds    = {};
    this._owners   = {};
    this._levelOwners = []; //owner-objects distributed across levels
    this._levelBonds  = [[]]; //bond-objects distributed across levels
  },

  _collect: function( id ) {
    this._$element = $( "#"+id ).addClass( "bonds-container" );
  },

  _initHandler: function() {
    var self = this;

    $(window).on("resize", function(){
      self._refreshShape();
    });
  },

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
    this._addObj(obj);
  },

  removeOwner: function(obj){
    this._removeObj(obj);
  },

  addBond: function(obj) {
    this._addObj(obj, "bonds");
    console.log("addBond", obj.getLevel());
  },

  removeBond: function(obj) {
    this._removeObj(obj, "bonds");
  },

  _addObj: function(obj, type) {
    var level    = obj.getLevel(),
        objs     = (type === "bonds") ? this._bonds      : this._owners,
        levelObj = (type === "bonds") ? this._levelBonds : this._levelOwners;
    
    objs[ obj.getId() ] = obj;
    
    if ( !levelObj[level] ) {
      levelObj[level] = [];
    }

    levelObj[level].push( obj );
   
    this._appendObj(obj);
  },

  _removeObj: function(obj, type) {
    var level    = obj.getLevel(),
        objs     = (type === "bonds") ? this._bonds      : this._owners,
        levelObj = (type === "bonds") ? this._levelBonds : this._levelOwners;

    delete objs[ obj.getId() ];

    for ( var i = levelObj.length - 1; i >= 0; i--) {
      if (levelObj[i] === obj) {
        levelObj.splice(i, 1);
      }
    };

    this._refreshShape();
  },

  _appendObj: function(obj) {
    obj.setPosition( (Math.floor(Math.random()*1200)) + ";" + (obj.getLevel()*200 + 50) );
    this._$element.append( obj.getElement() );
    this._refreshShape();
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

    for (var i = 0, l = this._levelOwners.length; i < l; i++) {
      levelObj = this._levelOwners[i];

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
//-----------shape-------------------
  setShape: function(shape) {
    this.options.shape = shape;
    this._refreshShape(true);
  },

  _refreshShape: function(now) {
    if (now === true) {
      this.__refresh( this.__refreshed );
    } else {
      this.__refreshed = this.__refreshed+1 || 0;
      setTimeout( this.__refresh.bind( this, this.__refreshed ), 200 );
    }
  },
  
  __refresh: function(flag) {
    if ( this.__refreshed !== flag ) return;
    
    var shape = this.options.shape;
    console.log(shape);
    switch (shape) {
      case "vertical":
        this._showVerticalShape();
        break;
      case "horizontal":
        this._showHorizontalShape();
        break;
      case "radial":
        this._showRadialShape();
        break;
      default:
        break;
    }
  },
//to do
  _showVerticalShape: function() {
    $(".grid").remove();

    var w = this._$element.width()  - this.options.padding*2,
        h = this._$element.height() - this.options.padding*2,
        owners = this._levelOwners,
        bonds = this._levelBonds,
        vStep = h / owners.length,
        hStep = 0,
        pos = "";
    
    $("<div>", {class:"grid", style:"width: "+w+"px; height: "+h+"px; top: "+this.options.padding+"px; left: "+this.options.padding+"px "}).appendTo(this._$element);
    
    for ( var i = 0, l = owners.length; i < l; i++ ) {
      y = vStep/2 + vStep*i + this.options.padding;
      hStep = w / owners[i].length;
      $("<div>", {class:"grid", style:"width: "+w+"px; height: "+(y-this.options.padding)+"px; top: "+this.options.padding+"px; left: "+this.options.padding+"px "}).appendTo(this._$element);
    
      for(var j = 0, k = owners[i].length; j < k; j++){
        x = hStep/2 + hStep*j + this.options.padding;
        
        pos = Math.floor(x) + ";" + Math.floor(y);
        owners[i][j].setPosition(pos);

        $("<div>", {class:"grid", style:"width: "+(x-this.options.padding)+"px; height: "+h+"px; top: "+this.options.padding+"px; left: "+this.options.padding+"px "}).appendTo(this._$element);
    
      }
    }
    
    vStep = h / bonds.length,
    hStep = 0,
    pos = "";
    
    for ( var i = 0, l = bonds.length; i < l; i++ ) {
      y = vStep*i + this.options.padding;
      hStep = w / bonds[i].length;
      
      for(var j = 0, k = bonds[i].length; j < k; j++){
        x = hStep/2 + hStep*j + this.options.padding;
        
        pos = Math.floor(x) + ";" + Math.floor(y);
        bonds[i][j].setPosition(pos);
      }
    }

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