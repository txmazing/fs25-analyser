import { useEffect, useState } from "react";
import { DIFFICULTY_FACTORS, XML_FILES } from "../constants";
import {
	Difficulty,
	PriceDisplay,
	ProductionData,
	SourceData,
	XMLDocuments,
} from "../types";
import { fruitTypeToFillType } from "../utils/translators";
import { parseXML } from "../utils/xmlParser";

// Konstanten für Zeitumrechnungen
const HOURS_PER_DAY = 24; // 24 Stunden pro Tag
const DAYS_PER_MONTH = 1; // 1 Tag pro Monat

export const useDataProcessor = () => {
	const [sourceData, setSourceData] = useState<SourceData[]>([]);
	const [productionData, setProductionData] = useState<ProductionData[]>([]);
	const [rawSourceData, setRawSourceData] = useState<SourceData[]>([]);
	const [xmlDocuments, setXmlDocuments] = useState<XMLDocuments>({});
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [difficulty, setDifficulty] = useState<Difficulty>("normal");
	const [includeStraw, setIncludeStraw] = useState<boolean>(true);
	const [fullyFertilized, setFullyFertilized] = useState<boolean>(true);
	const [priceDisplay, setPriceDisplay] = useState<PriceDisplay>("base"); // Neuer State für die Preisauswahl

	// Daten aus den XML-Dateien laden
	useEffect(() => {
		const loadXMLFiles = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// Alle XML-Dateien parallel laden
				const fileResponses = await Promise.all(
					XML_FILES.map((file) =>
						fetch("/fs25-analyser" + file).catch((error) => {
							console.warn(`Konnte ${file} nicht laden:`, error);
							return null; // Erlaube es, dass einzelne Dateien fehlen können
						})
					)
				);

				// Nur erfolgreiche Antworten behalten
				const validResponses = fileResponses.filter(
					(response) => response && response.ok
				);

				if (validResponses.length === 0) {
					throw new Error("Keine der XML-Dateien konnte geladen werden");
				}

				// XML-Dateien als Text extrahieren
				const xmlTexts = await Promise.all(
					validResponses.map((response) => response?.text())
				);

				// XML-Texte in DOM-Dokumente umwandeln
				const xmlDocs = xmlTexts.map((text) => parseXML(text || ""));

				// Extrahiere die benötigten Dokumente
				const fillTypesDoc = xmlDocs.find(
					(doc) => doc.querySelector("fillTypes") !== null
				);

				const grainMillDoc = xmlDocs.find(
					(doc) =>
						doc.querySelector('placeable[type="productionPoint"]') !== null &&
						doc.querySelector('production[id="flourWheat"]') !== null
				);

				const oilMillDoc = xmlDocs.find(
					(doc) =>
						doc.querySelector('placeable[type="productionPoint"]') !== null &&
						doc.querySelector('production[id="sunflower_oil"]') !== null
				);

				// Speichere die Produktions-Dokumente für spätere Verwendung
				setXmlDocuments({
					grainMill: grainMillDoc,
					oilMill: oilMillDoc,
					fillTypes: fillTypesDoc, // fillTypesDoc speichern
				});

				// Extrahiere Ernteerträge aus den individuellen Fruchttyp-Dateien
				const yieldData: Record<string, number> = {};
				const strawYieldData: Record<string, number> = {}; // Für Stroh-Erträge

				// Durchsuche alle geladenen XML-Dokumente nach Fruchttyp-Definitionen
				xmlDocs.forEach((doc) => {
					const fruitTypeElement = doc.querySelector("fruitType");
					if (fruitTypeElement) {
						const fruitName = fruitTypeElement.getAttribute("name");
						const harvestElement = fruitTypeElement.querySelector("harvest");
						const windrowElement = fruitTypeElement.querySelector("windrow");

						// Ernte-Erträge extrahieren
						if (
							fruitName &&
							harvestElement &&
							harvestElement.hasAttribute("litersPerSqm")
						) {
							const litersPerSqm = parseFloat(
								harvestElement.getAttribute("litersPerSqm") || "0"
							);
							// Umrechnung von Liter pro m² in Liter pro Hektar (1 ha = 10.000 m²)
							const yieldPerHa = litersPerSqm * 10000;

							// Der entscheidende Teil: Wir brauchen das Mapping in BEIDEN Richtungen
							const fillType = getFillTypeFromFruitName(fruitName);
							if (fillType) {
								yieldData[fillType] = yieldPerHa;
								console.log(
									`Extrahiert: ${fruitName} -> ${fillType} mit Ertrag: ${yieldPerHa} l/ha`
								);
							}
						}

						// Stroh-Erträge extrahieren
						if (
							fruitName &&
							windrowElement &&
							windrowElement.getAttribute("fillType") === "straw" &&
							windrowElement.hasAttribute("litersPerSqm")
						) {
							const strawLitersPerSqm = parseFloat(
								windrowElement.getAttribute("litersPerSqm") || "0"
							);

							// Der entscheidende Teil: Wir brauchen das Mapping in BEIDEN Richtungen
							const fillType = getFillTypeFromFruitName(fruitName);
							if (fillType) {
								strawYieldData[fillType] = strawLitersPerSqm * 10000; // Umrechnung zu Liter/ha
								console.log(
									`Strohertrag für ${fillType}: ${strawYieldData[fillType]} l/ha extrahiert`
								);
							}
						}
					}
				});

				// Prüfen, ob wir überhaupt Erträge für Fruchtarten haben, ohne eine bestimmte Liste zu erzwingen
				if (Object.keys(yieldData).length === 0) {
					throw new Error("Keine Ernteerträge für Feldfrüchte gefunden");
				}

				console.log(
					`Gefundene Feldfrüchte mit Erträgen: ${Object.keys(yieldData).join(
						", "
					)}`
				);

				// Quellendaten aus fillTypes.xml extrahieren
				if (!fillTypesDoc) {
					throw new Error(
						"Die maps_fillTypes.xml konnte nicht korrekt geparst werden"
					);
				}

				const fillTypes = fillTypesDoc.querySelectorAll("fillType");
				const rawData: SourceData[] = Array.from(fillTypes)
					.filter((fillType) => {
						const name = fillType.getAttribute("name");
						// Statt einer festen Liste alle bekannten Fruchtarten aus dem Mapping einbeziehen
						// oder Fruchtarten, die in yieldData existieren
						return (
							Object.values(fruitTypeToFillType).includes(name || "") ||
							Object.keys(yieldData).includes(name || "") ||
							name === "STRAW"
						);
					})
					.map((fillType) => {
						const name = fillType.getAttribute("name") || "";
						const physics = fillType.querySelector("physics");
						const economy = fillType.querySelector("economy");

						const basePriceHard =
							parseFloat(economy?.getAttribute("pricePerLiter") || "0") * 1000;

						// Maximal-Faktor berechnen
						const factors = Array.from(
							economy?.querySelectorAll("factor") || []
						);
						const maxPriceFactor =
							factors.length > 0
								? Math.max(
										...factors.map((factor) =>
											parseFloat(factor.getAttribute("value") || "1")
										)
								  )
								: 1.0; // Standardfaktor 1.0 wenn keine Faktoren definiert sind

						// Preise mit Schwierigkeitsfaktor berechnen (für "hard" initial)
						const basePrice = basePriceHard * DIFFICULTY_FACTORS["hard"];
						const maxPrice = basePrice * maxPriceFactor;

						// Grundertrag aus den XML-Daten
						const rawYieldPerHa = yieldData[name] || 0;

						// Strohertrag hinzufügen falls es sich um Getreide handelt
						const strawYieldPerHa = strawYieldData[name] || 0; // Aus XML extrahierte Werte verwenden

						return {
							name: name,
							basePriceHard: basePriceHard,
							basePrice: basePrice,
							maxPriceFactor: maxPriceFactor,
							maxPrice: maxPrice,
							massPerLiter: parseFloat(
								physics?.getAttribute("massPerLiter") || "0"
							),
							rawYieldPerHa: rawYieldPerHa,
							yieldPerHa: rawYieldPerHa * 2, // Initialer Wert für 100% Bonus
							revenuePerHaBase: 0, // Wird später berechnet
							revenuePerHaMax: 0, // Wird später berechnet
							strawYieldPerHa: strawYieldPerHa,
						};
					});

				// Speichere die Rohdaten
				setRawSourceData(rawData);

				// Aktualisiere die angezeigten Daten basierend auf der aktuellen Schwierigkeit
				updateDataForDifficulty(
					rawData,
					difficulty,
					grainMillDoc,
					oilMillDoc,
					includeStraw,
					fullyFertilized,
					fillTypesDoc
				);

				setIsLoading(false);
			} catch (err) {
				console.error(
					"Fehler beim Laden oder Verarbeiten der XML-Dateien:",
					err
				);
				setError(err instanceof Error ? err.message : String(err));
				setIsLoading(false);
			}
		};

		loadXMLFiles();
	}, []);

	// Aktualisiere die Daten bei Änderung relevanter Einstellungen
	useEffect(() => {
		if (rawSourceData.length > 0) {
			updateDataForDifficulty(
				rawSourceData,
				difficulty,
				xmlDocuments.grainMill,
				xmlDocuments.oilMill,
				includeStraw,
				fullyFertilized,
				xmlDocuments.fillTypes
			);
		}
	}, [difficulty, includeStraw, fullyFertilized, rawSourceData, xmlDocuments]);

	// Hilfsfunktion zum Aktualisieren der Daten basierend auf den Einstellungen
	const updateDataForDifficulty = (
		rawData: SourceData[],
		currentDifficulty: Difficulty,
		grainMillDoc: Document | null | undefined,
		oilMillDoc: Document | null | undefined,
		includeStraw: boolean,
		fullyFertilized: boolean,
		fillTypesDoc: Document | null | undefined
	) => {
		// Aktualisiere die Quellendaten mit dem Schwierigkeitsfaktor
		const difficultyFactor = DIFFICULTY_FACTORS[currentDifficulty];

		// Modifizierte Funktion zum Extrahieren des Preises aus fillTypesDoc
		const getOutputPrice = (fillType: string): number => {
			if (!fillTypesDoc) {
				throw new Error("Keine fillTypes-XML-Daten verfügbar");
			}

			const fillTypeElement = Array.from(
				fillTypesDoc.querySelectorAll("fillType")
			).find((el) => el.getAttribute("name") === fillType);

			if (fillTypeElement) {
				const economy = fillTypeElement.querySelector("economy");
				if (economy && economy.hasAttribute("pricePerLiter")) {
					// Preis pro Liter in Preis pro 1000 Liter umrechnen und Schwierigkeitsfaktor anwenden
					return (
						parseFloat(economy.getAttribute("pricePerLiter") || "0") *
						1000 *
						difficultyFactor
					);
				}
			}

			// Wenn kein Preis gefunden wurde, einen Fehler werfen
			throw new Error(`Preis für ${fillType} konnte nicht ermittelt werden`);
		};

		// Finde den Strohpreis für die Berechnung
		const strawSource = rawData.find((source) => source.name === "STRAW");
		const strawBasePrice = strawSource
			? strawSource.basePriceHard * difficultyFactor
			: 0;
		const strawMaxPrice = strawSource
			? strawBasePrice * strawSource.maxPriceFactor
			: 0;

		const woodchipsData = getWoodchipsData(fillTypesDoc);

		const updatedSourceData = rawData.map((source) => {
			// Preise mit Schwierigkeitsfaktor berechnen
			let basePrice = source.basePriceHard * difficultyFactor;
			let maxPrice =
				source.basePriceHard * difficultyFactor * source.maxPriceFactor;

			// Ernteertrag basierend auf Düngungsstatus berechnen
			const yieldFactor = fullyFertilized ? 2.0 : 1.0;
			let fullYieldPerHa = source.rawYieldPerHa * yieldFactor;

			let isSpecialCrop = false;

			// Sonderfall für Pappeln: Preis für Hackschnitzel verwenden
			if (source.name === "POPLAR" && woodchipsData) {
				isSpecialCrop = true;
				// Hackschnitzel-Preise mit Schwierigkeitsfaktor anwenden
				const woodchipsBasePrice = woodchipsData.basePrice * difficultyFactor;
				const woodchipsMaxPrice =
					woodchipsBasePrice * woodchipsData.maxPriceFactor;

				// Umrechnungsfaktor von Pappeln zu Hackschnitzeln
				// In Farming Simulator werden typischerweise circa 3 Liter Hackschnitzel
				// pro Liter Pappeln produziert bei der Ernte mit einem Forstmulcher
				const conversionFactor = 3.0; // L Hackschnitzel pro L Pappeln

				// Erträge und Preise anpassen
				fullYieldPerHa = source.rawYieldPerHa * yieldFactor * conversionFactor;
				basePrice = woodchipsBasePrice;
				maxPrice = woodchipsMaxPrice;

				// Notizen für die Anzeige
				source.notes =
					"Pappeln werden direkt zu Hackschnitzeln verarbeitet. " +
					"Ertrag und Preis basieren auf Hackschnitzeln nach Verarbeitung.";
			}

			// Erlös pro Hektar neu berechnen mit angepassten Preisen
			const revenuePerHaBase = (basePrice * fullYieldPerHa) / 1000; // in €/ha
			const revenuePerHaMax = (maxPrice * fullYieldPerHa) / 1000; // in €/ha

			// Für Getreidearten mit Stroh den zusätzlichen Erlös berechnen
			let revenueWithStrawBase = revenuePerHaBase;
			let revenueWithStrawMax = revenuePerHaMax;

			if (source.strawYieldPerHa && includeStraw && strawSource) {
				// Korrekter Strohertrag:
				// - Bei 100% Düngung: 73.600 l/ha (doppelter Basisertrag)
				// - Bei 0% Düngung: 36.800 l/ha (normaler Basisertrag)
				const effectiveStrawYield = fullyFertilized
					? source.strawYieldPerHa * 2 // 100% Bonus: Verdopplung des Basis-Strohertrags
					: source.strawYieldPerHa; // Kein Bonus: Originaler Strohertrag

				const strawRevenueBase = (strawBasePrice * effectiveStrawYield) / 1000;
				const strawRevenueMax = (strawMaxPrice * effectiveStrawYield) / 1000;
				revenueWithStrawBase = revenuePerHaBase + strawRevenueBase;
				revenueWithStrawMax = revenuePerHaMax + strawRevenueMax;
			}

			return {
				...source,
				basePrice: basePrice,
				maxPrice: maxPrice,
				yieldPerHa: fullYieldPerHa,
				isSpecialCrop: isSpecialCrop,
				revenuePerHaBase: revenuePerHaBase,
				revenuePerHaMax: revenuePerHaMax,
				revenueWithStrawBase: revenueWithStrawBase,
				revenueWithStrawMax: revenueWithStrawMax,
			};
		});

		setSourceData(updatedSourceData);

		// Berechnung der Produktionsdaten
		const processProductionData = (
			data: ProductionData[]
		): ProductionData[] => {
			return data.map((prod) => {
				// Find the corresponding input source data
				const inputSource = updatedSourceData.find(
					(s) => s.name === prod.input
				);

				// For input price, we use the source data directly
				const inputPrice = inputSource?.basePrice || 0;

				// For output products like FLOUR, SUNFLOWER_OIL, etc., we need to extract
				// the price directly from the fillTypes XML since they're not in updatedSourceData
				let outputBasePrice = 0;
				let outputMaxPrice = 0;
				let maxPriceFactor = 1.0; // Default factor

				try {
					// Directly extract output prices from fillTypes XML
					if (fillTypesDoc) {
						const outputFillType = Array.from(
							fillTypesDoc.querySelectorAll("fillType")
						).find((el) => el.getAttribute("name") === prod.output);

						if (outputFillType) {
							const economy = outputFillType.querySelector("economy");
							if (economy && economy.hasAttribute("pricePerLiter")) {
								// Extract base price (per 1000 liters) with difficulty factor
								outputBasePrice =
									parseFloat(economy.getAttribute("pricePerLiter") || "0") *
									1000 *
									DIFFICULTY_FACTORS[difficulty];

								// Find maximum price factor
								const factors = Array.from(
									economy.querySelectorAll("factor") || []
								);
								maxPriceFactor = Math.max(
									...factors.map((factor) =>
										parseFloat(factor.getAttribute("value") || "1")
									),
									1.0 // Ensure we have at least 1.0 as default
								);

								// Calculate max price
								outputMaxPrice = outputBasePrice * maxPriceFactor;
							}
						}
					}

					console.log(
						`Processed product ${prod.output}: Base price: ${outputBasePrice}, Max price: ${outputMaxPrice}`
					);
				} catch (error) {
					console.warn(`Error getting price for ${prod.output}:`, error);
					// Continue with default values instead of failing
				}

				// Ensure we have valid prices, falling back to defaults if needed
				if (outputBasePrice <= 0) {
					console.warn(`Using fallback price for ${prod.output}`);
					outputBasePrice = 1.0; // Fallback price
					outputMaxPrice = 1.0;
				}

				// Debug logging
				console.log(`Processing production: ${prod.production}`);
				console.log(`Input: ${prod.input}, Price: ${inputPrice}`);
				console.log(
					`Output: ${prod.output}, Base price: ${outputBasePrice}, Max price: ${outputMaxPrice}, Factor: ${maxPriceFactor}`
				);

				// Rest of calculations using the obtained prices
				// Berechnung der Erlöse pro Zyklus
				const revenuePerCycleBase =
					(prod.outputAmount * outputBasePrice) / 1000;
				const revenuePerCycleMax = (prod.outputAmount * outputMaxPrice) / 1000;

				// Berechnung der Zyklen pro Tag/Monat
				const cyclesPerDay = prod.cyclesPerHour * HOURS_PER_DAY;
				const cyclesPerMonth = cyclesPerDay * DAYS_PER_MONTH;

				// Berechnung der Erlöse pro Tag
				const revenuePerDayBase = revenuePerCycleBase * cyclesPerDay;
				const revenuePerDayMax = revenuePerCycleMax * cyclesPerDay;

				// Berechnung des Erlöses pro Monat
				const revenuePerMonthBase = revenuePerDayBase * DAYS_PER_MONTH;
				const revenuePerMonthMax = revenuePerDayMax * DAYS_PER_MONTH;

				// Calculate hectares needed and revenue per hectare
				// Menge des Inputs pro Monat
				const inputAmountPerMonth =
					prod.inputAmount * cyclesPerDay * DAYS_PER_MONTH;

				// Benötigte Hektar pro Monat
				let hectaresNeededPerMonth = 0;
				if (inputSource && inputSource.yieldPerHa > 0) {
					hectaresNeededPerMonth = inputAmountPerMonth / inputSource.yieldPerHa;
				}

				// Gewinn pro Hektar (basierend auf monatlichen Werten)
				let revenuePerHectareBase = 0;
				let revenuePerHectareMax = 0;

				if (hectaresNeededPerMonth > 0) {
					revenuePerHectareBase = revenuePerMonthBase / hectaresNeededPerMonth;
					revenuePerHectareMax = revenuePerMonthMax / hectaresNeededPerMonth;
				}

				// Straw revenue calculations
				let strawRevenuePerHectareBase = 0;
				let strawRevenuePerHectareMax = 0;
				let revenueWithStrawPerHectareBase = revenuePerHectareBase;
				let revenueWithStrawPerHectareMax = revenuePerHectareMax;

				// Wenn der Input Stroh produzieren kann und Stroh aktiviert ist
				if (
					includeStraw &&
					inputSource &&
					inputSource.strawYieldPerHa &&
					inputSource.strawYieldPerHa > 0
				) {
					// Strohquelle finden
					const strawSource = updatedSourceData.find(
						(source) => source.name === "STRAW"
					);

					if (strawSource) {
						// Effektiver Strohertrag basierend auf Düngungsstatus
						const effectiveStrawYield = fullyFertilized
							? inputSource.strawYieldPerHa * 2 // 100% Bonus
							: inputSource.strawYieldPerHa; // Kein Bonus

						// Stroherlös pro Hektar berechnen (nur wenn Strohertrag vorhanden)
						strawRevenuePerHectareBase =
							(strawSource.basePrice * effectiveStrawYield) / 1000;
						strawRevenuePerHectareMax =
							(strawSource.maxPrice * effectiveStrawYield) / 1000;

						// Gesamterlös mit Stroh
						revenueWithStrawPerHectareBase =
							revenuePerHectareBase + strawRevenuePerHectareBase;
						revenueWithStrawPerHectareMax =
							revenuePerHectareMax + strawRevenuePerHectareMax;
					}
				}

				// Calculate gain compared to direct sale
				let gainVsDirectSaleBase = 0;
				let gainVsDirectSaleMax = 0;
				let gainVsDirectSalePercentBase = 0;
				let gainVsDirectSalePercentMax = 0;

				// Neue Berechnung für Mehrerlös pro Monat
				let gainPerMonthBase = 0;
				let gainPerMonthMax = 0;

				if (inputSource) {
					// Wähle entweder den Preis mit oder ohne Stroh, je nach Einstellung
					const directSaleRevenueBase =
						includeStraw && inputSource.revenueWithStrawBase
							? inputSource.revenueWithStrawBase
							: inputSource.revenuePerHaBase;

					const directSaleRevenueMax =
						includeStraw && inputSource.revenueWithStrawMax
							? inputSource.revenueWithStrawMax
							: inputSource.revenuePerHaMax;

					// Berechne den zusätzlichen Gewinn - jetzt mit korrekter Strohberücksichtigung
					const productionRevenueBase = includeStraw
						? revenueWithStrawPerHectareBase
						: revenuePerHectareBase;
					const productionRevenueMax = includeStraw
						? revenueWithStrawPerHectareMax
						: revenuePerHectareMax;

					gainVsDirectSaleBase = productionRevenueBase - directSaleRevenueBase;
					gainVsDirectSaleMax = productionRevenueMax - directSaleRevenueMax;

					// Berechne den prozentualen Gewinn
					if (directSaleRevenueBase > 0) {
						gainVsDirectSalePercentBase =
							(gainVsDirectSaleBase / directSaleRevenueBase) * 100;
					}
					if (directSaleRevenueMax > 0) {
						gainVsDirectSalePercentMax =
							(gainVsDirectSaleMax / directSaleRevenueMax) * 100;
					}

					// Berechne den Mehrerlös pro Monat
					// Wert der verarbeiteten Ware pro Monat - Wert der Rohstoffe pro Monat
					const rawMaterialValueBasePerMonth =
						(inputSource.basePrice * inputAmountPerMonth!) / 1000;
					const rawMaterialValueMaxPerMonth =
						(inputSource.maxPrice * inputAmountPerMonth!) / 1000;

					gainPerMonthBase = revenuePerMonthBase - rawMaterialValueBasePerMonth;
					gainPerMonthMax = revenuePerMonthMax - rawMaterialValueMaxPerMonth;
				}

				// Return enriched production data
				return {
					...prod,
					inputPrice,
					outputPrice: outputBasePrice,
					outputPriceMax: outputMaxPrice,
					maxPriceFactor: maxPriceFactor,
					valueAddedFactor:
						(outputBasePrice * prod.outputAmount) /
						(inputPrice * prod.inputAmount),
					cyclesPerDay,
					cyclesPerMonth,
					revenuePerMonthBase,
					revenuePerMonthMax,
					inputAmountPerMonth,
					hectaresNeededPerMonth,
					revenuePerHectareBase,
					revenuePerHectareMax,
					strawRevenuePerHectareBase,
					strawRevenuePerHectareMax,
					revenueWithStrawPerHectareBase,
					revenueWithStrawPerHectareMax,
					gainVsDirectSaleBase,
					gainVsDirectSaleMax,
					gainVsDirectSalePercentBase,
					gainVsDirectSalePercentMax,
					// Neue Berechnungswerte hinzufügen
					gainPerMonthBase,
					gainPerMonthMax,
				};
			});
		};

		// Aktualisiere die Produktionsdaten
		const processingData: ProductionData[] = [];

		// Getreidemühle verarbeiten
		if (grainMillDoc) {
			const grainMillProductions = grainMillDoc.querySelectorAll("production");
			grainMillProductions.forEach((production) => {
				const input = production.querySelector("input");
				const output = production.querySelector("output");

				if (input && output) {
					const inputType = input.getAttribute("fillType");
					if (["WHEAT", "BARLEY", "OAT", "SORGHUM"].includes(inputType || "")) {
						try {
							const sourceItem = updatedSourceData.find(
								(s) => s.name === inputType
							);
							if (!sourceItem) {
								throw new Error(`Quellendaten für ${inputType} nicht gefunden`);
							}

							const inputPrice = sourceItem.basePrice;
							const outputType = output.getAttribute("fillType") || "";
							if (!outputType) {
								throw new Error("Ausgabetyp nicht spezifiziert");
							}

							// Preis direkt aus XML extrahieren, ohne Default-Werte
							const outputPrice = getOutputPrice(outputType);

							const inputAmount = parseInt(input.getAttribute("amount") || "0");
							const outputAmount = parseInt(
								output.getAttribute("amount") || "0"
							);
							const cyclesPerHour = parseInt(
								production.getAttribute("cyclesPerHour") || "0"
							);

							// Wertschöpfungsfaktor berechnen
							const valueAddedFactor =
								(outputAmount * outputPrice) / (inputAmount * inputPrice);

							processingData.push({
								production: "Getreidemühle",
								input: inputType || "",
								inputAmount: inputAmount,
								inputPrice: inputPrice,
								output: outputType,
								outputAmount: outputAmount,
								outputPrice: outputPrice,
								valueAddedFactor: valueAddedFactor,
								cyclesPerHour: cyclesPerHour,
								revenuePerMonthBase: 0, // Wird später berechnet
								revenuePerMonthMax: 0, // Wird später berechnet
							});
						} catch (error) {
							console.error(`Fehler bei Getreidemühle: ${error}`);
							setError(`Fehler bei Getreidemühle-Verarbeitung: ${error}`);
						}
					}
				}
			});
		}

		// Ölmühle verarbeiten
		if (oilMillDoc) {
			const oilMillProductions = oilMillDoc.querySelectorAll("production");
			oilMillProductions.forEach((production) => {
				const input = production.querySelector("input");
				const output = production.querySelector("output");

				if (input && output) {
					const inputType = input.getAttribute("fillType");
					if (["SUNFLOWER", "CANOLA"].includes(inputType || "")) {
						try {
							const sourceItem = updatedSourceData.find(
								(s) => s.name === inputType
							);
							if (!sourceItem) {
								throw new Error(`Quellendaten für ${inputType} nicht gefunden`);
							}

							const inputPrice = sourceItem.basePrice;
							const outputType = output.getAttribute("fillType") || "";
							if (!outputType) {
								throw new Error("Ausgabetyp nicht spezifiziert");
							}

							// Preis direkt aus XML extrahieren, ohne Default-Werte
							const outputPrice = getOutputPrice(outputType);

							const inputAmount = parseInt(input.getAttribute("amount") || "0");
							const outputAmount = parseInt(
								output.getAttribute("amount") || "0"
							);
							const cyclesPerHour = parseInt(
								production.getAttribute("cyclesPerHour") || "0"
							);

							// Wertschöpfungsfaktor berechnen
							const valueAddedFactor =
								(outputAmount * outputPrice) / (inputAmount * inputPrice);

							processingData.push({
								production: "Ölmühle",
								input: inputType || "",
								inputAmount: inputAmount,
								inputPrice: inputPrice,
								output: outputType,
								outputAmount: outputAmount,
								outputPrice: outputPrice,
								valueAddedFactor: valueAddedFactor,
								cyclesPerHour: cyclesPerHour,
								revenuePerMonthBase: 0, // Wird später berechnet
								revenuePerMonthMax: 0, // Wird später berechnet
							});
						} catch (error) {
							console.error(`Fehler bei Ölmühle: ${error}`);
							setError(`Fehler bei Ölmühle-Verarbeitung: ${error}`);
						}
					}
				}
			});
		}

		// Jetzt die richtige Funktion ohne Map-Parameter aufrufen
		setProductionData(processProductionData(processingData));
	};

	// Hilfsfunktion, um das richtige fillType für einen fruitType-Namen zu erhalten
	function getFillTypeFromFruitName(fruitName: string): string | null {
		// Direkte Suche im fruitTypeToFillType-Objekt
		const fillType =
			fruitTypeToFillType[fruitName as keyof typeof fruitTypeToFillType];

		// Wenn nicht gefunden, versuchen wir es mit Großbuchstaben
		if (!fillType) {
			// Fallback: Wir nehmen an, dass der fillType derselbe Name sein könnte, aber in Großbuchstaben
			return fruitName.toUpperCase();
		}

		return fillType;
	}

	// Hilfsfunktion zum Ermitteln des Hackschnitzelpreises
	function getWoodchipsPrice(
		fillTypesDoc: Document | null | undefined,
		difficultyFactor: number
	): number {
		if (!fillTypesDoc) return 0;

		const woodchipsElement = Array.from(
			fillTypesDoc.querySelectorAll("fillType")
		).find((el) => el.getAttribute("name") === "WOODCHIPS");

		if (woodchipsElement) {
			const economy = woodchipsElement.querySelector("economy");
			if (economy && economy.hasAttribute("pricePerLiter")) {
				// Preis pro Liter in Preis pro 1000 Liter umrechnen und Schwierigkeitsfaktor anwenden
				return (
					parseFloat(economy.getAttribute("pricePerLiter") || "0") *
					1000 *
					difficultyFactor
				);
			}
		}

		// Fallback-Wert, falls Hackschnitzel nicht gefunden wurden
		return 230; // Angenommener Durchschnittspreis für Hackschnitzel pro 1000 Liter
	}

	// Hilfsfunktion, um die Hackschnitzel-Daten zu extrahieren
	function getWoodchipsData(fillTypesDoc: Document | null | undefined): {
		basePrice: number;
		maxPriceFactor: number;
		massPerLiter: number;
	} | null {
		if (!fillTypesDoc) return null;

		const woodchipsElement = Array.from(
			fillTypesDoc.querySelectorAll("fillType")
		).find((el) => el.getAttribute("name") === "WOODCHIPS");

		if (!woodchipsElement) return null;

		const physics = woodchipsElement.querySelector("physics");
		const economy = woodchipsElement.querySelector("economy");

		if (!economy || !economy.hasAttribute("pricePerLiter")) return null;

		const basePricePerLiter = parseFloat(
			economy.getAttribute("pricePerLiter") || "0"
		);

		// Berechnung des max. Preisfaktors aus den monatlichen Faktoren
		let maxPriceFactor = 1.0;
		const factors = Array.from(economy.querySelectorAll("factor") || []);
		if (factors.length > 0) {
			maxPriceFactor = Math.max(
				...factors.map((factor) =>
					parseFloat(factor.getAttribute("value") || "1")
				)
			);
		}

		const massPerLiter = parseFloat(
			physics?.getAttribute("massPerLiter") || "0.35"
		);

		return {
			basePrice: basePricePerLiter * 1000, // Umrechnung auf Preis pro 1000 Liter
			maxPriceFactor,
			massPerLiter,
		};
	}

	return {
		sourceData,
		productionData,
		isLoading,
		error,
		difficulty,
		setDifficulty,
		includeStraw,
		setIncludeStraw,
		fullyFertilized,
		setFullyFertilized,
		priceDisplay,
		setPriceDisplay, // Neuer State für die Preisauswahl exportieren
	};
};
