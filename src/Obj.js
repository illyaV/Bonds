
Bonds.Obj = Bonds.Class.extend({
  options: {
    level:     null,
    cssClass:  ""
  },
  
  initialize: function (manager, id, options, data) {
    options = Bonds.setOptions(this, options);
    
    this._manager = manager;
    this._id      = id;

    this._level   = (this.options.level === undefined) ? 1000 : this.options.level;

    this._createElement();
    this._setData(data);
  },

  _createElement: function () {
    this._element = $( "<div>", { id: this._id, class: "bonds-obj " + this.options.cssClass, tabindex: "-1" } );
  },

  _setData: function (data) {
    if ( data && typeof data === "object" ) {
      this._data = Bonds.Util.cloneObject( data );

      //this._setBonds(this._data);
      
      this._collect();
      
      return data;
    }

    return;
  },

  _setBonds: function(data) {
    this._bonds = data.link || null;
  },

  _collect: function() {
    var header = $("<h6 class='bonds-obj-name'>"+this._data.dbheader+"<br>"+this._id+"</h6>");
    //template
    this._element.html( header );
  },

  _showPreloader: function() {
    this._element.addClass('load');
  },

  _hidePreloader: function() {
    this._element.removeClass('load');
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
    return this._element;
  },

  remove: function() {
    this._element.remove();
    this.fire("remove", this);
  }

});