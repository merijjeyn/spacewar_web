/*
BEWARE: Most of this file is imported from a Unity project with the help of chatgpt
and for a slightly different purpose. Take it with a grain of salt.
*/ 

import * as THREE from "three";
import { Queue, degToRad } from "./utils.js";

const activeLineCount = 50;

const curveWidth = 1; // Sanirim

const distBetweenParallelLines = 0.1;

const curveOpacity = 1;

const curvePointCount = 6;

const randDispRange = 0.013;

export class Curve {

    constructor(scene, curvePoints, angle) {
        if(scene == null) {
            throw new Error("Scene cannot be null");
        }

        this.scene = scene;
        this.curvePoints = curvePoints;
        this.angle = angle;

        this.lines = [];
        // this.lineCount = 1 + 2 * Math.floor(curveWidth / (2 * distBetweenParallelLines));
        this.lineCount = 3;
        for (var i = 0; i < this.lineCount; i++) {
            this.lines.push(new Line(scene));
        }
    }

    onFrame() {
        for (var i = 0; i < this.lines.length; i++) {
            var mid = Math.floor(this.lines.length / 2);
            var disp = (mid - i) * distBetweenParallelLines;
            
            var displacedPoints = [];
            for (var j = 0; j < this.curvePoints.length; j++) {
                // a multiplier that is 1 at the center and 0 at the edges
                var closenessToCenter = (mid - Math.abs(mid - j)) / mid;

                var dispVector = new THREE.Vector2(-disp * Math.sin(degToRad(this.angle)) * closenessToCenter,
                    disp * Math.cos(degToRad(this.angle)) * closenessToCenter);

                displacedPoints.push(this.curvePoints[j].clone().add(dispVector));
            }

            var widthMult = (mid - Math.abs(mid - i)) / mid + 0.1;
            this.lines[i].addLineRendererToActiveLines(displacedPoints, curveOpacity * widthMult * widthMult);
        }

        for (var i = 0; i < this.curvePoints.length; i++) {
            var mid = curvePointCount / 2;
            var closenessToCenter = (mid - Math.abs(mid - i)) / (mid * 3 / 4) + (1 / 4);

            var randRadius = randDispRange * closenessToCenter;
            var disp = Math.random() * 2 * randRadius - randRadius;
            var dispVector = new THREE.Vector2(-disp * Math.sin(degToRad(this.angle)),
                disp * Math.cos(degToRad(this.angle)));
            this.curvePoints[i].add(dispVector);
        }
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
        // const positionArray = new Float32Array(points.length * 3);
        const positionArray = [];
        for (let i = 0; i < points.length; i++) {
            // positionArray[i * 3] = points[i].x;
            // positionArray[i * 3 + 1] = points[i].y;
            // positionArray[i * 3 + 2] = 0; // assuming z=0 for 2D points

            positionArray.push(new THREE.Vector3(points[i].x, points[i].y, 0));
        }
        
        const cmrc = new THREE.CatmullRomCurve3(positionArray);

        const pnts = cmrc.getPoints(50);

        const geometry = new THREE.BufferGeometry().setFromPoints(pnts);
        // geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

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