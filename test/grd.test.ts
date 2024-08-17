import {readFileSync} from "fs";
import * as chai from 'chai';
import { expect } from 'chai';
import {GRDLoader} from "../src/grd/GRDLoader";


describe("grd", ()=>{
  it("loads grd file", () => {
    const loader = new GRDLoader();
    //const file = readFileSync("../psdlib/other/swatches/swatches.ase");

    {
      const file = readFileSync("../data/basic.grd");
      let gradientDefs = loader.loadGRD(file);
      //expect(Object.keys(swatchDefs)).to.have.length(11);
    }
  });
})