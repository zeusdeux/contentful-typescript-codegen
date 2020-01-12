import render from "./renderers/render"
import renderFieldsOnly from "./renderers/renderFieldsOnly"
import path from "path"
import { outputFileSync } from "fs-extra"

const meow = require("meow")

const cli = meow(
  `
  Usage
    $ contentful-typescript-codegen --output <file> <options>

  Options
    --output,        -o  Where to write to
    --poll,          -p  Continuously refresh types
    --prefix         -x  Prefix for generated interfaces (default: "")
    --content-types  -c  Comma separated list of content types to fetch
    --interval N,    -i  The interval in seconds at which to poll (default: 15)
    --render-imports -r  Comma separated list containing asset, entry and document (default: entry unless --fields-only in which case default: "")
    --render-locales -l  Render all locales union and default locale (default: false)
    --render-cts     -t  Render content type ids union (default: false)
    --fields-only        Output a tree that _only_ ensures fields are valid
                         and present, and does not provide types for Sys,
                         Assets, or Rich Text. This is useful for ensuring raw
                         Contentful responses will be compatible with your code. (default: false)

  Examples
    $ contentful-typescript-codegen -o src/@types/generated/contentful.d.ts
`,
  {
    flags: {
      output: {
        type: "string",
        alias: "o",
        required: true,
      },
      poll: {
        type: "boolean",
        alias: "p",
        required: false,
      },
      prefix: {
        type: "string",
        alias: "x",
        required: false,
      },
      contentTypes: {
        type: "string",
        alias: "c",
        required: false,
      },
      interval: {
        type: "string",
        alias: "i",
        required: false,
      },
      renderImports: {
        type: "string",
        alias: "r",
        required: false,
      },
      renderLocales: {
        type: "boolean",
        alias: "l",
        required: false,
      },
      renderCts: {
        type: "boolean",
        alias: "t",
        require: false,
      },
      fieldsOnly: {
        type: "boolean",
        required: false,
      },
    },
  },
)

async function runCodegen(outputFile: string) {
  const getEnvironmentPath = path.resolve(process.cwd(), "./getContentfulEnvironment.js")
  const getEnvironment = require(getEnvironmentPath)
  const environment = await getEnvironment()
  const query: { [key: string]: any } = {
    limit: 1000,
  }
  if (cli.flags.contentTypes) {
    query["sys.id[in]"] = cli.flags.contentTypes
      .split(",")
      .map((ct: string) => ct.trim())
      .join(",")
  }

  const contentTypes = await environment.getContentTypes(query)
  const locales = await environment.getLocales()
  const outputPath = path.resolve(process.cwd(), outputFile)
  const imports = cli.flags.renderImports
    ? cli.flags.renderImports.split(",").map((i: string) => i.trim().toLowerCase())
    : ["entry"]

  let output
  if (cli.flags.fieldsOnly) {
    output = await renderFieldsOnly(contentTypes.items, cli.flags.prefix)
  } else {
    output = await render(
      contentTypes.items,
      locales.items,
      imports,
      cli.flags.prefix,
      cli.flags.renderLocales,
      cli.flags.renderCts,
    )
  }

  outputFileSync(outputPath, output)
}

runCodegen(cli.flags.output).catch(error => {
  console.error(error)
  process.exit(1)
})

if (cli.flags.poll) {
  const intervalInSeconds = parseInt(cli.flags.interval, 10)

  if (!isNaN(intervalInSeconds) && intervalInSeconds > 0) {
    setInterval(() => runCodegen(cli.flags.output), intervalInSeconds * 1000)
  } else {
    throw new Error(`Expected a positive numeric interval, but got ${cli.flags.interval}`)
  }
}
