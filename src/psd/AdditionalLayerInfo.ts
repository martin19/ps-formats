
import {StreamReader} from "./StreamReader";
import {Header} from "./Header";
import {AdditionalLayerInfoBlock, IAdditionalLayerInfoBlock} from "./AdditionalLayerInfo/AdditionalLayerInfoParser";
import {StreamWriter} from "./StreamWriter";

let COMPILED:boolean = false;

export class AdditionalLayerInfo {

  private _offset:number = 0;
  private _length:number = 0;

  signature:string = "";
  key:string = "";
  info : IAdditionalLayerInfoBlock|undefined;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(key:string, info:IAdditionalLayerInfoBlock) {
    let ali = new AdditionalLayerInfo();
    ali.key = key;
    ali.info = info;
    return ali;
  }

  parse(stream:StreamReader, header:Header) {
    let length:number;

    this._offset = stream.tell();
    this.signature = stream.readString(4);
    if(this.signature !== "8BIM" && this.signature !== "8B64")
      throw new Error(`invalid signature: ${this.signature}`);
    this.key = stream.readString(4);
    if(header.version === 2 && ["LMsk", "Lr16", "Lr32", "Layr", "Mt16", "Mt32", "Mtrn", "Alph", "FMsk", "lnk2", "lnkE",
      "FEid", "FXid", "PxSD", "cinf"].includes(this.key)) {
      length = stream.readUint64();
      if(length%4 !== 0) length += 4-(length%4);
      this._length = length + 16;
    } else {
      length = stream.readUint32();
      if(length%4 !== 0) length += 4-(length%4);
      this._length = length + 12;
    }

    // console.log(`reading additionalLayerInfo: sig=${this.signature} key=${this.key} length=${this.length}`)

    // 実装されている key の場合はパースを行う
    // 各 key の実装は AdditionaLayerInfo ディレクトリにある
    if (typeof AdditionalLayerInfoBlock[this.key] === 'function') {
      this.info = new (AdditionalLayerInfoBlock[this.key])() as IAdditionalLayerInfoBlock;
      this.info.parse(stream, length, header);
    } else {
      console.warn('additional layer information: not implemented', this.key);
    }

    // error check
    if (stream.tell() - (this._offset + this._length) !== 0) {
      if (!COMPILED) {
        //TODO: decide whether to drop this error message, this offset computation might be broken in psds.
        console.log("Error: difference between expected offset and real offset in " + this.key + " Difference:" + (stream.tell() - (this._offset + this._length)));
      }
    }

    stream.seek(this._offset + this._length, 0);
  }
  
  write(stream:StreamWriter, header:Header) {
    if(!this.key) {
      console.warn('additional layer information: key is not set: skipping', this.key);
      return;
    }
    stream.writeString("8BIM");
    stream.writeString(this.key);
    if(typeof AdditionalLayerInfoBlock[this.key] === "function") {
      let lib = (this.info as IAdditionalLayerInfoBlock);

      const ipLength = stream.tell();
      stream.writeUint32(42);
      const ipDataStart = stream.tell();
      lib.write(stream);
      const ipDataEnd = stream.tell();

      //write data length field.

      let length = ipDataEnd - ipDataStart;

      //add padding.
      while(length % 4 !== 0) {
        stream.writeUint8(0);
        length++;
      }

      let ipNow = stream.tell();
      stream.seek(ipLength, 0);
      stream.writeUint32(length);
      stream.seek(ipNow, 0);
    }
  }
}
