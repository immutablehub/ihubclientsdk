import { PinataSDK } from "pinata";
import { provideClient }  from "./dbconnection.js"
import Loader from "./loaderutility.js"
import  path from "path"
import  os from "os"
import fs from "fs"
import responseformat from "./responseformat.js";



async function getcreds() {

  let request=await fetch("RESOURCEURL/creds",{
    mode:"cors",
    method:"get",
    headers:{
      "content-type":"application/json"
    }
  })
  let response=await request.json()
  return {"jwt":response.jwt,"gateway":response.gateway}
  
}





async function getRuntime() {

  const { jwt, gateway } = await getcreds();
  const pinata = new PinataSDK({ pinataJwt: jwt, pinataGateway: gateway });
 
  const client = provideClient();
  return { pinata, client };
  
}


export default async  function isp(uri) {


 

    const cpuri=uri;
    if (!cpuri.startsWith("isp://")){
      throw new Error("Invalid ISP URI")
    }

    if (cpuri ==""){
      
      throw new Error("Empty ISP URI provided")

    }
    
    const protocolstrip=cpuri.replace("isp://","")
    const [folder]=protocolstrip.split("/")

    

     const { pinata, client } = await getRuntime();


     const context=await Loader(folder,pinata,client)

     
     return responseformat(

       context.instructions,
       context.capabilities,
       context.constraints,
       context.policies,

    )

}










