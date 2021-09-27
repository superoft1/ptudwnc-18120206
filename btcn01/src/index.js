import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square({value, onClick, isWinning, isSelected}) {
  if(isWinning)
  {
    isSelected = false;
  }
  return (
    <button className={"square" + (isSelected ? " highlight-selected" : "") + (isWinning ? " winning" : "")} onClick={onClick}>
      {value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={"square-" + i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isWinning={this.props.winLine && this.props.winLine.includes(i)}
        isSelected={i === this.props.selectedItem}
      />
    );
  }

  render() {
    const boardSize = 3; // size: 3x3
    let renderSquare = [];
    for(let i=0; i<boardSize; i++) {
      let row = [];
      for(let j=0; j<boardSize; j++) {
        let loc = i * boardSize + j;
        row.push(this.renderSquare(loc));
      }
      renderSquare.push(<div key={i} className="board-row">{row}</div>);
    }
    return (
      <div>
        {renderSquare}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      selectedItem: -1,
      isDescending: true,
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).player || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          movePosition: i
        }
      ]),
      selectedItem: i,
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  switchSort() {
    this.setState({
      isDescending: !this.state.isDescending
    });
  }

  render() {
    const isDescending = this.state.isDescending;
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winInfo = calculateWinner(current.squares);
    const winner = winInfo.player;
    const wLine = winInfo.wLine;
    const isDraw = winInfo.isDraw;

    const moves = history.map((step, move) => {
      const moveP = step.movePosition;
      const col = moveP % 3;
      const row = Math.floor(moveP / 3);

      const desc = move ?
        'Go to move #' + move + " (" + col + "," + row + ")" :
        'Go to game start';
      return (
        <li key={move}>
          <button
            className={move === this.state.stepNumber ? "bold-selected-item" : null}
            onClick={() => this.jumpTo(move)}>
              {desc}
          </button>
        </li>
      );
    });


    let status;
    if (winner) {
      status = "Winner: " + winner;
    }
    else if (isDraw) {
      status = "Draw";
    }
    else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            winLine={winner? wLine : []}
            selectedItem={current.movePosition}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.switchSort()}>
            {isDescending? "Asc" : "Desc"}
          </button>
          <ol>{this.state.isDescending ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  let isDraw = false;
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        player: squares[a],
        wLine: [a, b, c],
        isDraw: isDraw,
      }
    }
  }

  isDraw = true;
  for (let i = 0; i < squares.length; i++) {
    if(squares[i] === null) {
      isDraw = false;
      break;
    }
  }

  return {
    player: null,
    wLine: null,
    isDraw: isDraw
  };
}