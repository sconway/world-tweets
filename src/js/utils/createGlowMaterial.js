import THREE     from "THREE";
import {camera } from "../common/scene";


/**
 * Creates and returns a material with a glowing effect.
 *
 * @param     color : hex
 *
 */
export const createGlowMaterial = (color) => {
      return new THREE.ShaderMaterial({
                uniforms: 
                { 
                    "c":   { type: "f", value: 1.0 },
                    "p":   { type: "f", value: 1.0 },
                    glowColor: { type: "c", value: new THREE.Color( color ) },
                    viewVector: { type: "v3", value: camera.position }
                },
                vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
                fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                // wireframe: true
            });
      // return new THREE.ShaderMaterial( {
      //             uniforms:       {
      //                               amplitude: { value: 5.0 },
      //                               opacity:   { value: 0.3 },
      //                               color:     { value: new THREE.Color( 0xff0000 ) }
      //                             },
      //             vertexShader:   document.getElementById( 'vertexshader' ).textContent,
      //             fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
      //             blending:       THREE.AdditiveBlending,
      //             // depthTest:      false,
      //             // transparent:    true
      //           });
}


