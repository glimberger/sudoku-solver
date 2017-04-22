export class Constraints {

  private _matrix: any;

  constructor(
    private cells: Array<any>,
    private gridSize: number
  ) {
    this.buildMatrix();
  }

  private buildMatrix()
  {
    this.matrix = this.cells.map(cell => this.buildMatrixRow(cell));
  }

  private buildMatrixRow(cell): Array<number>
  {
    const boxSize = Math.sqrt(this.gridSize); // 3 for a regular Sudoku
    const rowColToBox = (row, col) => Math.floor(row - (row % boxSize) + (col / boxSize));

    const {row, col} = cell.coords;
    const value = cell.value;

    const positionConstraints = this.encodeMatrixRow(row, col);
    const rowConstraints = this.encodeMatrixRow(row, value - 1);
    const colConstraints = this.encodeMatrixRow(col, value - 1);
    const boxConstraints = this.encodeMatrixRow(rowColToBox(row, col), value - 1);

    return positionConstraints.concat(rowConstraints, colConstraints, boxConstraints);
  }

  private encodeMatrixRow(major, minor): Array<number>
  {
    const result = Array(this.gridSize * this.gridSize).fill(0);
    result[major * 9 + minor] = 1;
    return result;
  }

  get matrix(): any {
    return this._matrix;
  }

  set matrix(value: any) {
    this._matrix = value;
  }
}
