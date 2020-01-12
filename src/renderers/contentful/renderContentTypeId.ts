import { upperFirst, camelCase } from "lodash"

export default function renderContentTypeId(contentTypeId: string, prefix: string = ""): string {
  return `${prefix}${upperFirst(camelCase(contentTypeId))}`
}
