Bonds.Owner = Bonds.Obj.extend({
  options: {
    source: "",
    cssClass: "bonds-obj-owner"
  },
  
  initialize: function (manager, id, options, data) {
    Bonds.setOptions(this, options);
    
    //this._branchesData = [];
    this._bondsData = null;
    
    Bonds.Obj.prototype.initialize.apply( this, arguments );
    
    var self = this;
    this._$element.mousedown(function(event){ 
      event.preventDefault();
      event.stopPropagation();
      if( event.button == 2 ) {
        self.createBonds();
      }
    });
    

    this._manager.addOwner(this);
  },

  _setData: function (data) {
    if ( data && typeof data === "object" ) {

      this._bondsData = Bonds.Util.cloneObject( data.link ) || null;
      return Bonds.Obj.prototype._setData.apply( this, [data] );
    
    } else if ( typeof this.options.source === "string" ) {
      
      this._loadData();
    
    }

    return;
  },

  _loadData: function (fn) {
    var self = this;

    if ( !this.__loadingData ) {
      this._showPreloader();
      this.__loadingData = $.Deferred();

      //Bonds.Util.ajax( "post", true, this.options.source, {"id": this._id}, function(data){self.__loadingData.resolve(data);});
      setTimeout( function(){ 
        Bonds.Util.ajax( "post", true, self.options.source, {"id": self._id}, function(data){self.__loadingData.resolve(data);});
      }, Math.random()*1000);
      
      this.__loadingData.done(function(data){
        self._setData(data);
        self._hidePreloader();
      });
    }
    
    if (typeof fn === "function") {
      this.__loadingData.done(fn);
    }
  },

  createBonds: function(callback) {
    var self = this,
        data = this._bondsData,
        newBranch,
        options,
        bondData;
    
    if (data === null) {
    
      this._loadData( this.createBonds.bind(this, callback) );
    
    } else {
      if ( this._branches.length === 0 ) {

        for ( var i = 0, l = data.length; i < l; i++ ) {
          for ( var j = 0, k = data[i].link.length; j < k; j++ ) {
            
            options = Bonds.Util.cloneObject( this.options );
            options.level += 1;
            options.removed = true;

            newOwner = this._manager.createOwner(data[i].link[j].gid, options, data[i].link[j]);
            this.addBranch(newOwner);
            newOwner.addRoot(this);
          }
          
          bondData = Bonds.Util.cloneObject( data[i] );
          bondData.rootsId = [this._id];
          this._manager.createBond(data[i].gid, {"level": this._level + 1}, bondData);
        }

        if (typeof callback === "function") {
          for (var i = this._branches.length - 1; i >= 0; i--) {
            !function(self, i){ 
              setTimeout( function() { callback(self._branches[i]); }, 1);
            }(this, i);
          }
        }

      }
    }
  },

  _addRootListeners: function(obj) {
    obj.on("remove", "removeRoot", this);
    obj.on("removeBranches", "removeRoot", this);
  },
  _removeRootListeners: function(obj) {
    obj.off("remove", "removeRoot", this);
    obj.off("removeBranches", "removeRoot", this);
  },

  _addBranchListeners: function(obj) {
    obj.on("remove", "removeBranch", this);
  },
  
  _removeBranchListeners: function(obj) {
    obj.off("remove", "removeBranch", this);
  },

  removeRoot: function(obj) {
    if ( Bonds.Obj.prototype.removeRoot.apply( this, arguments ) === 0 ) {
      this.remove();
    }
  },

  removeBranch: function(obj) {
    var data = this._bondsData;

    if ( Bonds.Obj.prototype.removeBranch.apply( this, arguments ) === 0 ) {
      this._bondsData = [];
    } else {//remove data for building branch- and bond-objects 
      for ( var i = data.length - 1; i>= 0; i-- ) {
        for (var j = data[i].link.length - 1; j >= 0; j--) {
          if ( data[i].link[j].gid == obj.getId() ) {
            data[i].link.splice(j, 1);
          }
        };

        if ( data[i].link.length == 0 ) {
          data.splice(i, 1);
        }
      };
    }

    return this._branches.length;
  },

  hideBonds: function() {
    this.fire("removeBranches", this);
    this._branches = [];
  },

  removeBonds: function() {
    this._bondsData = [];
    this.hideBonds();
  },

  remove: function() {
    // this.removeRoots();
    // this.removeBranches();
    // this.removeBonds();
    if (this.options.removed === false) return;
    
    this._manager.removeOwner(this);
    Bonds.Obj.prototype.remove.apply( this, arguments );
  }
});