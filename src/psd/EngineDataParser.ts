
////////////////////////////////

// helper fun
import {IEngineData} from "../../Text/carota/ImportExport/EngineData";

function isArray(o:any){
  return Object.prototype.toString.call(o) === '[object Array]';
}

function photoshopUtf16ByteArrayToString(w:Array<number>):String {
  let a = "";
  let unescaped:Array<number> = [];
  w.splice(0,2); //Remove BOM
  for(let i = 0; i < w.length; ) {
    let char = w[i++];
    char == 92 ? unescaped.push(w[i++]) : unescaped.push(char);
  }
  for(let i = 0; i < unescaped.length; i+= 2) {
    a += String.fromCharCode(unescaped[i] << 8 | unescaped[i+1]);
  }
  return a;
}

/**
 * @deprecated
 * @param w
 */
function decodeUtf16(w:Array<number>) {

  //TODO: Remove BOM - interpret bom correctly
  let w16:Array<number> = [];
  for(let i = 0; i < w.length;i+=2) {
    w16.push((0x00FF|(w[i]<<8))&(0xFF00|w[i+1]));
  }
  w16.splice(0,1);
  w = w16;

  let i = 0;
  let len = w.length;
  let w1:number, w2:number;
  let charCodes:Array<number> = [];
  while (i < len) {
    let w1 = w[i++];
    if ((w1 & 0xF800) !== 0xD800) { // w1 < 0xD800 || w1 > 0xDFFF
      charCodes.push(w1);
      continue;
    }
    if ((w1 & 0xFC00) === 0xD800) { // w1 >= 0xD800 && w1 <= 0xDBFF
      throw new RangeError('Invalid octet 0x' + w1.toString(16) + ' at offset ' + (i - 1));
    }
    if (i === len) {
      throw new RangeError('Expected additional octet');
    }
    w2 = w[i++];
    if ((w2 & 0xFC00) !== 0xDC00) { // w2 < 0xDC00 || w2 > 0xDFFF)
      throw new RangeError('Invalid octet 0x' + w2.toString(16) + ' at offset ' + (i - 1));
    }
    charCodes.push(((w1 & 0x3ff) << 10) + (w2 & 0x3ff) + 0x10000);
  }
  return String.fromCharCode.apply(String, charCodes);
}

type Matcher = (text:string)=>{match:boolean;parse:()=>any};
//regexes
const regTab = /^\t+/g;
const regHashStart = /^<<$/;
const regHashEnd = /^>>$/;
const regMultiLineArrayStart = /^\/(\w+) \[$/;
const regMultiLineArrayEnd = /^\]$/;
const regProperty = /^\/([A-Z0-9]+)$/i;
const regPropertyWithData = /^\/([A-Z0-9]+)\s((.|\r)*)$/i;
const regBoolean = /^(true|false)$/;
const regNumber = /^-?\d+$/;
const regNumberWithDecimal = /^(-?\d*)\.(\d+)$/;
const regSingleLineArray = /^\[(.*)\]$/;
const regString = /^\(((.|\r)*)\)$/;

export class EngineDataParser {

  nodeStack : any[] = [];
  propertyStack : any[] = [];
  currentNode : {[key:string]:any} = {};

  MATCH_TYPE : {[key:string]:Matcher};

  constructor() {
    this.MATCH_TYPE = {
      "hashStart": this.hashStart,
      "hashEnd": this.hashEnd,
      "multiLineArrayStart": this.multiLineArrayStart,
      "multiLineArrayEnd": this.multiLineArrayEnd,
      "property": this.property,
      "propertyWithData": this.propertyWithData,
      "singleLineArray": this.singleLineArray,
      "boolean": this.boolean,
      "number": this.number,
      "numberWithDecimal": this.numberWithDecimal,
      "string": this.string
    };
  }

  parse(engineData:Uint8Array) {
    this.nodeStack = [];
    this.propertyStack = [];
    this.currentNode = {};
    this.textReg(EngineDataParser.textSegment(EngineDataParser.codeToString(engineData)));
    return this.currentNode["undefined"] as IEngineData;
  }


  static codeToString(engineData:Uint8Array){
    return String.fromCharCode.apply(null, engineData);
  }


  static textSegment(text:string){
    return text.split('\n');
  }

  textReg(textArr:Array<string>) {
    textArr.map((currentText, index)=>{
      this.typeMatch(currentText.replace(regTab, ''));
    });
  }

  typeMatch(currentText:string){
      for (let currentType in this.MATCH_TYPE) {
        if(this.MATCH_TYPE.hasOwnProperty(currentType)) {
          let t = this.MATCH_TYPE[currentType].apply(this,[currentText]);
          if (t.match){
              return t.parse();
          }
        }
      }
      return currentText;
  }

  // node handle
  stackPush(node:Array<any>|{}){
    this.nodeStack.push(this.currentNode);
    this.currentNode = node;
  }

  updateNode(){
    let node = this.nodeStack.pop();
    if (isArray(node)){
      node.push(this.currentNode);
    } else {
      node[this.propertyStack.pop()] = this.currentNode;
    }
    this.currentNode = node;
  }

  pushKeyValue(key:string,value:any){
    this.currentNode[key] = value;
  }

  // tyep reg
  hashStart(text:string) {
    return {
      match: regHashStart.test(text),
      parse: ()=>{
        this.stackPush({});
      }
    }
  }

  hashEnd(text:string) {
    return {
      match: regHashEnd.test(text),
      parse: ()=>{
        this.updateNode();
      }
    }
  }

  multiLineArrayStart(text:string) {
    return {
      match: regMultiLineArrayStart.test(text),
      parse: ()=>{
        let match = text.match(regMultiLineArrayStart);
        if(match) {
          this.propertyStack.push(match[1]);
          this.stackPush([]);
        }
      }
    }
  }

  multiLineArrayEnd(text:string) {
    return {
      match: regMultiLineArrayEnd.test(text),
      parse: ()=>{
        this.updateNode();
      }
    }
  }

  property(text:string) {
    return {
      match: regProperty.test(text),
      parse: ()=>{
        let match = text.match(regProperty);
        if(match) {
          this.propertyStack.push(match[1]);
        }
      }
    }
  }

  propertyWithData(text:string) {
    return {
      match: regPropertyWithData.test(text),
      parse: ()=>{
        let match = text.match(regPropertyWithData);
        if(match) {
          this.pushKeyValue(match[1], this.typeMatch(match[2]));
        }
      }
    }
  }

  // value reg
  boolean(text:string) {
    return {
      match: regBoolean.test(text),
      parse: ()=>{
        return text === 'true' ? true : false;
      }
    }
  }

  number(text:string) {
    return {
      match: regNumber.test(text),
      parse: ()=> {
        return Number(text);
      }
    }
  }

  numberWithDecimal(text:string) {
    return {
      match: regNumberWithDecimal.test(text),
      parse: ()=> {
        return Number(text);
      }
    }
  }

  singleLineArray(text:string) {
    //Case it seems that only a single line array of digital array

    return {
      match: regSingleLineArray.test(text),
      parse: ()=> {
        let match = text.match(regSingleLineArray);
        if(match) {
          let items = match[1].trim().split(' ');
          let tempArr:Array<any> = [];
          for (let i = 0, l = items.length; i < l; i++) {
            tempArr.push(this.typeMatch(items[i]));
          }
          return tempArr;
        }
      }
    }
  }

  string(text:string) {
    //the text in editor has some encoding issues
    return {
      match: regString.test(text),
      parse: ()=> {
        let match = text.match(regString);
        if(match) {
          let txt = match[1];
          let bf:Array<any> = [];
          for (let i = 0, l = txt.length; i < l; i++) {
            bf.push(txt.charCodeAt(i));
          }
          return photoshopUtf16ByteArrayToString(bf);
        }
      }
    }
  }



}
