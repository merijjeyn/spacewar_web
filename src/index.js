import * as THREE from 'three';
import * as controls from './controls.js'
import { Ship, Bullet } from './ship.js'
import { Sun } from './sun.js';

import { Curve } from './blackhole.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
ambientLight.intensity = 0.5;
scene.add(ambientLight);

const ship1 = new Ship(new THREE.Vector3(2, -2, 0), scene, 0xfa5a5a);
const ship2 = new Ship(new THREE.Vector3(-2, 2, 0), scene, 0x940101);
const sun = new Sun(ship1, ship2, scene);

// pass the reference of the scene to the bullet class since we spawn and remove bullet sprites
Bullet.scene = scene;
Bullet.ship1 = ship1;
Bullet.ship2 = ship2;

camera.position.z = 5;

controls.setupControls(scene, ship1, ship2);

const frustum = new THREE.Frustum();
frustum.set

// ===================== DEBUG =====================

const curve = new Curve(scene, [
	new THREE.Vector2(1, 0), 
	new THREE.Vector2(1.1, 0.1), 
	new THREE.Vector2(1.2, 0), 
	new THREE.Vector2(1.3, 0.1),
	new THREE.Vector2(1.4, 0),
	new THREE.Vector2(1.5, 0.1),
],
0);

function animate() {

	curve.onFrame();
	// ===================== DEBUG =====================
	requestAnimationFrame( animate );
	renderer.render( scene, camera );

	controls.updateControls(ship1, ship2);
	sun.update();
	ship1.update(camera);
	ship2.update();
	Bullet.updateBullets();

	// camera.updateMatrix();
	// camera.updateMatrixWorld();
	// frustum.setFromProjectionMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );	
}

animate();


