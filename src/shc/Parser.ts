import {registerDescriptorInfoBlocks} from "../psd/Descriptor/DescriptorsInfoBlocks";
import {StreamReader} from "../psd/StreamReader";
import {IContourDef} from "../../Effects/GLTypes";
import {ContourDefDefault} from "../../Effects/GLDefaults";

export interface ParserOptions {
  inputPosition?: number;
}

/**
 * SHC parser
 * @param input input buffer.
 * @param opt_param option parameters.
 */
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
    let contours:IContourDef[] = [];

    let finished = false;
    const stream = this.stream;
    if (stream.readString(4) !== '8BFS') {
      throw new Error('invalid signature');
    }

    let version = stream.readUint16();
    let contourCount = stream.readUint32();
    for(let i = 0; i < contourCount; i++) {
      let contour:IContourDef = { name:"", x:[], y:[], c:[] };

      const version = stream.readUint32();
      const len = stream.readUint32();
      contour.name = stream.readWideString(len);

      const pad = stream.readUint16();
      const pointCount = stream.readUint16();
      for (let j = 0; j < pointCount; j++) {
        let x = stream.readUint16();
        let y = stream.readUint16();
        contour.x.push(x);
        contour.y.push(y);
      }
      if (version === 2) {
        for (let j = 0; j < pointCount; j++) {
          let continuous = stream.readUint8() === 1;
          contour.c.push(continuous);
        }
      }
      contour.minInputRange = stream.readUint32();
      contour.maxInputRange = stream.readUint32();
      contours.push(contour);
    }

    return contours;
  }
}