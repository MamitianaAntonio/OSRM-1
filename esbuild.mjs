import * as esbuild from "esbuild"

//  "local": "node esbuild.mjs"

async function build() {
  await esbuild
    .build({
      format: "esm",
      bundle: true,
      write: true,
      minify: false,
      entryPoints: {
        'index': './src/css/main.css',
        'build': 'app.js',
      },
      platform: "browser",
      loader: {
        ".scss": "css",
        ".png": "dataurl",
        ".gif": "dataurl",
        ".svg": "dataurl",
        ".eot": "dataurl",
        ".ttf": "dataurl",
        ".woff2": "dataurl",
        ".woff": "dataurl",
        ".wasm": "dataurl",
        ".html": "text",
      },
      outdir: "dist/",
      logLevel: "debug",
      target: ["chrome58", "firefox57", "safari11"],
      outExtension: {
        ".css": ".css",
      },
    })
    .then(() => {
      console.log("watch finished")
    })
}

build()
