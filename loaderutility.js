import YAML from "yaml";

async function getFile(cid, pinata) {


  if (!cid || typeof cid !== 'string') {
    console.error('Invalid CID: must be a non-empty string');
    return false;
  }

  if (!pinata || typeof pinata !== 'object') {
    console.error('Invalid pinata: must be a valid Pinata instance');
    return false;
  }

  let result;
  try {
    result = await pinata.gateways.public.get(cid);
  } catch (error) {
    console.error(`Failed to fetch file from Pinata: ${error.message}`);
    return error
  }

    const Data = result?.data;
   

    const ParsedData=YAML.parse(Data);
    console.log(ParsedData);
    
    return ParsedData
  
}




async function fetchmanifest(doc,pinata,folder){


try {

 const manifests = doc.manifests;
  if (!Array.isArray(manifests) || manifests.length === 0) {
    console.error('No manifests found in system document');
    return false;
  }

  let uploads = null;
  for (const obj of manifests) {
    //if (obj.id == targetManifestId && String(obj.folder) === folder) {
    if(String(obj.folder)===folder){
      uploads = obj.uploads;
      break;
    }
  }

  if (!uploads || !Array.isArray(uploads) || uploads.length === 0) {
    console.error(`No uploads found for ${folder}`);
    return false;
  }

 const yamlFile = uploads.find(file => file.name.endsWith(".yaml"));

if (!yamlFile) {
  console.error("No YAML file found");
  return false;
}

  return  await getFile(yamlFile.cid, pinata);
}catch(e){
    return e
}
}

export default async function Loader(folder, pinata, client) {


  if (!folder || typeof folder !== 'string') {

    console.error('Invalid folder: must be a non-empty string');
    return false;
  }

  if (!pinata || typeof pinata !== 'object') {
    console.error('Invalid pinata: must be a valid Pinata instance');
    return false;
  }

  if (!client || typeof client !== 'object') {
    console.error('Invalid client: must be a valid MongoDB client');
    return false;
  }


 try {

  let db;
  
  db = await client.db('ihub_db');
  let instructions_coll =  await db.collection('instructions');
  let capabilities_coll = await db.collection('capabilities');
  let constraints_coll = await db.collection("constraints");
  let policies_coll = await db.collection("policies");

  const [
    instructions_doc,
    capabilities_doc,
    constraints_doc,
    policies_doc
  ]=await Promise.all([
    instructions_coll.findOne({ owner: 'system' }),
    capabilities_coll.findOne({ owner: 'system' }),
    constraints_coll.findOne({ owner: 'system' }),
    policies_coll.findOne({owner:"system"})

  ])
    
    

const [
  instructions_manifest_result,
  capabilities_manifest_result,
  constraints_manifest_result,
  policies_manifest_result,
] = await Promise.all([
    fetchmanifest(instructions_doc, pinata,folder),
    fetchmanifest(capabilities_doc, pinata,folder),
    fetchmanifest(constraints_doc, pinata,folder),
    fetchmanifest(policies_doc, pinata,folder),
]);



return {

  "instructions":instructions_manifest_result,
  "capabilities":capabilities_manifest_result,
  "constraints": constraints_manifest_result,
  "policies": policies_manifest_result
}


 }catch(error){

  throw Error(error)

 }

}


