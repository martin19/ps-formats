import {Parser} from "./pat/Parser";
import {VirtualMemoryArray} from "./psd/VirtualMemoryArray";
export interface PATLoaderOptions {
  
}

//http://registry.gimp.org/files/ps-pat-load_1.c
export class PATLoader {

  constructor(options:PATLoaderOptions) {
  }

  loadPAT(input : Uint8Array) {
    let parser = new Parser(input);
    let patterns:Array<VirtualMemoryArray> = [];
    try {
      patterns = parser.parse();
    } catch (e) {
      console.log("parsing of pat file failed.")
    }
    return patterns;
  }
}