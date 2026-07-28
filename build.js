import esbuild from 'esbuild';


await esbuild.build({
  entryPoints: ["index.js"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  minify:true,
  packages: "external",   // don't bundle node_modules
}).catch(()=>process.exit());
