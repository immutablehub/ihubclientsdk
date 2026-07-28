export default async function responseformat(
    name,
    description,
    instructions,
    capabilities,
    constraints,
    policies
){


    return {

    "name":name,
    "version":0.1,
    "description":description,
    "context":{
  
        "instructions":JSON.stringify(instructions,null,2),
        "capabilities":JSON.stringify(capabilities,null,2),
        "constraints":JSON.stringify(constraints,null,2),
        "policies":JSON.stringify(policies,null,2)
  
        }
}    


}
