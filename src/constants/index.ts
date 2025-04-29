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
	"/data/foliage/wheat.xml",
	"/data/foliage/barley.xml",
	"/data/foliage/oat.xml",
	"/data/foliage/sorghum.xml",
	"/data/foliage/canola.xml",
	"/data/foliage/sunflower.xml",
];
