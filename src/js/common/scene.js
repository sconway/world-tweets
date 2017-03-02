import THREE from 'THREE';
import d3 from 'd3';


export var canvas = d3.select("#three-container").append("canvas")
  .attr("width", window.innerWidth)
  .attr("height", window.innerHeight);

canvas.node().getContext("webgl");

export var renderer = new THREE.WebGLRenderer({
	alpha: true,
	antialias: true,
	canvas: canvas.node()
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor( 0x333333, 0 );
document.getElementById("three-container").appendChild(renderer.domElement);

export var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.z = 1000;

export var scene = new THREE.Scene();

export var light = new THREE.HemisphereLight('#ffffff', '#666666', 1);
light.position.set(0, 1000, 0);
scene.add(light);

export var spotLight = new THREE.SpotLight('#ffffff', 5, 1500);
spotLight.position.set(600, 600, 200);
scene.add(spotLight);

export var light2 = new THREE.AmbientLight('#000000');
scene.add(light2);

export var pLight = new THREE.PointLight( 0xffffff, 2, 1000 );
pLight.position.set( 0, 0, 0 );
scene.add( pLight );

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
