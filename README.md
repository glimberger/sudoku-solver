# sudoku-solver
A classic Sudoku solver.

## Use
* Load a csv containing an unsolved matrix.

Example:
```text
0,7,6,0,1,0,0,4,3;
0,0,0,7,0,2,9,0,0;
0,9,0,0,0,6,0,0,0;
0,0,0,0,6,3,2,0,4;
4,6,0,0,0,0,0,1,9;
1,0,5,4,2,0,0,0,0;
0,0,0,2,0,0,0,9,0;
0,0,4,8,0,7,0,0,1;
9,1,0,0,5,0,7,2,0
```
Samples are available in the `assets` directory.

* Click the `solve` button !

## Techniques
**Brute force backtracing**    
Solve each cell using a candidate list and recursion

**Dancing Links**    
Take the Sudoku matrix as an exact cover problem and used the Donald E. Knuth's [DLX](https://en.wikipedia.org/wiki/Knuth%27s_Algorithm_X) to solve it. 

## Development server

Run `ng serve` for a dev server (angular CLI required).    
Navigate to `http://localhost:4200/`. 

