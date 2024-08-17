import {readFileSync} from "fs";
import * as chai from 'chai';
import { expect } from 'chai';
import {ASELoader} from "../src/ase/ASELoader";


describe("ase", ()=>{
  it("loads ase file", () => {
    const loader = new ASELoader();
    //const file = readFileSync("../psdlib/other/swatches/swatches.ase");

    {
      const file = readFileSync("../data/acrylics.ase");
      let swatchDefs = loader.loadASE(file);
      expect(Object.keys(swatchDefs)).to.have.length(11);
    }
  });
})