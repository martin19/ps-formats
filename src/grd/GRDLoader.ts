import {Parser} from "./Parser";

export class GRDLoader {

  constructor() {
  }

  loadGRD(input: Uint8Array) {
    let parser = new Parser(input);
    return parser.parse();
  }
}