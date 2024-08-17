import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./DescriptorInfoBlock";
import {EngineDataParser} from "../EngineDataParser";
import {StreamWriter} from "../StreamWriter";
import {EngineDataWriter} from "../EngineDataWriter";
import {IEngineData} from "../../../Text/carota/ImportExport/EngineData";

/**
 * Text Enginedata
 */
export class tdta implements IDescriptorInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  value:Array<number>|Uint8Array = new Uint8Array();
  data:Array<number>|Uint8Array = new Uint8Array();
  engineData:IEngineData|null = null;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length:number, header:Header) {

    this._offset = stream.tell();

    length = stream.readUint32();
    this.data = stream.read(length);

    this.engineData = (new EngineDataParser()).parse(this.data as Uint8Array);

    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter):void {
    if(!this.engineData) {
      console.warn("enginedata is null");
      return;
    }
    this.data = EngineDataWriter.write(this.engineData);
    stream.writeUint32(this.data.length);
    stream.write(this.data);
  }
}