import * as THREE from 'three';
import * as controls from './controls.js'
import { Ship, Bullet } from './ship.js'
import { Sun } from './sun.js';

import { Curve } from './blackhole.js';
import cnf from './config.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
ambientLight.intensity = 0.5;
scene.add(ambientLight);

var pos1, pos2;
if(cnf.DEBUG) {
	pos1 = new THREE.Vector3(0, 2, 0);
	pos2 = new THREE.Vector3(-2, 2, 0);
} else {
	pos1 = new THREE.Vector3(2, -2, 0);
	pos2 = new THREE.Vector3(-2, 2, 0);
}

const ship1 = new Ship(pos1, scene, 0xfa5a5a);
const ship2 = new Ship(pos2, scene, 0x940101);
const sun = new Sun(ship1, ship2, scene);

// pass the reference of the scene to the bullet class since we spawn and remove bullet sprites
Bullet.scene = scene;
Bullet.ship1 = ship1;
Bullet.ship2 = ship2;

camera.position.z = 5;

// ===================== DEBUG =====================

// const curve = new Curve(scene, [
// 	new THREE.Vector2(1, 0), 
// 	new THREE.Vector2(1.1, 0.1), 
// 	new THREE.Vector2(1.2, 0), 
// 	new THREE.Vector2(1.3, 0.1),
// 	new THREE.Vector2(1.4, 0),
// 	new THREE.Vector2(1.5, 0.1),
// ],
// 0);

var isAnimating = false;
var isRestarted = false;

const restartGame = () => {
	isRestarted = true;
	ship1.restart();
	ship2.restart();
	Bullet.destroyAllBullets();
}

const togglePause = () => {
	isAnimating = !isAnimating;
	const menu = document.getElementById("menu");
	menu.style.display = isAnimating ? "none" : "flex";
	if(isAnimating) { // if we are resuming the game
		animate();
	}
}

controls.setupControls(scene, ship1, ship2, togglePause, restartGame);

function animate() {
	// curve.onFrame();
	renderer.render( scene, camera );
	
	controls.updateControls(ship1, ship2);
	sun.update();
	ship1.update(camera);
	ship2.update();
	Bullet.updateBullets();

	if(isAnimating) {
		requestAnimationFrame( animate );
	}
}

animate();


