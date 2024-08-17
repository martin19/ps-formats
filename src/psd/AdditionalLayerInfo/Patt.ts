import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {VirtualMemoryArray} from "../VirtualMemoryArray";
import {ColorMode} from "../EnumColorMode";
export class Patt implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  patterns:VirtualMemoryArray[] = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length:number, header:Header) {
    let limit:number = stream.tell() + length;
    let patternLength:number;
    this.patterns = [];
    this._offset = stream.tell();

    while (stream.tell() < limit) {
      patternLength = stream.readUint32() + 3 & ~3;
      let patternStart = stream.tell();

      let pattern = new VirtualMemoryArray();

      pattern.version = stream.readUint32();
      pattern.mode = stream.readInt32();
      pattern.vertical = stream.readInt16();
      pattern.horizontal = stream.readInt16();
      pattern.name = stream.readWideString(stream.readUint32());
      pattern.id = stream.readPascalString().substring(0,36);

      if (pattern.mode === ColorMode.INDEXED_COLOR) {
        pattern.colorTable = stream.read(256 * 3);
        let dummy = stream.readUint32();
      }

      pattern.parse(stream, patternLength - (stream.tell() - patternStart));

      this.patterns.push(pattern);
    }

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter, header : Header):void {
    this.patterns.forEach(pattern => {
      let ipLength = stream.tell();
      stream.writeUint32(42);
      let ipDataStart = stream.tell();
      stream.writeUint32(1);
      stream.writeInt32(pattern.mode);
      stream.writeInt16(pattern.vertical);
      stream.writeInt16(pattern.horizontal);
      stream.writeUint32(pattern.name.length);
      stream.writeWideString(pattern.name);
      stream.writePascalString(pattern.id);
      if(pattern.mode === ColorMode.INDEXED_COLOR) {
        let colorTable = new Uint8Array(768);
        stream.write(colorTable);
      }
      pattern.write(stream);
      let ipDataEnd = stream.tell();

      let length = ipDataEnd - ipDataStart;

      //padding
      while(length % 4 !== 0) {
        stream.writeUint8(0);
        length++;
      }

      //write length field.
      let ipNow = stream.tell();
      stream.seek(ipLength, 0);
      stream.writeUint32(length);
      stream.seek(ipNow, 0);
    });
  }
}