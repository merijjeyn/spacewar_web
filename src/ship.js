import * as THREE from 'three';

// A ship class that can be moved around the screen and fire bullets
export class Ship {
    static colliderSize = 0.15;

    constructor(position, color=0x55deff) {
        this.pos = position;
        this.dir = new THREE.Vector2(0, 1);
        this.vel = new THREE.Vector2();
        this.acc = new THREE.Vector2();
        
        this.accConst = 0.00001;
        this.maxSpeed = 0.015;
        this.friction = 0.005;
        this.turnSpeed = 0;
        this.health = 100;

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
        Bullet.spawnBullet(new THREE.Vector2(this.pos.x + this.dir.x/5, this.pos.y + this.dir.y/5), this.dir);
    }

    applyDamage(dmg) {
        this.health -= dmg;
        console.log(this.health)
        console.log("ship hit")
    }

    pullWithVector(pullVec) {
        this.acc.add(pullVec);
    }
}

export class Bullet {
    static bulletInstances = new Set();
    static scene;
    static ship1;
    static ship2;

    constructor(position, direction) {
        this.position = position;
        this.direction = direction;
        this.direction.normalize();
        this.speed = 0.004;

        // TODO: Change this to sprite
        // const map = new THREE.TextureLoader().load('../bullet.png');
        // const mat = new THREE.SpriteMaterial( { map: map } );
        // this.sprite = new THREE.Sprite( mat );
        const geometry = new THREE.ConeGeometry( 0.05, 0.1, 3 );
        const material = new THREE.MeshBasicMaterial( { color: 0x55deff } );
        this.sprite = new THREE.Mesh( geometry, material );
    }

    isOutOfBounds() {
        return (this.position.x > window.innerWidth/2 || 
                this.position.x < -window.innerWidth/2 || 
                this.position.y > window.innerHeight/2 || 
                this.position.y < -window.innerHeight/2)
    }

    static updateBullets() {
        // console.log("bulletInstances: ", this.bulletInstances);
        // console.log("scene children:", this.scene.children)

        const tbremoved = [];
        this.bulletInstances.forEach((bullet) => {
            bullet.position.addScaledVector(bullet.direction, bullet.speed);
            bullet.sprite.position.set(bullet.position.x, bullet.position.y, 0)
            
            if(bullet.isOutOfBounds()) {
                tbremoved.push(bullet);
            }
            
            if(dist(bullet.position, this.ship1.pos) < Ship.colliderSize) {
                this.ship1.applyDamage()
                tbremoved.push(bullet);
            }
            if(dist(bullet.position, this.ship2.pos) < Ship.colliderSize) {
                this.ship2.applyDamage(50)
                tbremoved.push(bullet);
            }
            
        })

        tbremoved.forEach((bullet) => {
            this.bulletInstances.delete(bullet);
            this.scene.remove(bullet.sprite);
        })
    }

    static spawnBullet(position, direction) {
        const bullet = new Bullet(position, direction.clone());
        this.bulletInstances.add(bullet);
        this.scene.add(bullet.sprite);
    }

    
}

//TODO remove this use a vector thing
function dist(pos1, pos2) {
    return ((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2)**0.5
}
