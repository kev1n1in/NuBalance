// rough-viz.d.ts
declare module "rough-viz" {
  interface BaseOptions {
    element: string | HTMLElement;
    data: string; // URL to CSV or raw data string
    title?: string;
    width?: number;
    height?: number;
    roughness?: number;
    stroke?: string;
    strokeWidth?: number;
    bowing?: number;
    simplification?: number;
    fillStyle?: string;
    fillWeight?: number;
    curveFitting?: number;
    curveStepCount?: number;
    fill?: string;
    highlight?: string;
    font?: string;
    margin?: { top: number; bottom: number; left: number; right: number };
    axisFontSize?: string;
    axisRoughness?: number;
    axisStrokeWidth?: number;
  }

  interface LineOptions extends BaseOptions {
    x: string;
    y: string;
  }

  export class Line {
    constructor(options: LineOptions);
  }

  export class Bar {
    constructor(options: BaseOptions);
  }

  export class Pie {
    constructor(options: BaseOptions);
  }

  export class Donut {
    constructor(options: BaseOptions);
  }

  export class Scatter {
    constructor(options: BaseOptions);
  }

  export class StackedBar {
    constructor(options: BaseOptions);
  }

  export class HorizontalBar {
    constructor(options: BaseOptions);
  }
}
