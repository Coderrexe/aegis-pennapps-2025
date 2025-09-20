export interface Point {
  x: number;
  y: number;
  z: number;
  originalX: number;
  originalY: number;
  originalZ: number;
  color: string;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  scale: number;
  color: string;
}
