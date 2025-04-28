/**
 * Übersetzt Ressourcennamen ins Deutsche
 * @param name Name der Ressource
 * @returns Übersetzter Name
 */
export const translateResourceName = (name: string): string => {
	switch (name) {
		case "WHEAT":
			return "Weizen";
		case "BARLEY":
			return "Gerste";
		case "OAT":
			return "Hafer";
		case "SORGHUM":
			return "Hirse";
		case "CANOLA":
			return "Raps";
		case "SUNFLOWER":
			return "Sonnenblumen";
		case "FLOUR":
			return "Mehl";
		case "SUNFLOWER_OIL":
			return "Sonnenblumenöl";
		case "CANOLA_OIL":
			return "Rapsöl";
		case "STRAW":
			return "Stroh";
		default:
			return name;
	}
};

/**
 * Mapping von Fruchttyp-Namen zu FillType-Namen
 */
export const fruitTypeToFillType = {
	wheat: "WHEAT",
	barley: "BARLEY",
	oat: "OAT",
	sorghum: "SORGHUM",
	canola: "CANOLA",
	sunflower: "SUNFLOWER",
	flour: "FLOUR",
	sunflowerOil: "SUNFLOWER_OIL",
	canolaOil: "CANOLA_OIL",
	straw: "STRAW",
};

/**
 * Übersetzt den Preistyp ins Deutsche
 * @param priceType Typ des Preises ('base' oder 'max')
 * @returns Übersetzter Preistyp
 */
export const translatePriceType = (priceType: string): string => {
	switch (priceType) {
		case "base":
			return "Grundpreis";
		case "max":
			return "Maximalpreis";
		default:
			return priceType;
	}
};
