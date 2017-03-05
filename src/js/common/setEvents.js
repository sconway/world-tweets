import THREE          from 'THREE';
import { debounce }   from './utils';
import { tweets }     from '../containers/App';
import { growObject } from "../utils/tweens";


export function setEvents(camera, items, type, wait, tween, 
                          onIntersection = null, onNoIntersection = null) {

  let raycaster        = new THREE.Raycaster(),
      intersected      = false,
      globeIntersected = false,
      hoveredObject    = null,
      hoveredMaterial  = null;

  let listener = function(event) {

    let mouse = {
      x:  ((event.clientX - 1) / window.innerWidth ) * 2 - 1,
      y: -((event.clientY - 1) / window.innerHeight) * 2 + 1
    };

    let cursor = {
      x: event.clientX,
      y: event.clientY
    }

    let vector = new THREE.Vector3();
    vector.set(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);

    raycaster.ray
      .set(camera.position, vector.sub(camera.position)
      .normalize());

    let target = raycaster.intersectObjects(items);

    // Were there any intersections?
    if (target.length) {
      globeIntersected = true;
      target[0].type   = type;
      target[0].object.dispatchEvent(target[0]);

      // Only run this function on the point objects.
      if (target[0].object.name === 'point') {

        // Make sure we only call this once, and the target has changed.
        if (target[0].object !== hoveredObject || !intersected) {

          // Change the previously hovered point's material back if it has one.
          if (hoveredObject && hoveredMaterial) {
            hoveredObject.material = hoveredMaterial;

            growObject(tween, hoveredObject, 1, 500);
          }

          // Save the material of the object for when we need to set it back
          hoveredMaterial = target[0].object.material;
          hoveredObject   = target[0].object;
          intersected     = true;

          // Set the material of the hovered object so we can see it.
          target[0].object.material = new THREE.MeshPhongMaterial({
                                        color:     0xff0000,
                                        shading:   THREE.FlatShading,
                                        shininess: 50
                                      });

          growObject(tween, target[0].object, 1.4, 500);
          onIntersection(target[0].object, cursor);
        }

      } else {

        // Make sure we only call this once, and there is a callback.
        if (intersected && onNoIntersection) {
          intersected            = false;
          hoveredObject.material = hoveredMaterial;

          growObject(tween, hoveredObject, 1, 500);
          onNoIntersection();
        }

      }

    } else {

      // Make sure we only call this once, and there is a callback.
      if (intersected && onNoIntersection) {
        intersected            = false;
        hoveredObject.material = hoveredMaterial;

        growObject(tween, hoveredObject, 1, 500);
        onNoIntersection();
      }

      // Make sure we only call this once, and there is a callback.
      if (globeIntersected && onNoIntersection) {
        globeIntersected = false;

        onNoIntersection();
      } 

    }

  };

  if (!wait) {
    document.addEventListener(type, listener, false);
  } else {
    document.addEventListener(type, debounce(listener, wait), false);
  }
}
