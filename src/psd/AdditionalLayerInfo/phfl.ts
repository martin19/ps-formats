import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {AdjustmentDefaultPhotoFilter} from "../../../Adjustments/GLAdjustmentDefaults";

interface IPhotoFilterSettings {
  use : "filter"|"color";
  color : {X:number,Y:number,Z:number};
  density : number;
  preserveLuminosity : boolean;
}

export class phfl implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  settings : IPhotoFilterSettings = _.cloneDeep(AdjustmentDefaultPhotoFilter);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:IPhotoFilterSettings) {
    let _phfl = new phfl();
    _phfl.settings = settings;
    return _phfl;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.settings = {
      use : "color",
      color : { X : 0, Y : 0, Z : 0 },
      density : 0,
      preserveLuminosity : true
    };
    this.version = stream.readUint16();
    if(this.version == 3) {
      let x = stream.readInt32();
      let y = stream.readInt32();
      let z = stream.readInt32();
      //TODO: https://forums.adobe.com/thread/2347831?sr=inbox
      let XYZ = { X:x/32768, Y:y/32768, Z:z/32768 };
      this.settings.color.X = XYZ.X;
      this.settings.color.Y = XYZ.Y;
      this.settings.color.Z = XYZ.Z;
    } else {
      //TODO: according to docs the color components are in given color space
      let colorSpace = stream.readUint16();
      this.settings.color.X = stream.readUint16();
      this.settings.color.Y = stream.readUint16();
      this.settings.color.Z = stream.readUint16();
      let black = stream.readUint16();
    }
    this.settings.density = stream.readUint32();
    this.settings.preserveLuminosity = stream.readUint8() == 1;
    stream.seek(1);

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeUint16(3);
    stream.writeInt32(this.settings.color.X*32768);
    stream.writeInt32(this.settings.color.Y*32768);
    stream.writeInt32(this.settings.color.Z*32768);
    stream.writeUint32(this.settings.density);
    stream.writeUint8(this.settings.preserveLuminosity ? 1 : 0);
  }
  
  getLength() {
    this._length = 20;
    return this._length;
  }

}