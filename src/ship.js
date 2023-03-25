import * as THREE from 'three';

// A ship class that can be moved around the screen and fire bullets
export default class Ship {
    constructor(position, color=0x55deff) {
        this.accConst = 0.0001;

        this.pos = position;
        this.dir = new THREE.Vector2(0, 1);
        this.vel = new THREE.Vector2();
        this.acc = new THREE.Vector2();
        this.maxSpeed = 0.02;
        this.friction = 0.005;
        this.turnSpeed = 0;

        const geometry = new THREE.ConeGeometry( 0.1, 0.3, 5 );
        const material = new THREE.MeshBasicMaterial( { color: color } );
        this.mesh = new THREE.Mesh( geometry, material );
    }

    getMesh() {
        return this.mesh;
    }

    update() {
        // Update the ship's position
        this.vel.add(this.acc);
        this.vel.clampLength(0, this.maxSpeed);
        this.pos.add(this.vel);
        this.mesh.position.set(this.pos.x, this.pos.y, 0);

        this.acc.set(0, 0);

        // Apply friction
        this.vel.multiplyScalar(1 - this.friction);

        // Update the ship's rotation
        this.dir.rotateAround(new THREE.Vector2(), -this.turnSpeed);
        this.mesh.rotation.z = this.dir.angle() - 1.5708;
        // Reset the turn speed, if we are still turning, it will be set again in controls.js
        this.turnSpeed = 0;
    }

    accelerate() {
        this.acc.addScaledVector(this.dir, this.accConst);
    }

    deccelerate() {
        this.acc.addScaledVector(this.dir, -this.accConst);
    }

    turnLeft() {
        this.turnSpeed = -0.01;
    }

    turnRight() {
        this.turnSpeed = 0.01;
    }

    fire() {
        // TODO
    }

}