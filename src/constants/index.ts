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
	"/data/maps_fillTypes.xml",
	"/data/grainMill.xml",
	"/data/oilMill.xml",
	"/data/maps_fruitTypes.xml",
	"/data/wheat.xml",
	"/data/barley.xml",
	"/data/oat.xml",
	"/data/sorghum.xml",
	"/data/canola.xml",
	"/data/sunflower.xml",
];
