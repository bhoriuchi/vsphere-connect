const any = obj => obj
const toDate = obj => {
  try {
    return new Date(obj)
  } catch (err) {
    return obj
  }
}

export default {
  anyType: { convert: any },
  anySimpleType: { convert: any },
  duration: { convert: String },
  dateTime: { convert: toDate },
  time: { convert: String },
  date: { convert: toDate },
  gYearMonth: { convert: String },
  gYear: { convert: String },
  gMonthDay: { convert: String },
  gDay: { convert: String },
  gMonth: { convert: String },
  boolean: { convert: Boolean },
  base64Binary: { convert: String },
  hexBinary: { convert: String },
  float: { convert: Number },
  double: { convert: Number },
  anyURI: { convert: String },
  QName: { convert: String },
  NOTATION: { convert: String },
  string: { convert: String },
  decimal: { convert: Number },
  normalizedString: { convert: String },
  integer: { convert: Number },
  token: { convert: String },
  nonPositiveInteger: { convert: Number },
  long: { convert: Number },
  nonNegativeInteger: { convert: Number },
  language: { convert: String },
  Name: { convert: String },
  NMTOKEN: { convert: String },
  negativeInteger: { convert: Number },
  int: { convert: Number },
  unsignedLong: { convert: Number },
  positiveInteger: { convert: Number },
  NCName: { convert: String },
  NMTOKENS: { convert: String },
  short: { convert: Number },
  unsignedInt: { convert: Number },
  ID: { convert: String },
  IDREF: { convert: String },
  ENTITY: { convert: String },
  byte: { convert: String },
  unsignedShort: { convert: Number },
  IDREFS: { convert: String },
  ENTITIES: { convert: String },
  unsignedByte: { convert: String }
}
