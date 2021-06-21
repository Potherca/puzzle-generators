import TakuzuGenerator from './takuzu/generator.js'
import BaseGenerator from './generic/base-generator.js'

const randomId = Math.round(Math.random() * (16777216))

const createPuzzleConfig = () => {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  /*/ Set default values /*/
  let puzzleConfig = {
    "difficulty": 50,
    "id": randomId,
    "size": 10,
  }

  /*/ Overwrite values from GET params /*/
  const urlParams = new URLSearchParams(window.location.search)
  puzzleConfig.difficulty = urlParams.get('difficulty') || puzzleConfig.difficulty
  puzzleConfig.id = urlParams.get('id') || puzzleConfig.id
  puzzleConfig.size = urlParams.get('size') || puzzleConfig.size

  /*/ Clamp values between min- and maximum values /*/
  return Object.assign(puzzleConfig, {
    difficulty: clamp(puzzleConfig.difficulty, 0, 100),
    id: clamp(puzzleConfig.id, 0, 16777216),
    size: clamp(puzzleConfig.size, 1, 16),
  })
}

const updateTracker = () => {
  document.querySelector('[data-js="difficulty"]').textContent = ' ' + document.querySelector('[type="range"]').value
}

const resetForm = () => {
  const puzzleConfig = createPuzzleConfig()

  Object.keys(puzzleConfig).forEach(key => document.querySelector(`[data-js="set-${key}"]`).value = puzzleConfig[key])
  updateTracker()
}

document.querySelector('form').addEventListener('reset', (event) => {
  event.preventDefault()
  resetForm()
  document.querySelector('div').style.opacity = '1'
})

document.querySelector('input[type="range"]').addEventListener('input', updateTracker)

document.querySelectorAll('input').forEach(element => {
  element.addEventListener('input', () => {
    document.querySelector('div').style.opacity = '0.35'
  })
})

window.addEventListener('DOMContentLoaded', () => {
  const baseGenerator = BaseGenerator({
    "takuzu": TakuzuGenerator,
  })

  const puzzleConfig = createPuzzleConfig()
  const puzzleType = 'takuzu'

  const generator = baseGenerator.create(puzzleType, puzzleConfig)
  const puzzleData = generator.generate()
  const puzzle = generator.output(puzzleData)

  resetForm()

  document.querySelector('main').insertAdjacentHTML('beforeend', `<div>${puzzle}</div>`)
})
