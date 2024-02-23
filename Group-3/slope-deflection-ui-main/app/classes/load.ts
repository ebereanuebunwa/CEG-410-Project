export class UniformlyDistributedLoad {
  constructor(private _magnitude: number, private start_end: number[]) {
    this._magnitude = _magnitude;
    this.start_end = start_end;
  }
}

export class PointLoad {
  constructor(private _magnitude: number, private _position: number) {
    this._magnitude = _magnitude;
    this._position = _position;
  }
}
