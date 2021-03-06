
Bonds.Obj = Bonds.Class.extend({
  options: {
    level:     null,
    cssClass:  "",
    removed:   true
  },
  
  initialize: function (manager, id, options, data) {
    options = Bonds.setOptions(this, options);
    
    this._manager = manager;
    this._id      = id;

    this._roots    = []; //list of root-objects for this object
    this._branches = []; //list of branch-objects for this object

    this._level   = (this.options.level === undefined) ? 1000 : this.options.level;

    this._createElement();
    this._setData(data);

    var self = this;
    this._$element.on("dblclick", function(){self.remove();});
  },

  _createElement: function () {
    this._$element = $( "<div>", { id: this._id, class: "bonds-obj " + this.options.cssClass, tabindex: "-1" } );
    this._$preloader = $( "<div>", { class: "bonds-preloader" } ).append($("<i>", { class: "fa fa-spinner fa-spin bonds-preloader-icon" }));

    this._$element.append( this._$preloader.hide() );
  },

  _setData: function (data) {
    if ( data && typeof data === "object" ) {
      this._data = Bonds.Util.cloneObject( data );
      
      this._collect();
      
      return data;
    }

    return;
  },

  _collect: function() {
    if (this.__collected) return;
    var header = $("<h6 class='bonds-obj-name'>"+this._data.dbheader+"<br>"+this._id+"</h6>");
    //template
    this._$element.append( header );

    this.__collected = true;
  },
  
  addRoot: function(obj) {
    this._roots.push(obj);
    this._addRootListeners(obj);
    return this;
  },

  removeRoot: function(obj) {
    var roots = this._roots;

    for (var i = roots.length - 1; i >= 0; i--) {
      if (roots[i] === obj) {
        roots.splice(i, 1);
        this._removeRootListeners(obj);
        break;
      } 
    };

    return this._roots.length;
  },

  addRoots: function(arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
      this.addRoot(arr[i]);
    };
    return this;
  },

  removeRoots: function(arr) {
    arr = arr || this._Roots; 
    
    for (var i = arr.length - 1; i >= 0; i--) {
      this.removeRoot(arr[i]);
    };

    return this;
  },

  addBranch: function(obj) {
    this._branches.push(obj);
    this._addBranchListeners(obj);
    return this;
  },

  removeBranch: function(obj) {
    var branches = this._branches;

    for (var i = branches.length - 1; i >= 0; i--) {
      if (branches[i] === obj) {
        branches.splice(i, 1);
        this._removeBranchListeners(obj);
        break;
      } 
    };

    return this._branches.length;
  },

  addBranches: function(arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
      this.addBranch(arr[i]);
    };
    return this;
  },

  removeBranches: function(arr) {
    arr = arr || this._branches; 
    
    for (var i = arr.length - 1; i >= 0; i--) {
      this.removeBranch(arr[i]);
    };

    return this;
  },



  //abstract methods for add/remove listeners of events 
  _addRootListeners:      function(obj) {},
  _removeRootListeners:   function(obj) {},

  _addBranchListeners:    function(obj) {},
  _removeBranchListeners: function(obj) {},

  _showPreloader: function() {
    this._$preloader.show();
  },

  _hidePreloader: function() {
    this._$preloader.hide();
  },
  
  /****************API***************/
  
  getId: function() {
    return this._id;
  },

  getData: function() {
    return Bonds.Util.cloneObject( this._data );
  },

  getLevel: function() {
    return this._level;
  },

  getElement: function() {
    return this._$element;
  },

  setPosition: function(pos) {
    pos = (pos+"").split(";");
    
    var left = pos[0] || "0",
        top  = pos[1] || "0";
    this._$element.css( { top: (top + "px"), left: (left + "px") } );

    return this;
  },

  remove: function() {
    if (this.options.removed === false) return;

    this._$element.remove();
    this.fire("remove", this);
  }

});