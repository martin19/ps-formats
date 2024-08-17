import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
import {hue2} from "./hue2";

interface IColorBalance {
  [s:string]:number[];
}

interface IColorBalanceSettings {
  preserveLuminosity : boolean;
  colorBalance : IColorBalance;
}

export class blnc implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  settings : IColorBalanceSettings = {
    preserveLuminosity : false,
    colorBalance : {}
  };

  static create(settings:IColorBalanceSettings) {
    let _blnc = new blnc();
    _blnc.settings = settings;
    return _blnc;
  }

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();
    this.settings = {
      colorBalance : {
        "shadows": [0, 0, 0],
        "midtones": [0, 0, 0],
        "highlights": [0, 0, 0]
      },
      preserveLuminosity : false
    };
    this.settings.colorBalance["shadows"][0] = stream.readInt16();
    this.settings.colorBalance["shadows"][1] = stream.readInt16();
    this.settings.colorBalance["shadows"][2] = stream.readInt16();
    this.settings.colorBalance["midtones"][0] = stream.readInt16();
    this.settings.colorBalance["midtones"][1] = stream.readInt16();
    this.settings.colorBalance["midtones"][2] = stream.readInt16();
    this.settings.colorBalance["highlights"][0] = stream.readInt16();
    this.settings.colorBalance["highlights"][1] = stream.readInt16();
    this.settings.colorBalance["highlights"][2] = stream.readInt16();
    this.settings.preserveLuminosity = (stream.readUint8() == 1);
    stream.seek(1);

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeInt16(this.settings.colorBalance["shadows"][0]);
    stream.writeInt16(this.settings.colorBalance["shadows"][1]);
    stream.writeInt16(this.settings.colorBalance["shadows"][2]);
    stream.writeInt16(this.settings.colorBalance["midtones"][0]);
    stream.writeInt16(this.settings.colorBalance["midtones"][1]);
    stream.writeInt16(this.settings.colorBalance["midtones"][2]);
    stream.writeInt16(this.settings.colorBalance["highlights"][0]);
    stream.writeInt16(this.settings.colorBalance["highlights"][1]);
    stream.writeInt16(this.settings.colorBalance["highlights"][2]);
    stream.writeUint8(this.settings.preserveLuminosity ? 1 : 0);
    stream.writeUint8(0);
  }
  
  getLength() {
    this._length = 20;
    return this._length;
  }

}