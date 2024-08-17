import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {Descriptor, IDescriptorItem} from "../Descriptor";
import {VlLs} from "../Descriptor/VlLs";
import {Objc} from "../Descriptor/Objc";
import {DescriptorUtils} from "../DescriptorUtils";

export interface IVectorOriginationData {
  keyOriginType? : number;
  keyOriginResolution? : number;
  keyOriginShapeBBox? : { unitValueQuadVersion : number, Top : number, Left : number, Btom : number, Rght : number };
  keyShapeInvalidated? : boolean;
  keyOriginIndex? : number;
}

export class vogk implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  version:number = 0;
  version2:number = 0;
  descriptor:Descriptor = new Descriptor();
  vectorOriginData:IVectorOriginationData = {};

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length:number, header:Header) {
    let limit:number = stream.tell() + length;

    this._offset = stream.tell();
    this.version = stream.readUint32();
    this.version2 = stream.readUint32();

    this.descriptor = new Descriptor();
    this.descriptor.parse(stream);

    this.vectorOriginData = {};

    this.descriptor.item.forEach((di:IDescriptorItem)=> {
      if(di.key === "keyDescriptorList") {
        for (let j of (di.data as VlLs).item) {
          for (let k of (j.data as Objc).value.item) {
            if(k.key === "keyOriginType") this.vectorOriginData.keyOriginType = DescriptorUtils.getLong(k);
            if(k.key === "keyOriginResolution") this.vectorOriginData.keyOriginResolution = DescriptorUtils.getDoub(k);
            if(k.key === "keyOriginShapeBBox") this.vectorOriginData.keyOriginShapeBBox = DescriptorUtils.getUnitRect(k);
            if(k.key === "keyShapeInvalidated") this.vectorOriginData.keyShapeInvalidated = DescriptorUtils.getBool(k);
            if(k.key === "keyOriginIndex") this.vectorOriginData.keyOriginIndex = DescriptorUtils.getLong(k);
          }
        }
      }
    });

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    //TODO:
    throw new Error("not implemented");
  }
}