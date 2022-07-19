import {LoadableImageRenderer} from "@datagrok-libraries/gridext/src/renderer/LoadableImageRenderer";
import {timeout} from "rxjs/operators";
import {SchedulerLike} from "rxjs";

export class IC50Renderer extends LoadableImageRenderer {

  createImage(strImageId : string, nWImage : number, nHImage : number, fnImageRadyCallback : any) : void {

    let arImageIds =  null;
    try{arImageIds = strImageId.split("\n");}
    catch(e) {
      console.error("Invalid Curve id: '" + strImageId + "'");
      throw e;
    }

    const img = new Image(nWImage, nHImage);
    img.onload = function(){
     // setTimeout(() => {
        fnImageRadyCallback(strImageId, img);
      //}, 30000);

    };

    img.onerror = function(){
      fnImageRadyCallback(strImageId, null);
    };

    const bErr = Math.random() < 0.5;

    let strURL = "";
    let nImageCount = arImageIds.length;
    if(nImageCount === 1)
    {
      if(arImageIds[0].length > 0)
        strURL = "";
      else return;
    }
    else
    {
      if(nImageCount > 20)
        nImageCount = 20;

      strURL = "";
      let str = "";
      for(var n=0; n<nImageCount; ++n)
      {
        str += "&id" + (n+1) + "=" + arImageIds[n];
      }
      strURL += str;
    }

    img.src = strURL;
  }
}
