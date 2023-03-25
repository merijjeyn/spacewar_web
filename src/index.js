import * as THREE from 'three';
import * as controls from './controls.js'
import Ship from './ship.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const ship1 = new Ship(new THREE.Vector2(0, 0));
const ship2 = new Ship(new THREE.Vector2(0, 0), 0x00ff00);
scene.add( ship1.getMesh(), ship2.getMesh() );

camera.position.z = 5;

controls.setupControls();

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );

	controls.updateControls(ship1, ship2);
	ship1.update();
	ship2.update();
}

animate();


