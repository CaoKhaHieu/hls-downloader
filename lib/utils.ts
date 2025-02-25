class ArrayBufferMerger {
  static merge(myArrays: Uint8Array[]): Uint8Array {
    let length = myArrays.reduce((acc, item) => acc + item.length, 0);
    let mergedArray = new Uint8Array(length);

    let offset = 0;
    myArrays.forEach(item => {
      mergedArray.set(item, offset);
      offset += item.length;
    });

    return mergedArray;
  }
}

export default ArrayBufferMerger;