/*
 * Recursively merge properties of two objects, but we want to create new object,
 * we don't want to mutate `obj1`
 */
module.exports = function mergeRecursive(obj1, obj2) {
  for (var p in obj2) {
    let p1 = obj1[p],
      p2 = obj2[p];
    if (p1 && p1.constructor === Object && p2 && p2.constructor === Object) {
      obj1[p] = mergeRecursive(p1, p2);
    } else {
      // we may use object.clone, but we won't mutate any value inside options
      obj1[p] = obj2[p];
    }
  }
  return obj1;
};
