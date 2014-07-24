
Bonds.Util = {
  extend: function (dest) {
    var sources = Array.prototype.slice.call(arguments, 1),
        i, j, len, src;

	for (j = 0, len = sources.length; j < len; j++) {
	  src = sources[j] || {};
	  for (i in src) {
	    if (src.hasOwnProperty(i)) {
	    	dest[i] = src[i];
	    }
	  }
	}
	return dest;
  },

  setOptions: function (obj, options) {
    obj.options = Bonds.extend({}, obj.options, options);
    return obj.options;
  },

  cloneObject: function ( obj ) {
    //return common.Utils.cloneObject( data );
    
    if ( typeof obj !== 'object' || obj === null )  {
      return obj;
    } else {
      try {
        return JSON.parse( JSON.stringify( obj ) );
      } catch (e) {
        console.error(e);
        return null;
      }
    }
  
  },
  
  ajax: function( type, async, host, params, fn ) {
    // if( type.toUpperCase() === "POST" ) {
    //   if ( async === true ) {
    //     common.Utils.asyncPOST(host, params, fn);
    //   } else {
    //     return common.Utils.syncPOST(host, params, fn); 
    //   }
    // } else {
    //   if ( async === true ) {
    //     common.Utils.asyncGET(host, params, fn);
    //   } else {
    //     return common.Utils.syncGET(host, params, fn);
    //   }
    // }
    var result;

    $.ajax({
      async:    async,
      cache:    false,
      type:     type,
      dataType: "json",
      data:     params || {},
      url:      host
    })
      .fail(function(obj, sts, thr){
        console.error("Util ajax error: "+sts+(thr?"\r\n"+thr:"")+obj.responseText);
      } )
      .done(function(data){
        if (data && data.err){
          console.error("Util ajax error: "+data.err );
          return;
        }

        if ( fn && typeof fn === "function" ) {
          result = fn(data);
        } else {
          result = data;
        }
        
      } );
      
      return result;
  }
}

// shortcuts for most used utility functions
Bonds.extend     = Bonds.Util.extend;
Bonds.setOptions = Bonds.Util.setOptions;