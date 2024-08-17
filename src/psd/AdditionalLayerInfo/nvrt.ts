import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
export class nvrt implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();
    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    //TODO:
    // stream.writeUint32(this.version);
    // this.descriptor.write(stream);
  }
  
  getLength() {
    this._length = 0;
    return this._length;
  }

}