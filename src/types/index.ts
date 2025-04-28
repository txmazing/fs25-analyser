export type Difficulty = "easy" | "normal" | "hard";
export type PriceDisplay = "base" | "max"; // Typ für die Preisauswahl

export interface SourceData {
	name: string;
	basePriceHard: number; // Originaler Preis für "Schwer"
	basePrice: number; // Preis nach Anwendung des Schwierigkeitsfaktors
	maxPriceFactor: number;
	maxPrice: number; // Max-Preis nach Anwendung des Schwierigkeitsfaktors
	massPerLiter: number;
	rawYieldPerHa: number; // Grundertrag pro Hektar
	yieldPerHa: number; // Ertrag pro Hektar basierend auf Düngungsstatus
	revenuePerHaBase: number; // Erlös/ha mit Grundpreis
	revenuePerHaMax: number; // Erlös/ha mit Maximalpreis
	strawYieldPerHa?: number; // Strohertrag pro Hektar (nur für Getreide)
	revenueWithStrawBase?: number; // Erlös/ha mit Stroh (Grundpreis)
	revenueWithStrawMax?: number; // Erlös/ha mit Stroh (Maximalpreis)
}

export interface ProductionData {
	production: string;
	input: string;
	inputAmount: number;
	inputPrice: number;
	output: string;
	outputAmount: number;
	outputPrice: number;
	outputPriceMax?: number; // Maximum output price for price display selection
	maxPriceFactor?: number; // Factor to calculate max price when needed
	valueAddedFactor: number;
	cyclesPerHour: number;
	cyclesPerDay?: number; // Zyklen pro Tag
	cyclesPerMonth?: number; // Zyklen pro Monat
	revenuePerMonthBase: number; // Erlös pro Monat mit Grundpreis
	revenuePerMonthMax: number; // Erlös pro Monat mit Maximalpreis
	// Felder für monatliche Berechnungen
	inputAmountPerMonth?: number; // Eingabemenge pro Monat
	hectaresNeededPerMonth?: number; // Benötigte Hektar pro Monat
	revenuePerHectareBase?: number; // Gewinn pro Hektar (Grundpreis)
	revenuePerHectareMax?: number; // Gewinn pro Hektar (Maximalpreis)
	// Stroherlös für Produktionen
	strawRevenuePerHectareBase?: number; // Stroherlös pro Hektar (Grundpreis)
	strawRevenuePerHectareMax?: number; // Stroherlös pro Hektar (Maximalpreis)
	revenueWithStrawPerHectareBase?: number; // Gesamterlös mit Stroh pro Hektar (Grundpreis)
	revenueWithStrawPerHectareMax?: number; // Gesamterlös mit Stroh pro Hektar (Maximalpreis)
	// Felder für Vergleichsberechnungen
	gainVsDirectSaleBase?: number; // Zusätzlicher Gewinn gegenüber direktem Verkauf (Grundpreis)
	gainVsDirectSaleMax?: number; // Zusätzlicher Gewinn gegenüber direktem Verkauf (Maximalpreis)
	gainVsDirectSalePercentBase?: number; // Prozentuale Steigerung gegenüber direktem Verkauf (Grundpreis)
	gainVsDirectSalePercentMax?: number; // Prozentuale Steigerung gegenüber direktem Verkauf (Maximalpreis)
}

export interface XMLDocuments {
	grainMill?: Document | null;
	oilMill?: Document | null;
	fillTypes?: Document | null;
}
