import d3    from 'd3';
import THREE from 'THREE';

// adapted from memoize.js by @philogb and @addyosmani
export const memoize = (fn) => {
  return function () {
    let args = Array.prototype.slice.call(arguments),
        key  = "", len = args.length, cur = null;

    while (len--) {
      cur = args[len];
      key += (cur === Object(cur))? JSON.stringify(cur): cur;

      fn.memoize || (fn.memoize = {});
    }

    return (key in fn.memoize)? fn.memoize[key]:
    fn.memoize[key] = fn.apply(this, args);
  };
}

export const debounce = (func, wait, immediate) => {
  let timeout;

  return function() {
    let context = this, 
        args    = arguments,
        later   = function() {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
        },
        callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}

export var getTween = function (prop, to, time = 500) {
  let node     = this,
      curr     = node[prop],
      interpol = d3.interpolateObject(curr, to);

  return function (t) {
    node[prop].copy(interpol(t / time));
    if (t >= time) {
      return true;
    }
  };
};

/*
 * Helper function that returns a random number between the two supplied
 * numbers. 
 *
 *  @param min  :  Integer
 *  @param max  :  Integer
 */
export const rando = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Returns a color code based on the sentiment score. Colors range
 * from red to green.
 *
 * @param     score    :    Integer
 *
 */
export const getColor = ( score ) => {
  if ( score < -2 ) {
    return 0xff0000;
  } else if ( score < -1 ) {
    return 0xff8000;
  } else if ( score < 0 ) {
    return 0xffff00;
  } else if ( score == 0 ) {
    return 0xffffff;
  } else if ( score > 0 ) {
    return 0xbfff00;
  } else if ( score > 1 ) {
    return 0x40ff00;
  } else if ( score > 2 ) {
    return 0x00ff00;
  }
}

/**
 * convert the positions from a lat, lon to a position on a sphere.
 *
 * @param     lat    : Number 
 * @param     lon    : Number 
 * @param     radius : Number 
 * @param     height : Number 
 *
 */
export const latLongToVector3 = ( lat, lon, radius, height ) => {
  let phi   = (lat)       * Math.PI/180,
      theta = (lon - 180) * Math.PI/180,
      x     = -(radius + height) * Math.cos(phi) * Math.cos(theta),
      y     =  (radius + height) * Math.sin(phi),
      z     =  (radius + height) * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3( x, y, z );
}
