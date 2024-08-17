import {Parser} from "./Parser";

export class CSHLoader {

  constructor() {
  }

  loadCSH(input: Uint8Array) {
    let parser = new Parser(input);
    return parser.parse();
  }
}