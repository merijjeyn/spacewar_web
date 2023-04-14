/*
BEWARE: Most of this file is imported from a Unity project with the help of chatgpt
and for a slightly different purpose. Take it with a grain of salt.
*/ 

import * as THREE from "three";
import { Queue, degToRad, curveOpacityDecreaseFunc } from "./utils.js";
import config from "./config.js";

const activeLineCount = 50;

const curveWidth = 1; // Sanirim

const distBetweenParallelLines = 0.25;

const curveOpacityStart = 1;

const randDispRange = 0.022;

const heightDisplacement = 0.1;

export function generateCurve(scene, center, angle, bulletCount) {
    //Calculate a curveLength based on the bulletCount
    const curveLength = Math.log(bulletCount + 2) / Math.log(2) * 0.6;
    const curvePointCount = Math.floor(curveLength / 0.2);

    var lengthBetweenPoints = curveLength / curvePointCount;
    var curvePoints = [];

    for (var i = -curvePointCount / 2; i < curvePointCount / 2; i++) {
        var xDisp = i * lengthBetweenPoints;
        var yDisp = Math.random() * (-heightDisplacement, heightDisplacement);

        var xRotated = xDisp * Math.cos(degToRad(angle)) - yDisp * Math.sin(degToRad(angle));
        var yRotated = yDisp * Math.cos(degToRad(angle)) + xDisp * Math.sin(degToRad(angle));

        var xFinal = xRotated + center.x;
        var yFinal = yRotated + center.y;

        curvePoints.push(new THREE.Vector2(xFinal, yFinal));
    }

    return new Curve(scene, curvePoints, angle);
}

export class Curve {
    static activeCurves = [];

    constructor(scene, curvePoints, angle) {
        if(scene == null) {
            throw new Error("Scene cannot be null");
        }

        this.scene = scene;
        this.curvePoints = curvePoints;
        this.angle = angle;

        this.frameAge = 0;
        this.curveOpacity = curveOpacityStart;

        this.lines = [];
        this.lineCount = 3 + 2 * Math.floor(this.curvePoints.length / 10);
        for (var i = 0; i < this.lineCount; i++) {
            this.lines.push(new Line(scene));
        }

        Curve.activeCurves.push(this);
    }

    static updateAllCurves() {
        const tbremoved = [];
        Curve.activeCurves.forEach((curve) => {
            if(!curve.onFrame()) {
                tbremoved.push(curve);
            }
        })

        tbremoved.forEach((curve) => {
            Curve.activeCurves.splice(Curve.activeCurves.indexOf(curve), 1);
        });
    }

    static removeAllCurves() {
        Curve.activeCurves.forEach((curve) => {
            curve.destroyLineRenderers();
        });

        Curve.activeCurves = [];
    }

    calculateDamageToShip(ship) {
        const dist = this.distanceToPoint(ship.pos);
        const dangerZone = this.lineCount * distBetweenParallelLines / 3; // the number 3 is by trial and error
        const damageMultiplier = config.riftDmg; // dmg per second

        if(dist < dangerZone) {
            return damageMultiplier * (dangerZone - dist) / dangerZone;
        }
        return 0;
    }

    distanceToPoint(point) {
        var minDist = Number.MAX_VALUE;
        for (var i = 0; i < this.curvePoints.length; i++) {
            var dist = this.curvePoints[i].distanceTo(point);
            if (dist < minDist) {
                minDist = dist;
            }
        }
        return minDist;
    }

    onFrame() {
        // render the curve
        for (var i = 0; i < this.lines.length; i++) {
            var mid = Math.floor(this.lines.length / 2);
            var disp = (mid - i) * distBetweenParallelLines;
            
            var displacedPoints = [];
            for (var j = 0; j < this.curvePoints.length; j++) {
                // a multiplier that is 1 at the center and 0 at the edges
                const lineMid = Math.floor(this.curvePoints.length / 2);
                var closenessToCenter = (lineMid - Math.abs(lineMid - j)) / lineMid;

                var dispVector = new THREE.Vector2(-disp * Math.sin(degToRad(this.angle)) * closenessToCenter,
                    disp * Math.cos(degToRad(this.angle)) * closenessToCenter);

                displacedPoints.push(this.curvePoints[j].clone().add(dispVector));
            }

            var widthMult = (mid - Math.abs(mid - i)) / mid + 0.15;
            this.lines[i].addLineRendererToActiveLines(displacedPoints, this.curveOpacity * widthMult);
        }

        // displace points
        for (var i = 0; i < this.curvePoints.length; i++) {
            var mid = this.curvePoints.length / 2;
            var closenessToCenter = (mid - Math.abs(mid - i)) / (mid * 3 / 4) + (1 / 4);

            var randRadius = randDispRange * closenessToCenter;
            var disp = Math.random() * 2 * randRadius - randRadius;
            var dispVector = new THREE.Vector2(-disp * Math.sin(degToRad(this.angle)),
                disp * Math.cos(degToRad(this.angle)));
            this.curvePoints[i].add(dispVector);
        }

        // Update age and opacity
        this.frameAge++;
        this.curveOpacity = curveOpacityDecreaseFunc(this.frameAge, this.curvePoints.length);
        if (this.curveOpacity <= 0.0001) {
            this.destroyLineRenderers();
            return false;
        }
        return true;
    }

    destroyLineRenderers() {
        for (var i = 0; i < this.lines.length; i++) {
            this.lines[i].destroyRemainingLines();
        }
    }
}

export class Line {
    constructor(scene) {
        if(scene == null) {
            throw new Error("Scene cannot be null");
        }

        this.activeLines = new Queue();
        this.scene = scene;
    }

    addLineRendererToActiveLines(points, alpha) {
        // Create the new line geometry
        const positionArray = [];
        for (let i = 0; i < points.length; i++) {
            positionArray.push(new THREE.Vector3(points[i].x, points[i].y, 0));
        }
        
        const cmrc = new THREE.CatmullRomCurve3(positionArray);
        const pnts = cmrc.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(pnts);

        // Create the new line material
        const material = new THREE.LineBasicMaterial({
            color: new THREE.Color(1, 1, 1),
            transparent: true,
            opacity: alpha
        });

        // Create the new line mesh
        const line = new THREE.Line(geometry, material);

        // Add the line to the scene or other container
        this.scene.add(line);

        // Manage active lines
        this.activeLines.enqueue(line);
        if (this.activeLines.size() > activeLineCount) {
            const lineToRemove = this.activeLines.dequeue();
            this.scene.remove(lineToRemove);
        }
    }

    destroyRemainingLines() {
        this.activeLines.items.forEach(line => {
            line.geometry.dispose();
            line.material.dispose();
            this.scene.remove(line);
        });
        this.activeLines.clear();
    }
}