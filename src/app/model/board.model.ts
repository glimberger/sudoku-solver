import {Cell} from "./cell.model";
import {Constraints} from "./constraints.model";
import * as dlxlib from "dlxlib";

declare var dlxlib: any;

export class Board
{
  private static readonly TIMEOUT: number = 10000;

  private _initialGrid: Array<Array<number>>;
  private _grid: Array<Array<number>>;

  private _moveHistory: Array<number>;
  private _possibilityList: Array<Cell>;
  private _candidateList: Array<Cell>;
  private _solved: boolean;
  private _loaded: boolean;
  private _unsolved: boolean;
  private _timer: Date;


  constructor(csv: string) {
    this.reset();

    let lines = csv.trim().split(';');

    lines.map((line: string) => {
      this.initialGrid.push(line.trim().split(',').map(Number));
    });

    if (this.initialGrid.length > 0) {
      this.loaded = true;
    }

    this.grid = this.cloneGrid(this.initialGrid);
  }

  /**
   *
   */
  public reset(): void {
    this.solved = false;
    this.unsolved = false;
    this.loaded = false;
    this.initialGrid = [];
    this.grid = [];
    this.moveHistory = [];
    this.candidateList = [];
  }

  /**
   *
   */
  public startSolving(): void {
    this._timer = new Date();
    this.candidateList = Board.buildCandidateList(this.grid);
    console.log('list:', this.candidateList);

    this.solve();
  }

  private cloneGrid(grid: Array<Array<number>>): Array<Array<number>> {
    let cloned = [];
    grid.map((line) => {
      cloned.push(Array.from(line))
    });

    return cloned;
  }

  /**
   * @param grid
   * @returns {Array<Cell>}
   */
  private static buildCandidateList(grid: Array<Array<number>>): Array<Cell> {
    let list: Array<Cell> = [];
    let gridSize = grid.length;

    // iterate over grid index
    for (let index = 0; index < gridSize * gridSize; index++) {
      let row = Math.floor(index / gridSize);
      let col = index % gridSize;
      // console.log('cell (' + row + ',' + col + ')');

      if (Board.isCellFilled(grid, row, col)) {
        // console.log('cell (', row, ',', col, ') is already filled');
        continue;
      }

      let cell = new Cell(index, []);

      // test the consistency for each value
      for (let n = 1; n <= gridSize; n++) {
        // console.log('cell (', row, ',', col, ') try n=', n);
        if (Board.isCellConsistent(grid, row, col, n)) {
          // console.log('cell (', row, ',', col, ') is in a consistent state');
          cell.values.push(n);
        }
      }
      // console.log('cell:', cell);
      list.push(cell);
      // console.log('list[', index, '] = [', list[index].join(', '), ']');
    }

    // sort by the least candidates first
    return list.sort((cell1: Cell, cell2: Cell) => cell1.values.length - cell2.values.length);
  }

  /**
   * Checks whether a grid cell is already filled.
   *
   * @param grid
   * @param row
   * @param col
   * @returns {boolean}
   */
  private static isCellFilled(grid: Array<Array<number>>, row: number, col: number): boolean {
    return grid[row][col] != 0;
  }

  /**
   * Checks whether a grid cell is in a consistent state.
   *
   * @param grid
   * @param row
   * @param col
   * @param value
   * @returns {boolean}
   */
  private static isCellConsistent(grid: Array<Array<number>>, row: number, col: number, value: number): boolean {
    let gridSize = grid.length;

    // check rows and columns
    for (let k = 0; k < gridSize; k++) {
      if (value === grid[k][col]) {
        // console.log('cell (', k, ',', col, ') already filled with ', value);
        return false;
      }
      if (value === grid[row][k]) {
        // console.log('cell (', row, ',', k, ') already filled with ', value);
        return false;
      }
    }

    // check squares
    let squareSize: number = Math.sqrt(gridSize);
    let rowStart: number = row - row % squareSize;
    let colStart: number = col - col % squareSize;

    for (let j = 0; j < squareSize; j++) {
      for (let i = 0; i < squareSize; i++) {
        if (value === grid[rowStart + i][colStart + j]) {
          // console.log('cell (', rowStart + i, ',', colStart + j, ') already filled with ', value, ' in block (', rowStart, ',', colStart, ')');
          return false;
        }
      }
    }

    return true;
  }

  /**
   *
   */
  private solve(): void {
    let gridSize = this.grid.length;

    let timeDiff = (new Date()).getTime() - this._timer.getTime();
    if (timeDiff > Board.TIMEOUT) {
      this.unsolved = true;
      return;
    }

    if (this.candidateList.length == 0) {
      this.solved = true;
      return;
    }

    let candidateCell: Cell = this.candidateList[0];

    let index: number = candidateCell.index;
    let possibilities = candidateCell.values;
    // console.log('possibilities:', possibilities);
    let row: number = Math.floor(index / gridSize);
    let col: number = index % gridSize;

    if (possibilities && possibilities.length == 0) {
      console.log('cell (', row, ',', col, ') index =', index, 'blocked');

      let previousIndex: number = this.moveHistory.pop();
      let previousRow: number = Math.floor(previousIndex / gridSize);
      let previousCol: number = previousIndex % gridSize;
      let previousValue: number = this.grid[previousRow][previousCol];
      console.log('previous cell(', previousRow, ',', previousCol, ') index =', previousIndex, ' value =', previousValue);

      // reset previous cell
      this.grid[previousRow][previousCol] = 0;

      // build an updated candidate list
      this.candidateList = Board.buildCandidateList(this.grid);

      // find previous cell index in the candidate list
      let previousListIndex = this.candidateList.findIndex((cell: Cell) => cell.index == previousIndex);
      console.log('previous cell:', this.candidateList[previousListIndex]);

      let previousValues = this.candidateList[previousListIndex].values;
      console.log('previous values', previousValues);

      // remove the blocking value from the previous values
      previousValues = previousValues.length == 1 ? [] : previousValues.filter((value) => value != previousValue);
      this.candidateList[previousListIndex].values = previousValues;
      console.log('list:', this.possibilityList);

      this.solve();
    }

    else if (possibilities && possibilities.length == 1) {
      console.log('cell (', row, ',', col, ') index =', index, 'value =', possibilities[0]);
      this.grid[row][col] = possibilities[0];

      // update history of moves
      this.moveHistory.push(index);
      console.log('history', this.moveHistory);

      this.candidateList = Board.buildCandidateList(this.grid);
      console.log('list:', this.candidateList);

      this.solve();
    }

    else if (possibilities && possibilities.length > 1) {
      let possibility = possibilities[0];
      console.log('cell (', row, ',', col, ') index =', index, 'value = [', possibilities.join(', '), '] choose', possibility);

      this.grid[row][col] = possibility;

      // update history of moves
      this.moveHistory.push(index);

      this.candidateList = Board.buildCandidateList(this.grid);
      console.log('list:', this.possibilityList);

      this.solve();
    }
  }

  public startSolvingWithDLX(): void {

    const flatGrid = this.buildFlatGrid();

    const constraints: Constraints = new Constraints(flatGrid, this.initialGrid.length);

    const solution = dlxlib.solve(constraints.matrix, null, null, 1);

    const cells: Array<any> = solution[0].map(el => flatGrid[el]);

    cells.forEach(cell => {
      const {row, col} = cell.coords;
      this.grid[row][col] = cell.value;
    });

    this.solved = true;
  }

  private buildFlatGrid(): Array<any>
  {
    const INDICES = Array.from(Array(9).keys());
    const ROWS = INDICES;
    const COLS = INDICES;
    const DIGITS = INDICES.map(n => n + 1);

    let seqs = ROWS.map(row =>
      COLS.map(col => {
        const coords = { row, col };
        const initialValue = this.initialGrid[row][col];

        return initialValue == 0 ? DIGITS.map(digit => ({ coords, value: digit })) : [{ coords, value: initialValue }];
      })
    );

    const flatten = xss => xss.reduce((acc, xs) => acc.concat(xs), []);

    return flatten(flatten(seqs));
  }

  get initialGrid(): Array<Array<number>> {
    return this._initialGrid;
  }

  set initialGrid(value: Array<Array<number>>) {
    this._initialGrid = value;
  }

  get grid(): Array<Array<number>> {
    return this._grid;
  }

  set grid(value: Array<Array<number>>) {
    this._grid = value;
  }

  get moveHistory(): Array<number> {
    return this._moveHistory;
  }

  set moveHistory(value: Array<number>) {
    this._moveHistory = value;
  }

  get candidateList(): Array<Cell> {
    return this._candidateList;
  }

  set candidateList(value: Array<Cell>) {
    this._candidateList = value;
  }

  get possibilityList(): Array<Cell> {
    return this._possibilityList;
  }

  set possibilityList(value: Array<Cell>) {
    this._possibilityList = value;
  }

  get solved(): boolean {
    return this._solved;
  }

  set solved(value: boolean) {
    this._solved = value;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  set loaded(value: boolean) {
    this._loaded = value;
  }

  get unsolved(): boolean {
    return this._unsolved;
  }

  set unsolved(value: boolean) {
    this._unsolved = value;
  }
}
