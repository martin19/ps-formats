import {readFileSync} from "fs";
import * as chai from 'chai';
import { expect } from 'chai';
import {SHCLoader} from "../src/shc/SHCLoader";


describe("grd", ()=>{
  it("loads grd file", () => {
    const loader = new SHCLoader();

    {
      const file = readFileSync("../data/contours.pat");
      let patterns = loader.loadSHC(file);
      //expect(Object.keys(swatchDefs)).to.have.length(11);
    }
  });
})