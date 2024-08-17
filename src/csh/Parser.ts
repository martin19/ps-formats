import {registerDescriptorInfoBlocks} from "../../psd/Descriptor/DescriptorsInfoBlocks";
import {StreamReader} from "../../psd/StreamReader";
import {Descriptor, DescriptorItemType} from "../../psd/Descriptor";
import {DescriptorInfoBlockFactory} from "../../psd/Descriptor/DescriptorInfoBlock";
import {Objc} from "../../psd/Descriptor/Objc";
import {TEXT} from "../../psd/Descriptor/TEXT";
import {VirtualMemoryArray} from "../../psd/VirtualMemoryArray";
import {VlLs} from "../../psd/Descriptor/VlLs";
import {PathRecord} from "../../psd/PathRecord";
import {DescriptorUtils} from "../../psd/DescriptorUtils";
import {IShapeDef} from "../../common/src/PSTypes";

export interface ParserOptions {
  inputPosition?: number;
}

export class Parser {

  stream : StreamReader;

  constructor(input:Uint8Array, opt_param?:ParserOptions) {
    registerDescriptorInfoBlocks();

    if (!opt_param) {
      opt_param = {};
    }

    this.stream = new StreamReader(input, typeof opt_param.inputPosition === "undefined" ? 0 : opt_param.inputPosition);
  }

  parse() {
    let shapes:{[uuid:string]:IShapeDef} = {};

    let finished = false;
    const stream = this.stream;
    if (stream.readString(4) !== 'cush') {
      throw new Error('invalid signature');
    }
    const version = stream.readUint32(); //2 (version)
    const shapeCount = stream.readUint32();

    for(let i = 0; i < shapeCount; i++) {
      const shapeNameLen = stream.readUint32();
      const shapeName = stream.readWideString(shapeNameLen);
      while(stream.tell() % 4 !== 0) {
        stream.read(1);
      }
      const shape1 = stream.readUint32(); //1
      const bytes = stream.readUint32();
      let start = stream.tell();
      const shapeId = stream.readString(36);

      const pad = stream.readUint8();

      //not sure if this is correct
      const top = stream.readUint32();
      const left = stream.readUint32();
      const bottom = stream.readUint32();
      const right = stream.readUint32();

      const shape:IShapeDef = { name : shapeName, uuid : shapeId, paths : [], bbox : { top, left, bottom, right } };
      const records:PathRecord[] = [];
      while(stream.tell() + 1 - start < bytes) {
        const record = new PathRecord();
        record.parse(stream);
        records.push(record);
      }

      const paths = DescriptorUtils.getPaths(records, 1, 1);
      if(paths) shape.paths = paths.paths;
      shapes[shape.uuid] = shape;

      stream.seek(bytes, start);
    }
    return shapes;
  }
}