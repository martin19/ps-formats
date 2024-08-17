import {StreamReader} from "../psd/StreamReader";
import {VirtualMemoryArray} from "../psd/VirtualMemoryArray";
import {registerDescriptorInfoBlocks} from "../psd/Descriptor/DescriptorsInfoBlocks";


export interface ParserOptions {
  inputPosition?: number;
}

export class Parser {

  stream : StreamReader;
  version:number = 0;
  patternCount:number = 0;
  patterns : VirtualMemoryArray[] = [];

  /**
   * PSD parser
   * @param input input buffer.
   * @param opt_param option parameters.
   */
  constructor(input:Uint8Array, opt_param?:ParserOptions) {
    registerDescriptorInfoBlocks();

    if (!opt_param) {
      opt_param = {};
    }

    this.stream = new StreamReader(input, opt_param && opt_param.inputPosition ? opt_param.inputPosition : 0);
  }

  parse() {
    var stream = this.stream;
    
    if(stream.readString(4) !== "8BPT") {
      throw new Error("File does not seem to be a valid .pat file.");
    }
    this.version = stream.readUint16();
    if(this.version !== 1) {
      throw new Error("Cannot load pattern file version other than 1.");
    }
    this.patternCount = stream.readUint32();

    this.patterns = [];
    for(var i = 0; i < this.patternCount;i++) {
      var pattern = new VirtualMemoryArray();
      pattern.version = stream.readUint32();
      pattern.mode = stream.readUint32();
      pattern.horizontal = stream.readUint16();
      pattern.vertical = stream.readUint16();
      var strLen = stream.readUint32();
      pattern.name = stream.readWideString(strLen);
      pattern.id = stream.readPascalString().substring(0,36);
      pattern.parse(stream);
      this.patterns.push(pattern);
    }

    return this.patterns;
  }

}