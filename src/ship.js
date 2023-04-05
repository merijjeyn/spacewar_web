import * as THREE from 'three';

// A ship class that can be moved around the screen and fire bullets
export class Ship {
    static colliderSize = 0.1;

    constructor(position, scene, color=0x55deff) {
        this.pos = position;
        this.scene = scene;

        this.dir = new THREE.Vector2(0, 1);
        this.vel = new THREE.Vector2();
        this.acc = new THREE.Vector2();
        
        this.accConst = 0.0001;
        this.maxSpeed = 0.05;
        this.friction = 0.01;
        this.turnSpeed = 0;
        this.health = 100;

        const geometry = new THREE.ConeGeometry( 0.05, 0.15, 8 );
        const material = new THREE.MeshBasicMaterial( { color: color } );
        this.mesh = new THREE.Mesh( geometry, material );
        this.scene.add(this.mesh);

        this.burnerParticles = [];
        this.frameCounter = 0;
    }

    getMesh() {
        return this.mesh;
    }

    confineWalls(camera) {
        if (camera == null) {
            return;
        }

        let bound = new THREE.Vector3();
        bound = bound.setFromMatrixPosition(this.mesh.matrixWorld);
        bound.project(camera);

        if (bound.x > 1.05) {
            this.pos.x = -this.pos.x + 0.1;
        } else if (bound.x < -1.05) {
            this.pos.x = -this.pos.x - 0.1;
        }

        if (bound.y > 1.05) {
            this.pos.y = -this.pos.y + 0.1;
        } else if (bound.y < -1.05) {
            this.pos.y = -this.pos.y - 0.1;
        }
    }

    update(camera) {
        // Update the ship's position
        this.vel.add(this.acc);
        this.vel.clampLength(0, this.maxSpeed);
        this.pos.add(this.vel);
        this.confineWalls(camera);
        this.mesh.position.set(this.pos.x, this.pos.y, 0);

        this.acc.set(0, 0);

        // Apply friction
        this.vel.multiplyScalar(1 - this.friction);

        // Update the ship's rotation
        this.dir.rotateAround(new THREE.Vector2(), -this.turnSpeed);
        this.mesh.rotation.z = this.dir.angle() - 1.5708;
        // Reset the turn speed, if we are still turning, it will be set again in controls.js
        this.turnSpeed = 0;
        this.frameCounter++;

        // Update the opacity of the particles and remove them if they are too transparent
        const tbremoved = [];
        this.burnerParticles.forEach((particle) => {
            particle.material.opacity *= 0.95;
            if (particle.material.opacity <= 0.05) {
                tbremoved.push(particle);
            }
        });

        tbremoved.forEach((particle) => {
            particle.geometry.dispose();
            particle.material.dispose();
            this.scene.remove(particle);
            this.burnerParticles.splice(this.burnerParticles.indexOf(particle), 1);
        });
    }

    accelerate() {
        this.acc.addScaledVector(this.dir, this.accConst);

        // Every 5 frames, spawn a line and add it to the burnerParticles array
        if (this.frameCounter % 1 == 0) {
            const startDir = this.dir.clone().applyMatrix3(new THREE.Matrix3().makeRotation( Math.random() * Math.PI/10 - Math.PI/20 ));
            const endDir = this.dir.clone().applyMatrix3(new THREE.Matrix3().makeRotation( Math.random() * Math.PI/8 - Math.PI/16 ));
            const lengthDivider = Math.random() * 2 + 6;

            const geometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(this.pos.x - startDir.x/16, this.pos.y - startDir.y/16, 0),
                    new THREE.Vector3(this.pos.x - endDir.x/lengthDivider, this.pos.y - endDir.y/lengthDivider, 0)
            ])
            const material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: Math.random()/2 + 0.5, transparent: true } );
            const line = new THREE.Line( geometry, material );

            this.burnerParticles.push(line);
            this.scene.add(line);
        }
    }

    deccelerate() {
        this.acc.addScaledVector(this.dir, -this.accConst);
    }

    turnLeft() {
        this.turnSpeed = -0.03;
    }

    turnRight() {
        this.turnSpeed = 0.03;
    }

    fire() {
        Bullet.spawnBullet(new THREE.Vector2(this.pos.x + this.dir.x/5, this.pos.y + this.dir.y/5), this.dir);
    }

    applyDamage(dmg) {
        this.health -= dmg;
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
        this.speed = 0.02;

        const texture = new THREE.TextureLoader().load('assets/bullet.png');
        const material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff, transparent: true, alphaTest: 0.5, rotation: this.direction.angle() - Math.PI/2 });
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(0.3, 0.3, 0.3);
    }

    isOutOfBounds() {
        // Do some safe assumption for now to not do the whole matrix multiplication
        const width = 10;
        const height = 10;
        return (this.position.x > width || 
                this.position.x < -width || 
                this.position.y > height || 
                this.position.y < -height)
    }

    static updateBullets() {
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
