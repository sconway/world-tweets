import THREE                from 'THREE';
import { scene, camera, renderer }    from '../common/scene';
import { latLongToVector3 } from '../common/utils';
import { growObject } from "../utils/tweens";
import { createGlowMaterial } from "../utils/createGlowMaterial";

export var pointList = [];

/**
 * Creates and returns a triangular mesh to simulate a point on the map.
 * Sets the position based on the supplied longitude and latitude.
 *
 * @param     lat     : number  (2d longitude)
 * @param     lon     : number  (2d latitude)
 * @param     radius  : number  (radius of the globe)
 * @param     size    : number  (size of the point base)
 * @param     height  : number  (distance from the globe)
 * @param     color   : hex     (color of the point )
 * @param     points  : object  (contains all the points)
 * @param     tween   : object  (tween object)
 *
 */
export const createPoint = (lat, long, radius, size, height, color, points, tween) => {
  let geometry = new THREE.CylinderGeometry( size, 0, size * 4, 8, 1 ),
      material = new THREE.MeshPhongMaterial({ 
        color:   color,
        shading: THREE.SmoothShading,
        shininess: 10,
      }),
      mesh     = new THREE.Mesh(geometry, material),
      vector   = latLongToVector3(lat, long, radius, height);

  // Direct the point to face sideways
  geometry.rotateX( - Math.PI / 2 );
  
  // Set the mesh position and shrink it so we can expand it.
  mesh.position.set(vector.x, vector.y, vector.z);
  mesh.scale.set(0.1, 0.1, 0.1);

  mesh.name = 'point';

  // Set the mesh to point towards the center of the scene
  mesh.lookAt(scene.position);

  points.add(mesh);
  pointList.push(mesh);

  // Animate the growth once it is added.
  growObject(tween, mesh, 1, 500);
}
