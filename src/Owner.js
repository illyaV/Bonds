Bonds.Owner = Bonds.Obj.extend({
  options: {
    source: "",
    cssClass: "bonds-obj-owner"
  },
  
  initialize: function (manager, id, options, data) {
    Bonds.setOptions(this, options);
    this._bonds = [];
    this._bondsData = null;
    console.log("new owner level = "+this.options.level);
    Bonds.Obj.prototype.initialize.apply( this, arguments );

    this._manager.addOwner(this);
  },

  _setData: function (data) {
    if ( data && typeof data === "object" ) {
      this.__dataLoading = false;
      this._bondsData = Bonds.Util.cloneObject( data.link ) || null;
    
      return Bonds.Obj.prototype._setData.apply( this, [data] );
    } else {
      
      if ( typeof this.options.source === "string" && !this.__dataLoading ) {

        this.__dataLoading = true;
        this._loadData();

      } else {
        return;
      }
    
    }
  },

  _loadData: function (fn) {
    var self = this,
        callback = function(data) {
          self._setData(data);
          self._hidePreloader(); 
          if (typeof fn === "function") {
            fn(data);
          }
        };

    this._showPreloader();

    setTimeout( function(){ 
      Bonds.Util.ajax( "post", true, self.options.source, {"id": self._id}, callback);
    }, Math.random()*1000);
  }, 

  createBonds: function(callback) {
    var self = this,
        data = this._bondsData,
        newOwner,
        options;
   
    if (data !== null) {
      if ( this._bonds.length === 0 ) {

        for ( var i = 0, l = data.length; i < l; i++ ) {
          
          for ( var j = 0, k = data[i].link.length; j < k; j++ ) {
            
            options = Bonds.Util.cloneObject( this.options );
            options.level += 1;

            newOwner = this._manager.getOwner(data[i].link[j].gid) || new Bonds.Owner( this._manager, data[i].link[j].gid, options, data[i].link[j] );
            this._bonds.push(newOwner);
          }
          
          data[i].rootId = this._id;
          this._manager.createBond( this._level + 0.5, data[i].gid, data[i] );
        }

        if (typeof callback === "function") {
          for (var i = this._bonds.length - 1; i >= 0; i--) {
            callback(this._bonds[i]);
          }
        }

      }

    } else if (data === null) {
      this._loadData( this.createBonds.bind(this, callback) );
    }
  },

  hideBonds: function() {
    // var bonds = this._bonds;
    
    // console.log(this._id,bonds);
    // debugger;

    // for (var i = bonds.length - 1; i >= 0; i--) {
    //   bonds[i].remove();
    // };

    this.fire("removeBonds", this);

    this._bonds = [];
  },

  removeBonds: function() {
    this.hideBonds();
    this._bondsData = [];
  },

  remove: function() {
    this._bonds = [];
    this._bondsData = null;
    this._manager.removeOwner(this);
    Bonds.Obj.prototype.remove.apply( this, arguments );
  }
});