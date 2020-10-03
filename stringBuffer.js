class StringBuffer {
  constructor() {
    this.buffer = new Array();
  }
  append(obj) {
    this.buffer.push(obj);
  }
  toString() {
    return this.buffer.join("\n");
  }
}

module.exports = StringBuffer;