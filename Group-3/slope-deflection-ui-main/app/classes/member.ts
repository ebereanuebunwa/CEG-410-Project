import { Node } from "./node";

export class Member {
  private _fem_near_far: number = 0;
  private _fem_far_near: number = 0;

  constructor(
    private _length: number,
    private _start_node: Node,
    private _end_node: Node,
    private _ei: number = 0,
    private e_: number = 0,
    private i_: number = 0
  ) {
    this._length = _length;
    this._ei = _ei || e_ * i_;
    this._start_node = _start_node;
    this._end_node = _end_node;
  }

  get length() {
    return this._length;
  }

  get ei() {
    return this._ei;
  }

  get startNode() {
    return this._start_node;
  }

  get endNode() {
    return this._end_node;
  }

  get start() {
    return this._start_node.xCoordinate;
  }

  get end() {
    return this._end_node.xCoordinate;
  }

  get femNearFar() {
    return this._fem_near_far;
  }

  get femFarNear() {
    return this._fem_far_near;
  }

  get rotationCoefficient() {
    return this._start_node.rotationCoefficient;
  }

  set femNearFar(f: number) {
    this._fem_near_far = f;
  }

  set femFarNear(f: number) {
    this._fem_far_near = f;
  }

  get moments() {
    const m1 =
      this.femNearFar +
      (this.ei / this.length) *
        (2 * this.startNode.rotation + this.endNode.rotation);
    const m2 =
      this.femFarNear +
      (this.ei / this.length) *
        (this.startNode.rotation + 2 * this.endNode.rotation);
    return [m1, m2];
  }

  get toString() {
    return `Member: ${this.startNode.xCoordinate} -> ${this.endNode.xCoordinate},
    Length: ${this.length}, EI: ${this.ei}, FEMa: ${this.femNearFar}, FEMb: ${this.femFarNear}, 
    Node A Rotation: ${this.startNode.rotation}, Node B Rotation: ${this.endNode.rotation}, 
    1st Moment: ${this.moments[0]}, 2nd Moment: ${this.moments[1]}`;
  }
}
