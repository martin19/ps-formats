import {readFileSync} from "fs";
import * as chai from 'chai';
import { expect } from 'chai';
import {CSHLoader} from "../src/csh/CSHLoader";


describe("csh", ()=>{
  it("loads csh file", () => {
    const loader = new CSHLoader();
    //const file = readFileSync("../psdlib/other/swatches/swatches.ase");

    {
      const file = readFileSync("../data/basic.grd");
      let csh = loader.loadCSH(file);
      //expect(Object.keys(swatchDefs)).to.have.length(11);
    }
  });
})