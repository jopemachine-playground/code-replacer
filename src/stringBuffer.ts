class StringBuffer {
  buffer: string[];

  constructor () {
    this.buffer = new Array();
  }

  append (obj: string) {
    this.buffer.push(obj);
  }

  toString () {
    return this.buffer.join('\n');
  }
}

export default StringBuffer;
