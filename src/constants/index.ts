import { Difficulty } from "../types";

/**
 * Schwierigkeitsfaktoren für Preisberechnungen
 */
export const DIFFICULTY_FACTORS: Record<Difficulty, number> = {
	easy: 3.0, // Einfach: Preis x 3
	normal: 1.8, // Normal: Preis x 1,8
	hard: 1.0, // Schwer: Basispreis (aus XML)
};

/**
 * Liste der zu ladenden XML-Dateien
 */
export const XML_FILES = [
	"/data/maps/maps_fillTypes.xml",
	"/data/placeables/grainMill.xml",
	"/data/placeables/oilMill.xml",
	"/data/maps/maps_fruitTypes.xml",
	// Fruchtarten
	"/data/foliage/wheat.xml",
	"/data/foliage/barley.xml",
	"/data/foliage/oat.xml",
	"/data/foliage/sorghum.xml",
	"/data/foliage/canola.xml",
	"/data/foliage/sunflower.xml",
	"/data/foliage/maize.xml",
	"/data/foliage/beetRoot.xml",
	"/data/foliage/carrot.xml",
	"/data/foliage/cotton.xml",
	"/data/foliage/grass.xml",
	"/data/foliage/grape.xml",
	"/data/foliage/greenBean.xml",
	"/data/foliage/olive.xml",
	"/data/foliage/parsnip.xml",
	"/data/foliage/poplar.xml",
	"/data/foliage/potato.xml",
	"/data/foliage/rice.xml",
	"/data/foliage/riceLongGrain.xml",
	"/data/foliage/soybean.xml",
	"/data/foliage/spinach.xml",
	"/data/foliage/sugarbeet.xml",
	"/data/foliage/sugarcane.xml",
];
