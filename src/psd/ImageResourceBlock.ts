import {StreamReader} from "./StreamReader";
import {StreamWriter} from "./StreamWriter";
import {ImageResourceMap, ImageResource} from "./ImageResource/ImageResource";
import {irPath} from "./ImageResource/irPath";

export class ImageResourceBlock {

  private _offset:number = 0;
  private _length:number = 0;

  key:number = 0;
  name:string = "";
  dataSize:number = 0;
  // raw data of irb
  data:Array<number>|Uint8Array = new Uint8Array();
  // interpreted data of irb
  info:ImageResource|null = null;

  constructor() {
    this.name = "";
  }

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader) {
    this._offset = stream.tell();

    if (stream.readString(4) !== '8BIM') {
      throw new Error('invalid signature');
    }

    this.key = stream.readUint16();
    this.name = stream.readPascalString();
    stream.read((stream.tell() + 1 & ~1) - stream.tell());
    this.dataSize = stream.readUint32();

    if (typeof ImageResourceMap[this.key] === 'function') {
      this.info = new (ImageResourceMap[this.key])() as ImageResource;
      this.info.parse(stream);
    } else if(this.key === 1025 || (this.key >= 2000 && this.key <= 2997)) {
      //Path information (working path or resources)
      this.info = new irPath();
      (this.info as irPath).length = this.dataSize;
      this.info.parse(stream);
    } else {
      this.data = stream.read(this.dataSize);
    }

    stream.read((stream.tell() + 1 & ~1) - stream.tell());

    this._length = stream.tell() - this._offset;
  }
  
  write(stream:StreamWriter) {
    if(!this.info) {
      console.warn("IRB info is not set.");
      return;
    }
    stream.writeString("8BIM");
    stream.writeUint16(this.key);
    stream.writePascalString(this.name);
    while(stream.tell() % 2 !== 0) stream.writeUint8(0);
    stream.writeUint32(this.info.getLength());
    this.info.write(stream);
  }

  getLength():number {
    return 4 + 2 + ((1 + this.name.length + 1) & ~1) + 4 + (this.info?.getLength() ?? 0);
  }
}

