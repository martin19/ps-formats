import {StreamReader} from "../StreamReader";
import {StreamWriter} from "../StreamWriter";
import {clbl} from "./clbl";
import {Header} from "../Header";
import {fxrp} from "./fxrp";
import {infx} from "./infx";
import {iOpa} from "./iOpa";
import {knko} from "./knko";
import {lclr} from "./lclr";
import {lfx2} from "./lfx2";
import {lnsr} from "./lnsr";
import {lrFX} from "./lrFX";
import {lsct} from "./lsct";
import {lspf} from "./lspf";
import {luni} from "./luni";
import {lyid} from "./lyid";
import {lyvr} from "./lyvr";
import {Patt} from "./Patt";
import {shmd} from "./shmd";
import {SoLd} from "./SoLd";
import {TySh} from "./TySh";
import {vmsk} from "./vmsk";
import {PlLd} from "./PlLd";
import {lmgm} from "./lmgm";
import {vmgm} from "./vmgm";
import {tsly} from "./tsly";
import {brst} from "./brst";
//adjustment layers
import {SoCo} from "./SoCo";
import {GdFl} from "./GdFl";
import {PtFl} from "./PtFl";
import {levl} from "./levl";
import {curv} from "./curv";
import {blnc} from "./blnc";
import {brit} from "./brit";
import {hue2} from "./hue2";
import {selc} from "./selc";
import {mixr} from "./mixr";
import {grdm} from "./grdm";
import {phfl} from "./phfl";
import {nvrt} from "./nvrt";
import {thrs} from "./thrs";
import {post} from "./post";
import {vibA} from "./vibA";
import {expA} from "./expA";
import {pths} from "./pths";
import {vscg} from "./vscg";
import {vstk} from "./vstk";
import {sn2P} from "./sn2P";
import {vsms} from "./vsms";
import {vogk} from "./vogk";
import {FMsk} from "./FMsk";
import {cinf} from "./cinf";
import {lnkD} from "./lnkD";
import {FXid} from "./FXid";
import {Txt2} from "./Txt2";
import {lnkE} from "./lnkE";



export interface IAdditionalLayerInfoBlock {
  parse(stream : StreamReader, length? : number, header? : Header):void;
  write(stream : StreamWriter, header?:Header):void;
}

export const AdditionalLayerInfoBlock : {[id:string]:any} = {
  'clbl' : clbl,
  'fxrp' : fxrp,
  'infx' : infx,
  'iOpa' : iOpa,
  'knko' : knko,
  'lclr' : lclr,
  'lfx2' : lfx2,
  'lnsr' : lnsr,
  'lrFX' : lrFX,
  'lsct' : lsct,
  'lspf' : lspf,
  'luni' : luni,
  'lyid' : lyid,
  'lyvr' : lyvr,
  'Patt' : Patt,
  'PlLd' : PlLd,
  'shmd' : shmd,
  'SoLd' : SoLd,
  'TySh' : TySh,
  'Txt2' : Txt2,
  'vmsk' : vmsk,
  'lmgm' : lmgm,
  'vmgm' : vmgm,
  'tsly' : tsly,
  'brst' : brst,
  'FMsk' : FMsk,
  'cinf' : cinf,
  //path drawing
  'vsms' : vsms,
  'pths' : pths,
  'vscg' : vscg,
  'vstk' : vstk,
  'sn2P' : sn2P,
  'vogk' : vogk,
  //Adjustment layers
  'SoCo' : SoCo,
  'GdFl' : GdFl,
  'PtFl' : PtFl,
  'levl' : levl,
  'curv' : curv,
  'blnc' : blnc,
  'brit' : brit,
  'hue2' : hue2,
  'selc' : selc,
  'mixr' : mixr,
  'grdm' : grdm,
  'phfl' : phfl,
  'nvrt' : nvrt,
  'thrs' : thrs,
  'post' : post,
  'vibA' : vibA,
  'expA' : expA,
  //Smart objects
  'lnkD' : lnkD,
  'lnkE' : lnkE,
  'lnk2' : lnkD,
  'lnk3' : lnkD,
  'FXid' : FXid,
  'FEid' : FXid
};