import { Queue } from "./utils.js";
import { Line, Curve } from "./blackhole.js";
import * as THREE from "three";
import { QuadraticBezierCurve } from "three";

const keysDown = {};

export function setupControls(scene, ship1, ship2) {
    document.onkeydown = function(e) {
        switch (e.key) {
            case "w":
                if(!keysDown["w"]) {
                    ship1.fire();
                    keysDown["w"] = true;
                }

                // ============= DEBUG =============
                curve.onFrame();

                // ============= DEBUG =============
                break;
            case "s":
                keysDown["s"] = true;

                // ============= DEBUG =============

                // ============= DEBUG =============
                break;
            case "d":
                keysDown["d"] = true;
                break;
            case "a":
                keysDown["a"] = true;
                break;

            case "ArrowUp":
                if(!keysDown["ArrowUp"]) {
                    ship2.fire()
                    keysDown["ArrowUp"] = true;
                }
                break;
            case "ArrowDown":
                keysDown["ArrowDown"] = true;
                break;
            case "ArrowRight":
                keysDown["ArrowRight"] = true;
                break;
            case "ArrowLeft":
                keysDown["ArrowLeft"] = true;
                break;
        }
    }

    document.onkeyup = function(e) {
        switch (e.key) {
            case "w":
                keysDown["w"] = false;
                break;
            case "s":
                keysDown["s"] = false;
                break;
            case "d":
                keysDown["d"] = false;
                break;
            case "a":
                keysDown["a"] = false;
                break;

            case "ArrowUp":
                keysDown["ArrowUp"] = false;
                break;
            case "ArrowDown":
                keysDown["ArrowDown"] = false;
                break;
            case "ArrowRight":
                keysDown["ArrowRight"] = false;
                break;
            case "ArrowLeft":
                keysDown["ArrowLeft"] = false;
                break;

        }
    }
}

export function updateControls(ship1, ship2) {
    if (keysDown["s"]) {
        ship1.accelerate();
    }
    if (keysDown["d"]) {
        ship1.turnRight();
    }
    if (keysDown["a"]) {
        ship1.turnLeft();
    }

    if (keysDown["ArrowDown"]) {
        ship2.accelerate();
    }
    if (keysDown["ArrowRight"]) {
        ship2.turnRight();
    }
    if (keysDown["ArrowLeft"]) {
        ship2.turnLeft();
    }

}