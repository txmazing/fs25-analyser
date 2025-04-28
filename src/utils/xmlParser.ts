/**
 * Parst einen XML-String in ein XML-Dokument
 * @param xmlString XML als String
 * @returns XML-Dokument
 */
export const parseXML = (xmlString: string): Document => {
	const parser = new DOMParser();
	return parser.parseFromString(xmlString, "text/xml");
};
