import {Parser} from "./Parser";

export class ASLLoader {

  constructor() {
  }

  loadASL(input: Uint8Array) {
    let parser = new Parser(input);
    return parser.parse();
  }
}