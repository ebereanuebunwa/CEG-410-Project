export const SupportRotations = {
  fixed: 0,
  hinge: 1,
  roller: 1,
};

export class Node {
  private readonly x_coordinate: number;
  private readonly rotation_coefficient: number;
  private readonly support_type: string;
  private _rotation: number = 0;
  private _deflection: number;
  constructor(
    private x: number,
    private type: "fixed" | "hinge" | "roller",
    private d: number = 0
  ) {
    this.x_coordinate = x;
    this.rotation_coefficient = SupportRotations[type] as number;
    this.support_type = type;
    this._deflection = d;
  }

  get xCoordinate() {
    return this.x_coordinate;
  }

  get supportType() {
    return this.support_type;
  }

  get rotationCoefficient() {
    return this.rotation_coefficient;
  }

  get deflection() {
    return this._deflection;
  }

  get rotation() {
    return this._rotation || 0;
  }

  set rotation(r: number) {
    this._rotation = r;
  }
}
