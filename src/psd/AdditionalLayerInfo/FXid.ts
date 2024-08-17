import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";

export class FXid implements IAdditionalLayerInfoBlock {

  version : number = 0;

  parse(stream:StreamReader, length?:number, header?:Header) {
    this.version = stream.readUint32();
    const length1 = stream.readUint64();
    const id = stream.readPascalString();
    const version = stream.readUint32();
    const length2 = stream.readUint64();
    const top = stream.readUint32();
    const left = stream.readUint32();
    const bottom = stream.readUint32();
    const right = stream.readUint32();
    const depth = stream.readUint32();
    const maxChannels = stream.readUint32();
  }


  write(stream:StreamWriter):void {
    //TODO:
    throw new Error("not implemented");
  }

  getLength():number {
    //TODO:
    throw new Error("not implemented");
  }
}
