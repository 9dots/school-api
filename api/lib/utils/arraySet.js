export default (arr = [], i, value) => {
  if (!Array.isArray(arr)) {
    throw new Error('arraySet: first argument must be array')
  }
  return Object.assign([...arr], { [i]: value })
}
