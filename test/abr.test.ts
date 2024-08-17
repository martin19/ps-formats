import {readFileSync} from "fs";
import * as chai from 'chai';
import { expect } from 'chai';
import {ABRLoader} from "../src/abr/ABRLoader";


describe("abr", ()=>{
  it("loads abr file", () => {
    const loader = new ABRLoader();
    //const file = readFileSync("../psdlib/other/swatches/swatches.ase");

    {
      const file = readFileSync("../data/brushes.abr");
      let swatchDefs = loader.loadABR(file);
      expect(Object.keys(swatchDefs)).to.have.length(11);
    }
  });
})