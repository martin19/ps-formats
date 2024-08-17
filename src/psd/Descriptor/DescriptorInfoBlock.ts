import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";


export interface IDescriptorInfoBlock {
  parse(stream : StreamReader, length? : number, header? : Header):void;
  write(stream : StreamWriter):void;
}

interface DIBConstructable {
  new ():any;
}

export class DescriptorInfoBlockFactory {
  static DescriptorInfoBlockTypes : {[id:string]:DIBConstructable} = {};
  static registerType(name : string, type : any) {
    DescriptorInfoBlockFactory.DescriptorInfoBlockTypes[name] = type;
  }
  static create(name:string):IDescriptorInfoBlock|null {
    if (typeof DescriptorInfoBlockFactory.DescriptorInfoBlockTypes[name] !== 'function') {
      console.error('OSType Key not implemented:', name);
      return null;
    }
    return new DescriptorInfoBlockFactory.DescriptorInfoBlockTypes[name]() as IDescriptorInfoBlock;
  }
}