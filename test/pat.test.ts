import {readFileSync} from "fs";
import * as chai from 'chai';
import { expect } from 'chai';
import {PATLoader} from "../src/pat/PATLoader";


describe("grd", ()=>{
  it("loads grd file", () => {
    const loader = new PATLoader({});

    {
      const file = readFileSync("../data/basic.pat");
      let patterns = loader.loadPAT(file);
      //expect(Object.keys(swatchDefs)).to.have.length(11);
    }
  });
})