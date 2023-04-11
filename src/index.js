import * as THREE from 'three';
import * as controls from './controls.js'
import { Ship, Bullet } from './ship.js'
import { Sun } from './sun.js';

import { Curve } from './awesomeRift.js';
import cnf from './config.js';
import config from './config.js';

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});
// Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
let value = params.DEBUG;


if(value != "true") {
	const body = document.querySelector("body");
	// const menu = document.getElementById("menu");
	body.style.display = "none";
} else {
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


	if(config.DEBUG) {
		// create a new grid helper
		const size = 10;
		const divisions = 10;
		const colorCenterLine = 0x444444;
		const colorGrid = 0x22222;
		const gridHelper = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
		gridHelper.rotateX(Math.PI/2);
		
		// add the grid to the scene
		scene.add(gridHelper);
	}


	const healthBar1 = document.getElementById("health-bar-1");
	const healthBar2 = document.getElementById("health-bar-2");

	const ship1 = new Ship(pos1, scene, healthBar1, 0xfa5a5a, 'assets/ship1.png');
	const ship2 = new Ship(pos2, scene, healthBar2, 0x940101, 'assets/ship2.png');
	const sun = new Sun(ship1, ship2, scene, );

	// pass the reference of the scene to the bullet class since we spawn and remove bullet sprites
	Bullet.scene = scene;
	Bullet.ship1 = ship1;
	Bullet.ship2 = ship2;

	camera.position.z = 5;

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

	var player1Wins = 0;
	var player2Wins = 0;
	const isGameFinished = () => {
		if(ship2.health <= 0) {
			player1Wins++;
			document.getElementById("score-1").innerHTML = player1Wins;
			alert("Player 1 wins!");
		} else if(ship1.health <= 0) {
			player2Wins++;
			document.getElementById("score-2").innerHTML = player2Wins;
			alert("Player 2 wins!");
		} else {
			return;
		}

		restartGame();
		togglePause();
	}

	controls.setupControls(scene, ship1, ship2, togglePause, restartGame);

	function animate() {
		Curve.updateAllCurves();
		TWEEN.update();

		renderer.render( scene, camera );
		
		controls.updateControls(ship1, ship2);
		sun.update();
		ship1.update(camera);
		ship2.update();
		Bullet.updateBullets();

		isGameFinished();

		if(isAnimating) {
			requestAnimationFrame( animate );
		}
	}

	animate();
}


