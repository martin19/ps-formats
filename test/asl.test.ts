import {readFileSync} from "fs";
import * as chai from 'chai';
import { expect } from 'chai';
import {ASLLoader} from "../src/asl/ASLLoader";


describe("grd", ()=>{
  it("loads grd file", () => {
    const loader = new ASLLoader();

    {
      const file = readFileSync("../data/styles.asl");
      let data = loader.loadASL(file);
      //expect(Object.keys(swatchDefs)).to.have.length(11);
    }
  });
})