import { scene, camera, renderer }    from '../common/scene';

/**
 * Scales the supplied object up by tweening the scale property.
 *
 * @param  tween    : Object
 * @param  scalar   : Number
 * @param  obj      : THREE.Mesh
 * @param  tween    : Object
 * @param  callback : function
 * 
 */
export const growObject = (tween, obj, scalar, duration, delay = 0, callback = null) => {
  new tween.Tween(obj.scale)
      .to({ 
        x: scalar,
        y: scalar,
        z: scalar
      }, duration)
      .delay(delay)
      .easing(tween.Easing.Quadratic.InOut)
      .onUpdate(function() {
        renderer.render(scene, camera);
      })
      .onComplete(callback)
      .start();
}


/**
 * fades the supplied object by tweening the opacity property.
 *
 * @param  tween    : Object
 * @param  scalar   : Number
 * @param  obj      : THREE.Mesh
 * @param  tween    : Object
 * @param  callback : function
 * 
 */
export const fadeObject = (tween, obj, scalar, duration, delay = 0, callback = null) => {
  new tween.Tween(obj.material)
      .to({ 
        opacity: scalar
      }, duration)
      .delay(delay)
      .easing(tween.Easing.Quadratic.InOut)
      .onUpdate(function() {
        renderer.render(scene, camera);
      })
      .onComplete(callback)
      .start();
}
