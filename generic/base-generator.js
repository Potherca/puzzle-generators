export default (generators) => {
  Object.entries(generators).forEach(entry => {
    const [generatorName, generator] = entry
    /* @TODO: Validate Generators have all required methods */
  })

  return {
    "create": (puzzleType, puzzleConfig) => {
      if ( ! generators[puzzleType]) {
        throw new Error(`Unknown puzzle type "${puzzleType}". Must be one of: ${Object.keys(generators).join(', ')}`)
      }

      let generator = generators[puzzleType]

      generators[puzzleType].create(puzzleConfig)

      return generator
    },
  }
}
