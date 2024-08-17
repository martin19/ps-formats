export class StreamReader {
  private input:Uint8Array;
  private ip:number;

  /**
   * ByteArray Reader.
   * @param input input buffer.
   * @param opt_start start position.
   */
  constructor(input:Uint8Array, opt_start:number) {
    this.input = new Uint8Array(input);
    /** @type {number} */
    this.ip = opt_start | 0;
  }

  /**
   * @return {number}
   */
  readUint32() {
    return (
        (this.input[this.ip++] << 24) | (this.input[this.ip++] << 16) |
        (this.input[this.ip++] << 8) | (this.input[this.ip++]      )
      ) >>> 0;
  }

  readUint32LE() {
    return (
      (this.input[this.ip++]) | (this.input[this.ip++] << 8) |
      (this.input[this.ip++] << 16) | (this.input[this.ip++] << 24)
    ) >>> 0;
  }

  readUint64() {
    const dummy = this.readUint32();
    return this.readUint32();
  }

  /**
   * @return {number}
   */
  readInt32() {
    return (
      (this.input[this.ip++] << 24) | (this.input[this.ip++] << 16) |
      (this.input[this.ip++] << 8) | (this.input[this.ip++]      )
    );
  }

  /**
   * @return {number}
   */
  readUint16() {
    return (this.input[this.ip++] << 8) | this.input[this.ip++];
  }

  readUint16LE() {
    return this.input[this.ip++] | (this.input[this.ip++] << 8);
  }

  /**
   * @return {number}
   */
  readInt16() {
    return ((this.input[this.ip++] << 8) | this.input[this.ip++]) << 16 >> 16;
  }

  /**
   * @return {number}
   */
  readUint8() {
    return this.input[this.ip++];
  }

  /**
   * @return {number}
   */
  readInt8() {
    return this.input[this.ip++] << 24 >> 24;
  }

  /**
   * @return {number}
   */
  readFloat64() {
    let buffer = new ArrayBuffer(8);
    let uint8 = new Uint8Array(buffer);
    let float64 = new Float64Array(buffer);

    function parseDoubleUsingTypedArray(input:Array<number>|Uint8Array, ip:number) {
      let i = 8;
      while (--i) {
        uint8[i] = input[ip++];
      }
      return float64[0];
    }

    let value:number;
    value = parseDoubleUsingTypedArray(this.input, this.ip);
    this.ip += 8;
    return value;
  }

  /**
   * @return {number}
   */
  readFloat32(endian?:boolean) {
    let buffer = new ArrayBuffer(4);
    let uint8 = new Uint8Array(buffer);
    let float32 = new Float32Array(buffer);

    function parseFloatUsingTypedArray(input:Array<number>|Uint8Array, ip:number) {
      let i = 4;
      while (--i) {
        uint8[i] = input[ip++];
      }
      return float32[0];
    }

    let value:number;
    value = parseFloatUsingTypedArray(this.input, this.ip);
    this.ip += 4;
    return value;
  }

  /**
   * @return {number}
   */
  readFloat32LE() {
    const value = new DataView((this.input as Uint8Array).buffer).getFloat32(this.ip, true);
    this.ip += 4;
    return value;
  }

  read(length:number):Uint8Array {
    return (<Uint8Array>this.input).subarray(this.ip, this.ip += length);
  }

  /**
   *
   * @param start
   * @param end
   * @return {Array<number>|Uint8Array}
   */
  slice(start:number, end:number):Array<number>|Uint8Array {
    this.ip = end;
    return (<Uint8Array>this.input).subarray(start, end);
  }

  /**
   * @param start start position.
   * @param end end position.
   * @return {Array<number>|Uint8Array}
   */
  fetch(start:number, end:number):Array<number>|Uint8Array {
    return (<Uint8Array>this.input).subarray(start, end);
  }

  /**
   * @param length read length.
   * @return {string}
   */
  readString(length:number) {
    let input = this.input;
    let ip = this.ip;
    let charArray:Array<string> = [];
    let i:number;

    for (i = 0; i < length; ++i) {
      charArray[i] = String.fromCharCode(input[ip++]);
    }

    this.ip = ip;

    return charArray.join('');
  }

  /**
   * @param length read length.
   * @return {string}
   */
  readWideString(length:number) {
    let input = this.input;
    let ip = this.ip;
    let charArray:Array<string> = [];
    let i:number;

    for (i = 0; i < length; ++i) {
      charArray[i] = String.fromCharCode((input[ip++] << 8) | input[ip++]);
    }

    this.ip = ip;

    return charArray.join('');
  }

  /**
   * @return {string}
   */
  readPascalString() {
    return this.readString(this.input[this.ip++]);
  };

  /**
   * @return {number}
   */
  tell() {
    return this.ip;
  }

  /**
   * @param pos position.
   * @param opt_base base position.
   */
  seek(pos:number, opt_base?:number) {
    if (typeof opt_base !== 'number') {
      opt_base = this.ip;
    }
    this.ip = opt_base + pos;
  }

  readPackBits(length:number, data:Uint8Array, start:number) {
    let limit:number;
    let runLength:number;
    let copyValue:number;
    let pos:number = start;

    limit = this.ip + length;

    // decode
    while (this.ip < limit) {
      runLength = this.readInt8();

      // runlength copy
      if (runLength < 0) {
        runLength = 1 - runLength;
        copyValue = this.readUint8();
        while (runLength-- > 0) {
          data[pos++] = copyValue;
        }
        // plain copy
      } else {
        runLength = 1 + runLength;
        while (runLength-- > 0) {
          data[pos++] = this.readUint8();
        }
      }
    }
  }


}