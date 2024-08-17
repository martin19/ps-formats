import {StreamReader} from "../StreamReader";
import {StreamWriter} from "../StreamWriter";
import {ir1037} from "./ir1037";
import {ir1049} from "./ir1049";
import {ir1005} from "./ir1005";
import {ir1069} from "./ir1069";
import {ir1032} from "./ir1032";
export interface ImageResource {
  parse(stream : StreamReader):void;
  write(stream : StreamWriter):void;
  getLength():number;
}

export var ImageResourceMap : {[id:number]:any} = {
  1005 : ir1005, //resolution info structure
  1032 : ir1032, //(Photoshop 4.0) Grid and guides information.
  1037 : ir1037, //global angle
  1049 : ir1049, //global altitude
  1069 : ir1069, //Layer Selection ID(s)
};
