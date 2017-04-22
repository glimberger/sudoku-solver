export class Cell
{
  public index: number;
  public values: Array<number>;


  constructor(index: number, values: any) {
    this.index = index;
    this.values = values;
  }
}
