function checkForDocs (firestore, paths) {
  return Promise.all(paths.map(args => checkForDoc(firestore, ...args)))
}

function checkForDoc (firestore, path, name, cond, err) {
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
