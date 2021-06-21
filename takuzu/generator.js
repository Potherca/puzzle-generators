import {FORMAT} from '../generic/enums.js'

let puzzleConfig

const create = ({difficulty, id, size}) => {
  puzzleConfig = {id, difficulty, size}
}

const createAscii = puzzle => {
  const content = []

  const meta = Object.keys(puzzleConfig)
    .map(key => `${key} = ${puzzleConfig[key]}`)
    .join(' ')

  content.push(meta)

  let rowDivider = '+'
  let rows = puzzle.length
  let tableDivider = '+'

  while (rows-- > 0) {
    rowDivider += '---|'
    tableDivider += '---+'
  }

  // Replace last `|` with a `+`
  rowDivider = rowDivider.substring(0, rowDivider.length - 1) + '+'

  content.push(tableDivider)

  puzzle.forEach((row) => {
    let rowContent = '| '
    row.forEach((column) => {
      let value = column === -1 ? ' ' : column
      rowContent += value + ' | '
    })
    content.push(rowContent, rowDivider)
  })

  // Replace last row with table divider
  content.pop()
  content.push(tableDivider)

  return content.join('\n')
}

const createSvg = ({meta, puzzle}) => {
  let cellSize = 10
  let gridContent = ''
  let textContent = ''

  let gridSize = cellSize * puzzleConfig.size

  puzzle.forEach((row, rowIndex) => {
    row.forEach((column, columnIndex) => {
      let y = cellSize * rowIndex
      let x = cellSize * columnIndex

      let value = column === -1 ? '' : column
      gridContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" />`
      textContent += `<text x="${x + cellSize / 2}" y="${y + cellSize / 2}">${value}</text>`
    })
  })

  return fillTemplate({cellSize, gridContent, gridSize, meta, textContent})
}

const fillTemplate = ({cellSize, gridContent, gridSize, meta, textContent}) => `<?xml version="1.0" standalone="no"?>
<svg
    height="100%"
    preserveAspectRatio="xMinYMin meet"
    viewBox="0 0 ${gridSize} ${gridSize}"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
>
    <!-- ${meta} -->
    <rect 
        fill="none"
        height="100%"
        stroke-width="${cellSize / 10}"
        stroke="black"
        width="100%"
        x="0" 
        y="0"
    />
    <g
        fill="transparent"
        stroke-width="${cellSize / 100}"
        stroke="black"
    >${gridContent}</g>
    <g
        dominant-baseline="middle"
        fill="black"
        font-size="${cellSize / 2}"
        stroke-width="${cellSize / 100}"
        stroke="black"
        text-anchor="middle"
    >${textContent}
    </g>
</svg>
`

const generate = () => {
  const board = new Board(puzzleConfig.size, puzzleConfig.id, puzzleConfig.difficulty / 100)

  board.generateBoard()
  board.removePerc += 0.01

  return board.takuzuPuzzle
}

const output = (puzzle, format = FORMAT.SVG) => {
  const meta = createAscii(puzzle)
  switch (format) {
    case FORMAT.SVG:
      return createSvg({meta, puzzle})
    default:
      return meta
  }
}

export default {
  create: create,
  generate: generate,
  output: output,
}
