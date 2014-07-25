Bonds.Owner = Bonds.Obj.extend({
  options: {
    source: "",
    cssClass: "bonds-obj-owner"
  },
  
  initialize: function (manager, id, options, data) {
    Bonds.setOptions(this, options);
    this._bonds = [];
    this._bondsData = null;

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
   
    if (data) {
      if ( this._bonds.length === 0 ) {

        for ( var i = 0, l = data.length; i < l; i++ ) {
          
          for ( var j = 0, k = data[i].link.length; j < k; j++ ) {
            
            options = Bonds.Util.cloneObject( this.options );
            options.level++;
            //newOwner = this._manager.getOwner(data[i].link[j].gid) || new Bonds.Owner( this._manager, data[i].link[j].gid, options, data[i].link[j] );
            newOwner = new Bonds.Owner( this._manager, data[i].link[j].gid, options, data[i].link[j] );
            
            this._bonds.push(newOwner);
          }
          data[i].rootId = this._id;
          this._manager.createBond( this._level + 0.5, data[i].gid, data[i] );
        }

      }
      
      if (typeof callback === "function") {
        for (var i = this._bonds.length - 1; i >= 0; i--) {
          callback(this._bonds[i]);
        }
      }

    } else {
      this._loadData( this.createBonds.bind(this, callback) );
    }
  }
});