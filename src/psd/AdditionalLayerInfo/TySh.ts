import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
export class TySh implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  version:number = 0;
  transform:number[] = [];
  textVersion:number = 0;
  textDescriptorVersion:number = 0;
  textData:Descriptor = new Descriptor();
  warpVersion:number = 0;
  warpDescriptorVersion:number = 0;
  warpData:Descriptor = new Descriptor();
  left:number = 0;
  top:number = 0;
  right:number = 0;
  bottom:number = 0;


  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    this.version = stream.readInt16();
    this.transform = [
      stream.readFloat64(), // xx
      stream.readFloat64(), // xy
      stream.readFloat64(), // yx
      stream.readFloat64(), // yy
      stream.readFloat64(), // tx
      stream.readFloat64()  // ty
    ];

    this.textVersion = stream.readInt16();
    this.textDescriptorVersion = stream.readInt32();
    this.textData = new Descriptor();
    this.textData.parse(stream);

    // parse failure
    if (this.textData.items !== this.textData.item.length) {
      console.error('Descriptor parsing failed');
      return;
    }

    this.warpVersion = stream.readInt16();
    this.warpDescriptorVersion = stream.readInt32();
    this.warpData = new Descriptor();
    this.warpData.parse(stream);


    // TODO: 4 Byte * 4? - Float32
    console.log('TySh implementation is incomplete');
    this.left = stream.readInt32();
    this.top = stream.readInt32();
    this.right = stream.readInt32();
    this.bottom = stream.readInt32();

    /*
     this.left = stream.readFloat64();
     this.top = stream.readFloat64();
     this.right = stream.readFloat64();
     this.bottom = stream.readFloat64();

     stream.seek(-32);
     goog.global.console.log('64 or 32:',
     this.left,
     this.top,
     this.right,
     this.bottom,
     stream.readInt32(),
     stream.readInt32(),
     stream.readInt32(),
     stream.readInt32()
     );
     */

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint16(1); //version
    for(let i = 0; i < 6; i++) {
      stream.writeFloat64(this.transform[i]); //transform
    }
    stream.writeInt16(50); //textversion
    stream.writeUint32(16); //textdescriptor version
    this.textData.write(stream);
    stream.writeInt16(1); //warp version
    stream.writeUint32(16); //warp descriptor version
    this.warpData.write(stream);
    stream.writeInt32(this.left);
    stream.writeInt32(this.top);
    stream.writeInt32(this.right);
    stream.writeInt32(this.bottom);

    //padding
    // let length = this.getUnpaddedLength();
    // let paddingLength = 0;
    // if(0 != length % 4) {
    //   paddingLength = 4 - length % 4;
    // }
    // for(let i = 0; i < paddingLength; i++) {
    //   stream.writeUint8(0);
    // }
  }
}