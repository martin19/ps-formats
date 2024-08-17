const DefaultBufferSize = 4096;

export class StreamWriter {
  private output:Uint8Array;
  private ip:number;
  private currentBufferSize:number;

  result() {
    return this.output.slice(0, this.ip);
  }

  /**
   * ByteArray Writer.
   */
  constructor() {
    this.output = new Uint8Array(DefaultBufferSize);
    this.currentBufferSize = DefaultBufferSize;
    this.ip = 0;
  }

  maybeGrow(bytes : number) {
    let nextBufferSize = this.currentBufferSize;
    while(this.ip + bytes > nextBufferSize) nextBufferSize *= 2;
    if(nextBufferSize > this.currentBufferSize) {
      let newBuffer = new Uint8Array(nextBufferSize);
      for(let i = 0; i < this.ip; i++) {
        newBuffer[i] = this.output[i];
      }
      this.output = newBuffer;
      this.currentBufferSize = nextBufferSize;
    }
  }

  /**
   * Write Uint32 number.
   * @param value
   */
  writeUint32(value:number) {
    this.maybeGrow(4);
    this.output[this.ip++] = (value >> 24) & 0xFF;
    this.output[this.ip++] = ((value >> 16) & 0xFF);
    this.output[this.ip++] = ((value >> 8) & 0xFF);
    this.output[this.ip++] = (value & 0xFF);
  }

  /**
   * Write Int32 number.
   * @param value
   */
  writeInt32(value:number) {
    this.maybeGrow(4);
    this.output[this.ip++] = ((value >> 24) & 0xFF);
    this.output[this.ip++] = ((value >> 16) & 0xFF);
    this.output[this.ip++] = ((value >> 8) & 0xFF);
    this.output[this.ip++] = (value & 0xFF);
  }

  /**
   * Write Uint16 number.
   * @param value
   */
  writeUint16(value:number) {
    this.maybeGrow(4);
    this.output[this.ip++] = ((value >> 8) & 0xFF);
    this.output[this.ip++] = (value & 0xFF);
  }

  /**
   * Write Int16 number.
   * @param value
   */
  writeInt16(value:number) {
    this.maybeGrow(2);
    this.output[this.ip++] = ((value >> 8) & 0xFF);
    this.output[this.ip++] = (value & 0xFF);
  }

  /**
   * Write UInt8.
   */
  writeUint8(value:number) {
    this.maybeGrow(1);
    this.output[this.ip++] = value;
  }

  /**
   * Write Int8.
   */
  writeInt8(value:number) {
    this.maybeGrow(1);
    this.output[this.ip++] = value;
  }

  /**
   * Write Float32.
   * @param value
   */
  writeFloat32(value:number) {
    this.maybeGrow(4);
    let buffer = new ArrayBuffer(4);
    let float32 = new Float32Array(buffer);
    let uint8 = new Uint8Array(buffer);
    float32[0] = value;
    let i = 4;
    while (--i >= 0) {
      this.output[this.ip++] = uint8[i];
    }
  }

  /**
   * Write Float64.
   * @param value
   */
  writeFloat64(value:number) {
    this.maybeGrow(8);
    let buffer = new ArrayBuffer(8);
    let float64 = new Float64Array(buffer);
    let uint8 = new Uint8Array(buffer);
    float64[0] = value;
    let i = 8;
    while (--i >= 0) {
      this.output[this.ip++] = uint8[i];
    }
  }

  /**
   * Write array of bytes to output.
   * @param data
   */
  write(data:Array<number>|Uint8Array) {
    this.maybeGrow(data.length);
    let i = 0;
    while(i < data.length) {
      this.output[this.ip++] = data[i++];
    }
  }


  /**
   * Writes a 0 terminated string to output.
   * @param value
   * @returns {string}
   */
  writeString(value:string) {
    this.maybeGrow(value.length);
    for (let i = 0; i < value.length; i++) {
      this.output[this.ip++] = value.charCodeAt(i);
    }
  }

  /**
   * Writes a 2-byte-symbol string to output.
   * @param value
   */
  writeWideString(value:string) {
    this.maybeGrow(value.length * 2);
    for (let i = 0; i < value.length; ++i) {
      let charcode = value.charCodeAt(i);
      this.output[this.ip++] = (charcode >> 8 & 0xFF);
      this.output[this.ip++] = (charcode & 0xFF);
    }
  }

  /**
   * Writes a Pascal string to output.
   */
  writePascalString(value:string) {
    this.writeUint8(value.length);
    this.writeString(value);
  }

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

  /**
   * Encodes data in data to Packbits and returns it.
   * @param data
   * @returns {Array<number>}
   */
  static createPackbits(data:Uint8Array|Array<number>) {
    let output:Uint8Array = new Uint8Array(data.length * 2);
    let index = 0;
    if(data.length == 0) {
      return;
    }
    if(data.length == 1) {
      output[index++] = 0;
      output[index++] = data[0];
      return output.slice(0,index);
    }

    let pos = 0;
    let buf:Array<number> = [];
    let repeatCount = 0;
    const MAX_LENGTH:number = 127;

    // we can safely start with RAW as empty RAW sequences
    // are handled by finish_raw()
    let state = 0; //0 == RAW, 1 == RLE

    while(pos < data.length-1) {
      let currentByte = data[pos];
      if(data[pos] == data[pos+1]) {
        if(state === 0) {
          // end of RAW data
          if (buf.length != 0) {
            output[index++] = buf.length - 1;
            for (let i = 0; i < buf.length; i++) {
              output[index++] = buf[i];
            }
            buf = [];
          }
          state = 1;
          repeatCount = 1;
        } else if(state === 1) {
          if(repeatCount === MAX_LENGTH) {
            // restart the encoding
            output[index++] = 256 - (repeatCount - 1);
            output[index++] = data[pos];
            repeatCount = 0;
          }
          // move to next byte
          repeatCount++;
        }
      } else {
        if(state === 1) {
          repeatCount++;
          output[index++] = 256 - (repeatCount - 1);
          output[index++] = data[pos];
          state = 0;
          repeatCount = 0;
        } else if(state === 0) {
          if(buf.length === MAX_LENGTH) {
            // restart the encoding
            if (buf.length != 0) {
              output[index++] = buf.length - 1;
              for (let i = 0; i < buf.length; i++) {
                output[index++] = buf[i];
              }
              buf = [];
            }
          }
          buf.push(currentByte);
        }
      }
      pos++;
    }
    if(state === 0) {
      buf.push(data[pos]);
      if (buf.length != 0) {
        output[index++] = buf.length - 1;
        for (let i = 0; i < buf.length; i++) {
          output[index++] = buf[i];
        }
      }
    } else {
      repeatCount++;
      output[index++] = 256 - (repeatCount - 1);
      output[index++] = data[pos];
    }
    return output.slice(0,index);
  }
}