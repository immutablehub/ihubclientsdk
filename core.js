import { PinataSDK } from "pinata";
import { provideClient }  from "./dbconnection.js"
import Loader from "./loaderutility.js"
import  path from "path"
import  os from "os"
import fs from "fs"
import Runner from "./runner.js";



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



export default async  function app(agentpkg,inputs) {

   //const [folder]=protocolstrip.split("")

    const { pinata, client } = await getRuntime();
    const spec=await Loader(agentpkg,pinata,client)


    console.log("spec in core")
    console.log(spec.spec)
    const agentResponse=await Runner(spec.spec,inputs)
    console.log("agent response")
    //console.log(agentResponse)
    return agentResponse;
     

}










