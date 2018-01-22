function checkForDocs (firestore, paths) {
  console.log('paths', paths)
  return Promise.all(paths.map(args => checkForDoc(firestore, ...args)))
}

function checkForDoc (firestore, path, name, cond, err) {
  console.log(path, name)
  return firestore
    .doc(path)
    .get()
    .then(
      snap =>
        snap.exists
          ? cond ? Promise.resolve(cond(snap)) : Promise.resolve(true)
          : Promise.reject(new Error(`${name}_not_found`))
    )
    .then(ok => (ok ? Promise.resolve() : Promise.reject(err)))
}

exports.checkForDoc = checkForDoc
exports.checkForDocs = checkForDocs
