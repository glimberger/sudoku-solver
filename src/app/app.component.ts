import {Component, ViewChild} from '@angular/core';
import {Board} from "./model/board.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private static readonly CSV_TYPE = 'text/csv';

  @ViewChild('load')
  public fileInput: any;
  public solvedTime: number;
  public widthExp: number;

  private board: Board;

  constructor() {}

  public changeListener($event): void {
    this.load($event.target)
  }

  private load(target: any) {
    let file: File = target.files[0];
    let fileReader: FileReader = new FileReader();

    let that = this;

    fileReader.readAsText(file);

    fileReader.onloadend = function (ev) {
      console.log(file.name);
      if (file.type != AppComponent.CSV_TYPE) {
        return;
      }

      that.board = new Board(fileReader.result);
      console.log('board.grid', that.board.initialGrid);
    };
  }

  public getProgress()
  {
    return this.board.moveHistory.length;
  }

  public isLoaded(): boolean {
    return this.board ? this.board.loaded : false;
  }

  public isSolved(): boolean {
    return this.board ? this.board.solved : false;
  }

  public isUnSolved(): boolean {
    return this.board ? this.board.unsolved: false;
  }

  public getInitialGrid(): Array<Array<number>> {
    return this.board.initialGrid;
  }

  public getGrid() {
    return this.board.grid;
  }

  public reset() {
    this.fileInput.nativeElement.value = "";
    this.board.reset();
  }

  public solve(): void {
    let startTime = new Date();

    this.board.startSolving();

    this.solvedTime = (new Date()).getTime() - startTime.getTime();
  }

  public solveWithDLX(): void {
    let startTime = new Date();

    this.board.startSolvingWithDLX();

    this.solvedTime = (new Date()).getTime() - startTime.getTime();
  }
}
