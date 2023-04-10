export function dist(pos1, pos2) {
  return ((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2)**0.5
}

export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

export function curveOpacityDecreaseFunc(frameAge, pointCount) {
    const baseDecrease = Math.log(frameAge * 0.006 + 1) / Math.log(8);
    const pointCountDecrease = Math.log(4) / Math.log(pointCount * 4 + 4);

    return (1 - baseDecrease * pointCountDecrease * 2.5);
}

export class Queue {
    constructor() {
      this.items = [];
    }
  
    // Add an element to the end of the queue
    enqueue(element) {
      this.items.push(element);
    }
  
    // Remove the element from the front of the queue and return it
    dequeue() {
      if (this.isEmpty()) {
        return null;
      }
      return this.items.shift();
    }
  
    // Check if the queue is empty
    isEmpty() {
      return this.items.length === 0;
    }
  
    // Get the number of elements in the queue
    size() {
      return this.items.length;
    }
  
    // Peek at the element at the front of the queue without removing it
    front() {
      if (this.isEmpty()) {
        return null;
      }
      return this.items[0];
    }
  
    // Clear all elements from the queue
    clear() {
      this.items = [];
    }
}