export default function renderContentfulImports(imports: string[]): string {
  const hasAsset = imports.includes("asset")
  const hasEntry = imports.includes("entry")
  const hasDocument = imports.includes("document")

  const assetEntryImport =
    hasAsset && hasEntry
      ? "import { Asset, Entry } from 'contentful'"
      : hasAsset
      ? "import { Asset } from 'contentful"
      : hasEntry
      ? "import { Entry } from 'contentful'"
      : ""
  const docImport = hasDocument ? "import { Document } from '@contentful/rich-text-types'" : ""
  return `
    // THIS FILE IS AUTOMATICALLY GENERATED. DO NOT MODIFY IT.

    ${assetEntryImport}
    ${docImport}
  `
}
