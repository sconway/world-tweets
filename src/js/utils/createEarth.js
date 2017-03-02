import THREE from "THREE";
import { growObject } from "../utils/tweens";

/**
 * Creates and adds the earth to the scene.
 *
 * @param     shape    : THREE.Geometry
 * @param     callback : function
 *
 */
export const createEarth = (shape, obj, tween, callback) => {
  // loads the earth images and once it is done, expands it
  let loader       = new THREE.TextureLoader(),
      texture      = loader.load("src/images/earth.png"),
      bumpTexture  = loader.load("src/images/earthbump.jpg"),
      specTexture  = loader.load("src/images/earthspec.jpg"),
      cloudTexture = loader.load("src/images/clouds.png", 
                                  growObject(tween, obj, 1, 2000, 500, callback));

  texture.wrapS      = texture.wrapT      = THREE.RepeatWrapping;
  bumpTexture.wrapS  = bumpTexture.wrapT  = THREE.RepeatWrapping;
  specTexture.wrapS  = specTexture.wrapT  = THREE.RepeatWrapping;
  cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;

  let earthMaterial = new THREE.MeshPhongMaterial({
        bumpMap:     bumpTexture,
        bumpScale:   0.005,
        depthWrite:  false,
        map:         texture,
        opacity:     0.99,
        shininess:   5,
        specular:    0xcccccc,
        specularMap: specTexture,
        transparent: true,
      }),
      cloudMaterial = new THREE.MeshPhongMaterial({
        depthWrite:  false,
        map:         cloudTexture,
        opacity:     0.5,
        transparent: true
      })

  let earth = new THREE.Mesh(shape, earthMaterial),
      cloud = new THREE.Mesh(shape, cloudMaterial);

  earth.name = "earth";
  cloud.name = "cloud";
  cloud.scale.set(1.02, 1.02, 1.02);

  return {
    "earth": earth,
    "cloud": cloud
  };
}
