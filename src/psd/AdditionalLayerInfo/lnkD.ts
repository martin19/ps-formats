import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
import {ILinkedLayerInfo} from "../../../Effects/GLTypes";
export class lnkD implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  dataSize : number = 0;
  linkedLayerInfos : ILinkedLayerInfo[] = [];

  constructor() {}

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  private readUint64(stream:StreamReader):number {
    stream.readUint32();
    return stream.readUint32();
  }

  parse(stream:StreamReader, length:number, header?:Header) {
    this._offset = stream.tell();

    do {
      let dataSize = this.readUint64(stream);
      if(dataSize%4 !== 0) dataSize += 4-(dataSize%4);
      const linkedLayerInfo:ILinkedLayerInfo = {
        uuid : "",
        fileName : ""
      };
      const offset = stream.tell();
      linkedLayerInfo.type = stream.readString(4) as "liFD"|"liFE"|"liFA";
      linkedLayerInfo.version = stream.readUint32();
      linkedLayerInfo.uuid = stream.readPascalString();
      const len = stream.readUint32();
      linkedLayerInfo.fileName = stream.readWideString(len);
      linkedLayerInfo.fileType = stream.readString(4);
      linkedLayerInfo.fileCreator = stream.readString(4);
      const len2 = this.readUint64(stream);
      linkedLayerInfo.fileOpenDescriptor = stream.readUint8();
      if(linkedLayerInfo.fileOpenDescriptor) {
        const dummy = stream.readUint32();
        linkedLayerInfo.fileParameterDescriptor = new Descriptor();
        linkedLayerInfo.fileParameterDescriptor.parse(stream);
      }
      if(linkedLayerInfo.type === "liFE") {
        linkedLayerInfo.linkedFileParameterDescriptor = new Descriptor();
        linkedLayerInfo.linkedFileParameterDescriptor.parse(stream);
      }
      if(linkedLayerInfo.type === "liFE" && linkedLayerInfo.version > 3) {
        linkedLayerInfo.timestamp = {
          year : stream.readUint32(),
          month : stream.readUint8(),
          day : stream.readUint8(),
          hour : stream.readUint8(),
          minute : stream.readUint8(),
          seconds : stream.readFloat64()
        }
      }
      if(linkedLayerInfo.type === "liFE") {
        linkedLayerInfo.fileSize = this.readUint64(stream);
      }
      if(linkedLayerInfo.type === "liFA") {
        const allZeros = this.readUint64(stream);
      }
      if(linkedLayerInfo.type === "liFD") {
        linkedLayerInfo.fileData = stream.read(dataSize - (stream.tell()-offset));
      }
      // if(linkedLayerInfo.version >= 5) {
      //   const len = stream.readUint32();
      //   linkedLayerInfo.childDocumentId = stream.readWideString(len);
      // }
      // if(linkedLayerInfo.version >= 6) {
      //   linkedLayerInfo.assetModTime = stream.readInt16();
      // }
      // if(linkedLayerInfo.version >= 7) {
      //   linkedLayerInfo.assetLocked = stream.readUint8() === 1;
      // }
      // if(linkedLayerInfo.type === "liFD" && linkedLayerInfo.version === 2) {
      //   linkedLayerInfo.fileData = stream.read(dataSize);
      // }

      this.linkedLayerInfos.push(linkedLayerInfo);
      stream.seek(offset + dataSize, 0);
    } while(stream.tell() - this._offset < length-8)


    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    throw new Error("not implemented");
  }

}