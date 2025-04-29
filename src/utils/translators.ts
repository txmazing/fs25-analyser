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
		case "MAIZE":
			return "Mais";
		case "BEETROOT":
			return "Zuckerrüben";
		case "CARROT":
			return "Karotten";
		case "COTTON":
			return "Baumwolle";
		case "GRASS":
			return "Gras";
		case "GRAPE":
			return "Trauben";
		case "GREENBEAN":
			return "Grüne Bohnen";
		case "OLIVE":
			return "Oliven";
		case "PARSNIP":
			return "Pastinaken";
		case "POPLAR":
			return "Pappeln (→ Hackschnitzel)"; // Kennzeichnung als Hackschnitzel-Quelle
		case "POTATO":
			return "Kartoffeln";
		case "RICE":
			return "Reis";
		case "RICELONGGRAIN":
			return "Langkornreis";
		case "SOYBEAN":
			return "Sojabohnen";
		case "SPINACH":
			return "Spinat";
		case "SUGARBEET":
			return "Zuckerrüben";
		case "SUGARCANE":
			return "Zuckerrohr";
		// Verarbeitete Produkte
		case "FLOUR":
			return "Mehl";
		case "SUNFLOWER_OIL":
			return "Sonnenblumenöl";
		case "CANOLA_OIL":
			return "Rapsöl";
		case "STRAW":
			return "Stroh";
		case "WOODCHIPS":
			return "Hackschnitzel";
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
	// Neue Fruchtarten
	maize: "MAIZE",
	beetRoot: "BEETROOT",
	carrot: "CARROT",
	cotton: "COTTON",
	grass: "GRASS",
	grape: "GRAPE",
	greenBean: "GREENBEAN",
	olive: "OLIVE",
	parsnip: "PARSNIP",
	poplar: "POPLAR",
	// Verarbeitete Produkte
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
