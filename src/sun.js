import * as THREE from 'three';


export class Sun {
    constructor(ship1, ship2, pos=new THREE.Vector2(0, 0)) {
        this.pos = pos
        this.rad = 0.3;
        
        this.ship1 = ship1;
        this.ship2 = ship2;

        const geometry = new THREE.TorusGeometry(this.rad);
        const material = new THREE.MeshBasicMaterial( { color: 0x454545 } );
        this.mesh = new THREE.Mesh(geometry, material);
    }

    getMesh() {
        return this.mesh;
    }

    update() {
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
        const dir = pos.negate().normalize();
        return new THREE.Vector2(dir.x * 0.000005, dir.y * 0.000005);
    }
}


//TODO: remove this use a vector thing
function dist(pos1, pos2) {
    return ((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2)**0.5
}