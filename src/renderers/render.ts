import { ContentType, Locale } from "contentful"

import { format, resolveConfig } from "prettier"

import renderContentfulImports from "./contentful/renderContentfulImports"
import renderContentType from "./contentful/renderContentType"
import renderUnion from "./typescript/renderUnion"
import renderAllLocales from "./contentful/renderAllLocales"
import renderDefaultLocale from "./contentful/renderDefaultLocale"

export default async function render(
  contentTypes: ContentType[],
  locales: Locale[],
  imports: string[],
  prefix?: string,
  renderLocales: boolean = false,
  renderCts: boolean = false,
) {
  const sortedContentTypes = contentTypes.sort((a, b) => a.sys.id.localeCompare(b.sys.id))
  const sortedLocales = locales.sort((a, b) => a.code.localeCompare(b.code))

  const source = [
    renderContentfulImports(imports),
    renderAllContentTypes(sortedContentTypes, prefix),
    (renderCts && renderAllContentTypeIds(sortedContentTypes)) || "",
    (renderLocales && renderAllLocales(sortedLocales)) || "",
    (renderLocales && renderDefaultLocale(sortedLocales)) || "",
  ].join("\n\n")

  const prettierConfig = await resolveConfig(process.cwd())
  return format(source, { ...prettierConfig, parser: "typescript" })
}

function renderAllContentTypes(contentTypes: ContentType[], prefix?: string): string {
  return contentTypes.map(contentType => renderContentType(contentType, prefix)).join("\n\n")
}

function renderAllContentTypeIds(contentTypes: ContentType[]): string {
  return renderUnion(
    "CONTENT_TYPE",
    contentTypes.map(contentType => `'${contentType.sys.id}'`),
  )
}
