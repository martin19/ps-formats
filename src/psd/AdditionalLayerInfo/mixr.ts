import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {AdjustmentDefaultChannelMixer} from "../../../Adjustments/GLAdjustmentDefaults";

//TODO: adjust channel mixer dialog. end 2 end
interface IChannelMixerSettings {
  isMonochrome : boolean;
  outputs :{
    c1:number;
    c2:number;
    c3:number;
    c4:number;
    constant:number;
  }[]
}

export class mixr implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  settings : IChannelMixerSettings = _.cloneDeep(AdjustmentDefaultChannelMixer);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:IChannelMixerSettings) {
    let _mixr = new mixr();
    _mixr.settings = settings;
    return _mixr;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.version = stream.readUint16();
    this.settings = {
      isMonochrome : stream.readUint16() == 1,
      outputs : []
    };
    for(let i = 0; i < 4; i++) {
      let output = {
        c1 : stream.readInt16(),
        c2 : stream.readInt16(),
        c3 : stream.readInt16(),
        c4 : stream.readInt16(),
        constant : stream.readInt16(),
      };
      this.settings.outputs.push(output);
    }

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeUint16(1);
    stream.writeUint16(this.settings.isMonochrome ? 1 : 0);
    for(let i = 0; i < 4; i++) {
      const output = this.settings.outputs[i];
      stream.writeInt16(output.c1);
      stream.writeInt16(output.c2);
      stream.writeInt16(output.c3);
      stream.writeInt16(output.c4);
      stream.writeInt16(output.constant);
    }
  }

}