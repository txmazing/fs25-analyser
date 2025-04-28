import { Factory, Settings, Tractor, Wheat } from "lucide-react";
import React, { useState } from "react";
import { useDataProcessor } from "../hooks/useDataProcessor";
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

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-screen bg-ls-bg text-ls-text-primary'>
				<div className='flex flex-col items-center'>
					<Tractor size={48} className='text-ls-accent mb-4 animate-bounce' />
					<p className='text-xl font-semibold mb-6'>Daten werden geladen...</p>
					<div className='loading-bar w-64'></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center h-screen bg-ls-bg'>
				<div className='ls25-card max-w-lg'>
					<h3 className='font-medium text-ls-danger text-xl mb-3'>Fehler</h3>
					<p className='text-ls-text-primary mb-4'>{error}</p>
					<button
						className='bg-ls-accent text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors'
						onClick={() => window.location.reload()}
					>
						Neu laden
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-ls-bg'>
			{/* Header - verbessert mit sticky positioning und besseren Abständen */}
			<header className='ls25-header'>
				<div className='ls25-content flex items-center justify-between w-full'>
					<div className='flex items-center gap-3'>
						<Tractor size={32} className='text-ls-accent' />
						<h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
							<span className='text-ls-accent'>FS25</span>
							<span className='text-foreground'> ANALYSER</span>
						</h1>
					</div>
					<ModeToggle />
				</div>
			</header>

			<main className='ls25-content pb-12'>
				{/* Einstellungskarte mit verbesserten Abständen und Schatten */}
				<section className='ls25-section'>
					<div className='ls25-card'>
						<h2 className='text-lg font-medium mb-6 pb-2 border-b border-muted'>
							Einstellungen
						</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{/* Schwierigkeit mit verbessertem Styling */}
							<div>
								<label className='block text-sm font-medium text-ls-text-primary mb-2 flex items-center gap-2'>
									<Settings size={18} className='text-ls-accent' />
									Schwierigkeit
								</label>
								<Select value={difficulty} onValueChange={setDifficulty}>
									<SelectTrigger className='ls25-input'>
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
									icon={<Wheat size={18} className='text-ls-accent mr-2' />}
								/>

								<ToggleSwitch
									isOn={fullyFertilized}
									onToggle={() => setFullyFertilized(!fullyFertilized)}
									label='100% Bonus'
								/>
							</div>
						</div>
					</div>

					{/* Tabs mit verbessertem Styling */}
					<div className='mb-6'>
						<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
					</div>

					{/* Tab Content mit verbessertem Styling */}
					<div className='ls25-card'>
						{activeTab === "sources" ? (
							<>
								<h2 className='text-lg font-medium mb-6 pb-2 border-b border-muted flex items-center gap-2'>
									<Wheat size={20} className='text-ls-accent' />
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
								<h2 className='text-lg font-medium mb-6 pb-2 border-b border-muted flex items-center gap-2'>
									<Factory size={20} className='text-ls-accent' />
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
			<footer className='py-4 border-t border-muted'>
				<div className='ls25-content text-center text-sm text-ls-text-secondary'>
					<p>
						FS25 Analyser • Daten basierend auf Farming Simulator 25 v1.7.0.0
					</p>
				</div>
			</footer>
		</div>
	);
};

export default AppContent;
