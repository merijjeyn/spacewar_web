import * as THREE from 'three';
import { Vector3 } from 'three';

import { Curve, generateCurve } from './awesomeRift.js';
import config from './config.js';
import { dist } from './utils.js';

// A ship class that can be moved around the screen and fire bullets
export class Ship {
    static colliderSize = 0.1;

    constructor(position, scene, healthBar, color=0x55deff, shipAsset) {
        this.initPos = position.clone();
        this.pos = position;
        this.scene = scene;
        this.healthBar = healthBar;

        this.dir = new THREE.Vector2(0, 1);
        this.vel = new THREE.Vector2();
        this.acc = new THREE.Vector2();
        this.turnSpeed = 0; // radians per second
        
        // Constants
        this.accConst = config.shipAcc; // unit^2 per second
        this.maxSpeed = config.shipMaxSpeed; // unit per second
        this.friction = 0.01;
        this.health = 100;
        this.fireRate = config.fireRate; // second
        
        this.fireRateCounter = 0;

        const texture = new THREE.TextureLoader().load(shipAsset);
        const material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff, transparent: true, alphaTest: 0.5});
        this.mesh = new THREE.Sprite(material);
        this.scene.add(this.mesh);
        this.mesh.scale.set(0.15, 0.2, 0.2);

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

    update(delta, camera) {
        // Update the ship's position
        this.vel.add(this.acc); 
        this.acc.set(0, 0);
        this.vel.clampLength(0, this.maxSpeed);

        this.pos.add(this.vel.clone().multiplyScalar(delta));
        
        this.mesh.position.set(this.pos.x, this.pos.y, 0);
        this.fireRateCounter -= delta;
        this.confineWalls(camera);

        // Apply friction
        this.vel.multiplyScalar(1 - this.friction);

        // Update the ship's rotation
        this.dir.rotateAround(new THREE.Vector2(), -this.turnSpeed * delta);
        this.mesh.material.rotation = this.dir.angle() - 1.5708;

        // Reset the turn speed, if we are still turning, it will be set again in controls.js
        this.turnSpeed = 0;
        this.frameCounter++;

        // Calculate damage from rifts
        Curve.activeCurves.forEach((curve) => {
            const dmg = curve.calculateDamageToShip(this);
            if(dmg > 0) {
                this.applyDamage(dmg * delta);
            }
        });

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
        this.turnSpeed = -config.shipTurnSpeed;
    }

    turnRight() {
        this.turnSpeed = config.shipTurnSpeed;
    }

    fire() {
        if (this.fireRateCounter > 0 && !config.DEBUG) {
            return;
        }
        this.fireRateCounter = this.fireRate;

        Bullet.spawnBullet(this, new THREE.Vector2(this.pos.x + this.dir.x/5, this.pos.y + this.dir.y/5), this.dir);
    }

    applyDamage(dmg) {
        this.health -= dmg;
        this.healthBar.style.width = `${this.health}%`;
        this.healthBar.parentElement.classList.add('shake');
        setTimeout(() => {
            this.healthBar.parentElement.classList.remove('shake');
        }
        , 200);
    }

    pullWithVector(pullVec) {
        this.acc.add(pullVec);
    }

    restart() {
        this.pos = this.initPos.clone();
        this.dir = new THREE.Vector2(0, 1);
        this.vel = new THREE.Vector2();
        this.acc = new THREE.Vector2();
        this.health = 100;
    }

    tearRiftWithBullets() {
        Bullet.tearRiftWithBullets(this.scene, this);
    }
}

export class Bullet {
    static bulletInstances = new Set();
    static scene;
    static ship1;
    static ship2;

    constructor(owner, position, direction) {
        this.position = position;
        this.direction = direction;
        this.owner = owner;
        this.direction.normalize();
        this.speed = config.bulletSpeed;
        this.isGettingPulled = false;

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

    static tearRiftWithBullets(scene, owner) {
        const enemy = owner == Bullet.ship1 ? Bullet.ship2 : Bullet.ship1;
        
        // Find the closest bullet to the enemy
        let closestBullet = null;
        let closestDist = Infinity;
        this.bulletInstances.forEach((bullet) => {
            if(bullet.owner == owner) {
                const d = dist(bullet.position, enemy.pos);
                if(d < closestDist) {
                    closestBullet = bullet;
                    closestDist = d;
                }
            }
        });

        if(closestBullet) {
            // Pull bullets towards the closest bullet
            const ownerBullets = [];
            this.bulletInstances.forEach((bullet) => {
                if(bullet.owner == owner) {
                    ownerBullets.push(bullet);
                }
            });

            ownerBullets.forEach((bullet) => {
                bullet.isGettingPulled = true;
                const startPos = bullet.position.clone();
                const endPos = closestBullet.position.clone();
                
                const animationTime = ownerBullets.length == 1 ? 0 : 500;
                const tween = new TWEEN.Tween(startPos)
                    .to(endPos, animationTime)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(() => {
                        bullet.position = startPos;
                        // bullet.sprite.position.set(bullet.position.x, bullet.position.y, 0)
                    })
                    .start();
                
                tween.onComplete(() => {
                    // Generate the curve and pull the enemy when the animation completes (for only one of the bullets)
                    if(bullet == closestBullet) {
                        const angle = Math.atan2(enemy.pos.y - closestBullet.position.y, enemy.pos.x - closestBullet.position.x);
                        generateCurve(scene, closestBullet.position, angle, ownerBullets.length);

                        // Might be better to move this to the Curve initialization
                        const dist = closestBullet.position.distanceTo(enemy.pos);
                        const pullForce = 0.004 * Math.log(ownerBullets.length + 2) / Math.log(dist + 2);
                        enemy.pullWithVector(new THREE.Vector2(Math.cos(angle), Math.sin(angle)).multiplyScalar(-pullForce));
                    }

                    bullet.isGettingPulled = false;
                    
                    // Remove the bullet (We should be good to remove here since before reaching this line, all the bullets will have been processed)
                    this.bulletInstances.delete(bullet);
                    this.scene.remove(bullet.sprite);
                });
            })
        }
    }

    static pullBulletsTowards(bullets, pos) {
        bullets.forEach((bullet) => {
            bullet.isGettingPulled = true;
            const startPos = bullet.position.clone();
            const endPos = pos.clone();

            const tween = new TWEEN.Tween(startPos)
                .to(endPos, 500)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                    bullet.position = startPos;
                    // bullet.sprite.position.set(bullet.position.x, bullet.position.y, 0)
                })
                .start();
            
            tween.onComplete(() => {
                bullet.isGettingPulled = false;
            });
        })
    }
            

    static updateBullets(delta) {
        const tbremoved = [];
        this.bulletInstances.forEach((bullet) => {
            if(!bullet.isGettingPulled) {
                bullet.position.addScaledVector(bullet.direction, bullet.speed * delta);
            }
            bullet.sprite.position.set(bullet.position.x, bullet.position.y, 0)
            
            if(bullet.isOutOfBounds()) {
                tbremoved.push(bullet);
            }
            
            if(dist(bullet.position, this.ship1.pos) < Ship.colliderSize) {
                this.ship1.applyDamage(config.bulletDamage);
                tbremoved.push(bullet);
            }
            if(dist(bullet.position, this.ship2.pos) < Ship.colliderSize) {
                this.ship2.applyDamage(config.bulletDamage);
                tbremoved.push(bullet);
            }
            
        })

        tbremoved.forEach((bullet) => {
            this.bulletInstances.delete(bullet);
            this.scene.remove(bullet.sprite);
        })
    }

    static spawnBullet(owner, position, direction) {
        const bullet = new Bullet(owner, position, direction.clone());
        this.bulletInstances.add(bullet);
        this.scene.add(bullet.sprite);
    }

    static destroyAllBullets() {
        this.bulletInstances.forEach((bullet) => {
            this.scene.remove(bullet.sprite);
        })
        this.bulletInstances.clear();
    }

    
}