import {Parser} from "./Parser";

export class SHCLoader {

  constructor() {
  }

  loadSHC(input: Uint8Array) {
    let parser = new Parser(input);
    return parser.parse();
  }
}