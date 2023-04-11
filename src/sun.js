import * as THREE from 'three';
import cnf from './config.js';


export class Sun {
    constructor(ship1, ship2, scene, pos=new THREE.Vector2(0, 0)) {
        this.pos = pos
        this.rad = 1; // This is hardcoded for now because it was hard to calculate the radius from the animation itself :D
        
        this.ship1 = ship1;
        this.ship2 = ship2;
        this.scene = scene;

        this.renderer = new SunRenderer(this, this.scene);
    }

    getMesh() {
        return this.mesh;
    }

    update() {
        this.renderer.update();

        if(dist(this.ship1.pos, this.pos) < this.rad) {
            this.ship1.applyDamage(1); // it is this low because it happens every frame like burning
        }
        if(dist(this.ship2.pos, this.pos) < this.rad) {
            this.ship2.applyDamage(1); // it is this low because it happens every frame like burning
        }

        this.ship1.pullWithVector(this.gravityFunc(this.ship1.pos.clone()));
        this.ship2.pullWithVector(this.gravityFunc(this.ship2.pos.clone()));
    }

    gravityFunc(pos) {
        if(cnf.DEBUG) {
            return new THREE.Vector2(0, 0);
        }

        const dir = pos.negate().normalize();
        const skewed = new THREE.Vector3(dir.x, dir.y, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI/4);
        return new THREE.Vector2(skewed.x * 0.00002, skewed.y * 0.00002);
    }
}

class SunRenderer {
    constructor(sun, scene) {
        this.sun = sun;
        this.scene = scene;
        this.generateLines();
    }

    // A function that generates a bunch of lines that form a circle
    generateLines() {
        this.lines = [];
        for(var i = 0; i < cnf.sunLineCount; i++) {
            this.lines.push(new Line(this.scene));
        }
    }

    update() {
        this.lines.forEach(el => {
            el.update();
        });
    }
}

class Line {
    opacityIncSpeed = 0.01;

    constructor(scene) {
        this.scene = scene;
        this.lineMesh = this.createLineMesh();
        this.scene.add(this.lineMesh);

        this.lineMesh.material.opacity = Math.random() * 0.6;
        this.opacityInc = Math.random() < 0.5 ? true : false;
    }

    createLineMesh() { 
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });

        const distToCenter = Math.abs(gaussianRandom(0.5, 0.13));
        const length = Math.min(Math.abs(gaussianRandom(Math.sqrt(distToCenter), 0.05))/15, 0.3);
        const angle = Math.random() * 2 * Math.PI;
        const skewAngle = gaussianRandom(0.05, 0.005);

        const points = []
        points.push(new THREE.Vector3(distToCenter * Math.cos(angle), distToCenter * Math.sin(angle), 1));
        points.push(new THREE.Vector3((distToCenter + length) * Math.cos(angle + skewAngle), (distToCenter + length) * Math.sin(angle + skewAngle), 1));
        const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );

        return new THREE.Line(lineGeometry, lineMaterial);
    }


    update() {
        this.lineMesh.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.01));
        this.lineMesh.geometry.applyMatrix4(new THREE.Matrix4().makeRotationZ(-0.001));
        
        if(this.opacityInc) {
            this.lineMesh.material.opacity += Math.random() * 2 * this.opacityIncSpeed;
            if (this.lineMesh.material.opacity > 0.6) {
                this.opacityInc = false;
            }
        } else {
            this.lineMesh.material.opacity -= Math.random() * 2 * this.opacityIncSpeed;
        }

        if (this.lineMesh.material.opacity < 0.05) { 
                this.lineMesh.geometry.dispose();
                this.lineMesh.material.dispose();
                this.scene.remove(this.lineMesh);
                
                // Create a new line in place of it
                this.lineMesh = this.createLineMesh();
                this.scene.add(this.lineMesh);
                this.opacityInc = true;
        }
    }

}


//TODO: remove this use a vector thing
function dist(pos1, pos2) {
    return ((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2)**0.5
}

function gaussianRandom(mean=0, stdev=1) {
    let u = 1 - Math.random(); // Converting [0,1) to (0,1]
    let v = Math.random();
    let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}