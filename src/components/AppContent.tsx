import { Factory, Settings, Tractor, Wheat } from "lucide-react";
import React, { useState } from "react";
import { useDataProcessor } from "../hooks/useDataProcessor";
import { Difficulty } from "../types";
import { ColumnFiltersState, SortingState } from "../types/table";

import { ModeToggle } from "./ModeToggle";
import PriceDisplaySelector from "./PriceDisplaySelector";
import ProductionsTable from "./ProductionsTable";
import SourcesTable from "./SourcesTable";
import TabNavigation from "./TabNavigation";
import ToggleSwitch from "./ToggleSwitch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

const AppContent: React.FC = () => {
	const {
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
		setPriceDisplay,
	} = useDataProcessor();

	// Tab state
	const [activeTab, setActiveTab] = useState<"sources" | "productions">(
		"sources"
	);

	// States für die Tabellen
	const [sourceSorting, setSourceSorting] = useState<SortingState>([]);
	const [sourceGlobalFilter, setSourceGlobalFilter] = useState<string>("");
	const [sourceColumnFilters, setSourceColumnFilters] =
		useState<ColumnFiltersState>([]);

	const [productionSorting, setProductionSorting] = useState<SortingState>([]);
	const [productionGlobalFilter, setProductionGlobalFilter] =
		useState<string>("");
	const [productionColumnFilters, setProductionColumnFilters] =
		useState<ColumnFiltersState>([]);

	// Handler für die Schwierigkeitsauswahl mit korrekter Typisierung
	const handleDifficultyChange = (value: string) => {
		setDifficulty(value as Difficulty);
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-background'>
				<div className='flex flex-col items-center'>
					<Tractor size={48} className='text-primary mb-4 animate-bounce' />
					<p className='text-xl font-medium mb-6'>Daten werden geladen...</p>
					<div className='w-64 h-1 relative bg-primary/10 overflow-hidden rounded'>
						<div className='absolute top-0 left-0 w-1/2 h-full bg-primary animate-[slide_1.5s_infinite]'></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-background'>
				<div className='max-w-lg p-6 bg-card rounded-lg shadow-md'>
					<h3 className='font-medium text-destructive text-xl mb-3'>Fehler</h3>
					<p className='text-foreground mb-4'>{error}</p>
					<button
						className='bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors'
						onClick={() => window.location.reload()}
					>
						Neu laden
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background text-foreground'>
			{/* Header - verbessert mit sticky positioning und besseren Abständen */}
			<header className='sticky top-0 z-10 w-full border-b border-border/40 bg-background/80 backdrop-blur'>
				<div className='max-w-5xl mx-auto flex h-16 items-center justify-between px-4'>
					<div className='flex items-center gap-3'>
						<Tractor size={32} className='text-primary' />
						<h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
							<span className='text-primary'>FS25</span>
							<span className='text-foreground'> ANALYSER</span>
						</h1>
					</div>
					<ModeToggle />
				</div>
			</header>

			<main className='max-w-5xl mx-auto px-4 py-6 pb-12'>
				{/* Einstellungskarte mit verbesserten Abständen und Schatten */}
				<section className='space-y-6'>
					<div className='p-6 bg-card rounded-lg shadow-md'>
						<h2 className='text-lg font-medium mb-6 pb-2 border-b border-border/40'>
							Einstellungen
						</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{/* Schwierigkeit mit verbessertem Styling */}
							<div>
								<label className='text-sm font-medium text-foreground mb-2 flex items-center gap-2'>
									<Settings size={18} className='text-primary' />
									Schwierigkeit
								</label>
								<Select
									value={difficulty}
									onValueChange={handleDifficultyChange}
								>
									<SelectTrigger className='h-9 w-full'>
										<SelectValue placeholder='Schwierigkeit wählen' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='easy'>LEICHT</SelectItem>
										<SelectItem value='normal'>NORMAL</SelectItem>
										<SelectItem value='hard'>SCHWER</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Preisanzeige mit konsistentem Styling */}
							<PriceDisplaySelector
								priceDisplay={priceDisplay}
								setPriceDisplay={setPriceDisplay}
							/>

							{/* Toggle Switches mit besserem Abstand */}
							<div className='space-y-5'>
								<ToggleSwitch
									isOn={includeStraw}
									onToggle={() => setIncludeStraw(!includeStraw)}
									label='Stroh einbeziehen'
									icon={<Wheat size={18} className='text-primary mr-2' />}
								/>

								<ToggleSwitch
									isOn={fullyFertilized}
									onToggle={() => setFullyFertilized(!fullyFertilized)}
									label='100% Bonus'
									icon={<span className='text-primary mr-2'>%</span>}
								/>
							</div>
						</div>
					</div>

					{/* Tabs mit verbessertem Styling */}
					<div className='p-1 bg-muted/30 rounded-lg'>
						<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
					</div>

					{/* Tab Content mit verbessertem Styling */}
					<div className='p-6 bg-card rounded-lg shadow-md'>
						{activeTab === "sources" ? (
							<>
								<h2 className='text-lg font-medium mb-6 pb-2 border-b border-border/40 flex items-center gap-2'>
									<Wheat size={20} className='text-primary' />
									Feldfrüchte
								</h2>
								<SourcesTable
									data={sourceData}
									sorting={sourceSorting}
									setSorting={setSourceSorting}
									globalFilter={sourceGlobalFilter}
									setGlobalFilter={setSourceGlobalFilter}
									columnFilters={sourceColumnFilters}
									setColumnFilters={setSourceColumnFilters}
									includeStraw={includeStraw}
									fullyFertilized={fullyFertilized}
									priceDisplay={priceDisplay}
								/>
							</>
						) : (
							<>
								<h2 className='text-lg font-medium mb-6 pb-2 border-b border-border/40 flex items-center gap-2'>
									<Factory size={20} className='text-primary' />
									Produktionen
								</h2>
								<ProductionsTable
									data={productionData}
									sorting={productionSorting}
									setSorting={setProductionSorting}
									globalFilter={productionGlobalFilter}
									setGlobalFilter={setProductionGlobalFilter}
									columnFilters={productionColumnFilters}
									setColumnFilters={setProductionColumnFilters}
									priceDisplay={priceDisplay}
								/>
							</>
						)}
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className='py-4 border-t border-border/40'>
				<div className='max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground'>
					<p>
						FS25 Analyser • Daten basierend auf Farming Simulator 25 v1.7.0.0
					</p>
				</div>
			</footer>
		</div>
	);
};

export default AppContent;
