import {
	ArrowUpDown,
	ChevronDown,
	ChevronUp,
	Columns,
	Search,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PriceDisplay, ProductionData } from "../types";
import { formatNumber } from "../utils/formatters";
import { translateResourceName } from "../utils/translators";
import { Button } from "./ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";

// Eigene Typdefinitionen als Ersatz für @tanstack/react-table
type SortingState = { id: string; desc: boolean }[];
type ColumnFiltersState = { id: string; value: any }[];
type VisibilityState = Record<string, boolean>;

interface ColumnDef {
	id: string;
	label: string;
	defaultVisible: boolean;
	accessorFn: (row: any) => any;
	header: () => React.ReactNode;
	cell: (info: {
		getValue: () => any;
		row: { original: any };
	}) => React.ReactNode;
}

interface ProductionsTableProps {
	data: ProductionData[];
	sorting: SortingState;
	setSorting: (sorting: SortingState) => void;
	globalFilter: string;
	setGlobalFilter: (filter: string) => void;
	columnFilters: ColumnFiltersState;
	setColumnFilters: (filters: ColumnFiltersState) => void;
	priceDisplay: PriceDisplay;
}

const ProductionsTable: React.FC<ProductionsTableProps> = ({
	data,
	sorting,
	setSorting,
	globalFilter,
	setGlobalFilter,
	columnFilters,
	setColumnFilters,
	priceDisplay,
}) => {
	// Process the data dynamically based on priceDisplay
	const processedData = useMemo(() => {
		return data.map((item) => {
			// Create preprocessed display values
			const maxOutputPrice =
				item.outputPriceMax || item.outputPrice * (item.maxPriceFactor || 1.0);

			// Dynamic value added factor
			const baseValueAddedFactor = item.valueAddedFactor;
			const maxValueAddedFactor =
				(maxOutputPrice * item.outputAmount) /
				(item.inputPrice * item.inputAmount);

			return {
				...item,
				// Pre-compute displayed values based on price display
				displayOutputPrice:
					priceDisplay === "base" ? item.outputPrice : maxOutputPrice,
				displayValueAddedFactor:
					priceDisplay === "base" ? baseValueAddedFactor : maxValueAddedFactor,
				displayRevenuePerMonth:
					priceDisplay === "base"
						? item.revenuePerMonthBase
						: item.revenuePerMonthMax,
				displayRevenuePerHectare:
					priceDisplay === "base"
						? item.revenuePerHectareBase
						: item.revenuePerHectareMax,
				displayRevenueWithStrawPerHectare:
					priceDisplay === "base"
						? item.revenueWithStrawPerHectareBase
						: item.revenueWithStrawPerHectareMax,
				displayGainVsDirectSale:
					priceDisplay === "base"
						? item.gainVsDirectSaleBase
						: item.gainVsDirectSaleMax,
				displayGainVsDirectSalePercent:
					priceDisplay === "base"
						? item.gainVsDirectSalePercentBase
						: item.gainVsDirectSalePercentMax,
			};
		});
	}, [data, priceDisplay]);

	// Definieren aller verfügbaren Spalten
	const allColumns = useMemo<ColumnDef[]>(
		() => [
			{
				id: "production",
				label: "Produktionen",
				defaultVisible: true,
				accessorFn: (row) => row.production,
				header: () => "Produktionen",
				cell: (info) => info.getValue(),
			},
			{
				id: "input",
				label: "Rohstoff",
				defaultVisible: true,
				accessorFn: (row) => row.input,
				header: () => "Rohstoff",
				cell: (info) => translateResourceName(info.getValue() as string),
			},
			{
				id: "inputAmount",
				label: "Input/Zyklus",
				defaultVisible: true,
				accessorFn: (row) => row.inputAmount,
				header: () => "Input/Zyklus",
				cell: (info) => formatNumber(info.getValue() as number),
			},
			{
				id: "output",
				label: "Produkt",
				defaultVisible: true,
				accessorFn: (row) => row.output,
				header: () => "Produkt",
				cell: (info) => translateResourceName(info.getValue() as string),
			},
			{
				id: "outputAmount",
				label: "Output/Zyklus",
				defaultVisible: true,
				accessorFn: (row) => row.outputAmount,
				header: () => "Output/Zyklus",
				cell: (info) => formatNumber(info.getValue() as number),
			},
			{
				id: "inputPrice",
				label: "Eingabepreis",
				defaultVisible: false,
				accessorFn: (row) => row.inputPrice,
				header: () => "Eingabepreis",
				cell: (info) => `${formatNumber(info.getValue() as number)} €`,
			},
			{
				id: "outputPrice",
				label: "Ausgabepreis",
				defaultVisible: true,
				accessorFn: (row) => row.displayOutputPrice,
				header: () => "Ausgabepreis",
				cell: (info) => `${formatNumber(info.getValue() as number)} €`,
			},
			{
				id: "cycleTime",
				label: "Zyklusdauer",
				defaultVisible: false,
				accessorFn: (row) => row.cycleTime,
				header: () => "Zyklusdauer",
				cell: (info) => `${formatNumber(info.getValue() as number)} Std.`,
			},
			{
				id: "cyclesPerMonth",
				label: "Zyklen/Monat",
				defaultVisible: false,
				accessorFn: (row) => row.cyclesPerMonth,
				header: () => "Zyklen/Monat",
				cell: (info) => formatNumber(info.getValue() as number),
			},
			{
				id: "valueAddedFactor",
				label: "Wertschöpfung",
				defaultVisible: true,
				accessorFn: (row) => row.displayValueAddedFactor,
				header: () => "Wertschöpfung",
				cell: (info) => formatNumber(info.getValue() as number),
			},
			{
				id: "revenuePerMonth",
				label: "Erlös/Monat",
				defaultVisible: false,
				accessorFn: (row) => row.displayRevenuePerMonth,
				header: () => "Erlös/Monat",
				cell: (info) => `${formatNumber(info.getValue() as number)} €`,
			},
			{
				id: "revenuePerHectare",
				label: "Erlös/Hektar",
				defaultVisible: false,
				accessorFn: (row) => row.displayRevenuePerHectare,
				header: () => "Erlös/Hektar",
				cell: (info) => `${formatNumber(info.getValue() as number)} €`,
			},
			{
				id: "hectaresPerMonth",
				label: "Hektar/Monat",
				defaultVisible: false,
				accessorFn: (row) => row.hectaresPerMonth,
				header: () => "Hektar/Monat",
				cell: (info) => formatNumber(info.getValue() as number),
			},
			{
				id: "gainVsDirectSale",
				label: "Mehrerlös/Zyklus",
				defaultVisible: false,
				accessorFn: (row) => row.displayGainVsDirectSale,
				header: () => "Mehrerlös/Zyklus",
				cell: (info) => {
					const value = info.getValue();
					if (value === undefined || value === null) return "-";

					const formattedValue = `${formatNumber(value as number)} €`;
					return (value as number) >= 0 ? (
						<span>{formattedValue}</span>
					) : (
						<span className='text-ls-danger'>{formattedValue}</span>
					);
				},
			},
			{
				id: "gainVsDirectSalePercent",
				label: "Mehrerlös %",
				defaultVisible: true,
				accessorFn: (row) => row.displayGainVsDirectSalePercent,
				header: () => `Mehrerlös %`,
				cell: (info) => {
					const value = info.getValue();
					if (value === undefined || value === null) return "-";

					const formattedValue = `${formatNumber(value as number)} %`;
					return (value as number) >= 0 ? (
						<span>{formattedValue}</span>
					) : (
						<span className='text-ls-danger'>{formattedValue}</span>
					);
				},
			},
		],
		[priceDisplay]
	);

	// Initial sichtbare Spalten basierend auf defaultVisible-Eigenschaft
	const initialVisibility = useMemo(() => {
		return allColumns.reduce((acc, column) => {
			acc[column.id] = column.defaultVisible;
			return acc;
		}, {} as Record<string, boolean>);
	}, [allColumns]);

	// State für Spaltensichtbarkeit
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(initialVisibility);

	// State für das Dropdown-Menü
	const [showColumnSelector, setShowColumnSelector] = useState(false);
	const columnSelectorRef = useRef<HTMLDivElement>(null);
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);

	// Outside-Click-Handler für das Dropdown
	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (
				showColumnSelector &&
				columnSelectorRef.current &&
				!columnSelectorRef.current.contains(event.target as Node)
			) {
				setShowColumnSelector(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [showColumnSelector]);

	// Eigene Sortierlogik implementieren
	const sortedData = useMemo(() => {
		if (!sorting.length) return processedData;

		return [...processedData].sort((a, b) => {
			for (const sort of sorting) {
				const column = allColumns.find((col) => col.id === sort.id);
				if (!column) continue;

				const valueA = column.accessorFn(a);
				const valueB = column.accessorFn(b);

				// Basisvergleich mit null/undefined-Handling
				if (valueA === null || valueA === undefined) return sort.desc ? 1 : -1;
				if (valueB === null || valueB === undefined) return sort.desc ? -1 : 1;

				// Zahlenvergleich
				if (typeof valueA === "number" && typeof valueB === "number") {
					const diff = valueA - valueB;
					if (diff !== 0) return sort.desc ? -diff : diff;
				}
				// String-Vergleich
				else if (typeof valueA === "string" && typeof valueB === "string") {
					const diff = valueA.localeCompare(valueB);
					if (diff !== 0) return sort.desc ? -diff : diff;
				}
			}
			return 0;
		});
	}, [processedData, sorting, allColumns]);

	// Eigene Filterlogik implementieren
	const filteredData = useMemo(() => {
		let result = sortedData;

		// Globaler Filter
		if (globalFilter) {
			const lowerCaseFilter = globalFilter.toLowerCase();
			result = result.filter((row) => {
				return allColumns.some((column) => {
					const value = column.accessorFn(row);
					if (value == null) return false;
					return String(value).toLowerCase().includes(lowerCaseFilter);
				});
			});
		}

		// Spaltenfilter
		if (columnFilters.length) {
			result = result.filter((row) => {
				return columnFilters.every((filter) => {
					const column = allColumns.find((col) => col.id === filter.id);
					if (!column) return true;
					const value = column.accessorFn(row);
					if (filter.value === undefined) return true;
					return String(value)
						.toLowerCase()
						.includes(String(filter.value).toLowerCase());
				});
			});
		}

		return result;
	}, [sortedData, globalFilter, columnFilters, allColumns]);

	// Ersetzen der useReactTable-Hook mit eigener Logik
	const visibleColumns = useMemo(() => {
		return allColumns.filter((column) => columnVisibility[column.id]);
	}, [allColumns, columnVisibility]);

	// Helper-Funktionen für die Tabelle
	const handleToggleSort = (columnId: string) => {
		setSorting((current) => {
			// Finde den aktuellen Sortierstatus dieser Spalte
			const existingSort = current.find((sort) => sort.id === columnId);

			if (!existingSort) {
				// Wenn die Spalte noch nicht sortiert ist, füge sie hinzu (aufsteigend)
				return [{ id: columnId, desc: false }];
			} else if (!existingSort.desc) {
				// Wenn die Spalte aufsteigend sortiert ist, wechsle zu absteigend
				return [{ id: columnId, desc: true }];
			} else {
				// Wenn die Spalte absteigend sortiert ist, entferne die Sortierung
				return [];
			}
		});
	};

	const getColumnSortDirection = (columnId: string) => {
		const sort = sorting.find((sort) => sort.id === columnId);
		return sort ? (sort.desc ? "desc" : "asc") : null;
	};

	// Handler für das Umschalten aller Spalten
	const toggleAllColumns = (value: boolean) => {
		const newVisibility = allColumns.reduce((acc, column) => {
			acc[column.id] = value;
			return acc;
		}, {} as Record<string, boolean>);
		setColumnVisibility(newVisibility);
	};

	// Toggle-Funktion für die Spaltenvisibilität
	const toggleColumnVisibility = (columnId: string) => {
		setColumnVisibility({
			...columnVisibility,
			[columnId]: !columnVisibility[columnId],
		});
	};

	// When price display changes, reset the table
	const resetKey = `table-${priceDisplay}-${Date.now()}`;

	return (
		<div className='space-y-6'>
			{/* Suchleiste und Spaltenselektor mit verbessertem Layout */}
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
				<div className='relative w-full sm:w-auto sm:min-w-[300px]'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<Search size={18} className='text-muted-foreground' />
					</div>
					<input
						type='text'
						value={globalFilter ?? ""}
						onChange={(e) => setGlobalFilter(e.target.value)}
						placeholder='Suchen...'
						className='ls25-input max-w-md indent-6 w-full'
					/>
				</div>

				{/* Verbesserter Spaltenselektor-Dropdown */}
				<div className='relative'>
					<Button
						onClick={() => setShowColumnSelector(!showColumnSelector)}
						variant='outline'
						className='flex items-center gap-2 border-ls-accent/30 hover:border-ls-accent'
					>
						<Columns size={16} className='text-ls-accent' />
						<span>Spaltenauswahl</span>
					</Button>

					{showColumnSelector && (
						<div
							ref={columnSelectorRef}
							className='absolute right-0 top-full mt-2 bg-ls-surface border border-muted rounded-lg shadow-lg z-50 w-72'
						>
							<div className='p-3 border-b border-muted flex justify-between items-center'>
								<span className='font-medium text-sm'>Spalten anzeigen</span>
								<div className='flex gap-2'>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => toggleAllColumns(true)}
										className='text-xs'
									>
										Alle
									</Button>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => toggleAllColumns(false)}
										className='text-xs'
									>
										Keine
									</Button>
								</div>
							</div>
							<div className='max-h-[300px] overflow-y-auto p-2'>
								{allColumns.map((column) => (
									<div
										key={column.id}
										className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
											hoveredItem === column.id ? "bg-muted/30" : ""
										}`}
										onMouseEnter={() => setHoveredItem(column.id)}
										onMouseLeave={() => setHoveredItem(null)}
										onClick={() => toggleColumnVisibility(column.id)}
									>
										<span className='text-sm'>{column.label}</span>
										<div
											className={`w-10 h-5 rounded-full ${
												columnVisibility[column.id]
													? "bg-ls-accent"
													: "bg-muted"
											} relative transition-colors`}
										>
											<div
												className='absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform'
												style={{
													transform: `translateX(${
														columnVisibility[column.id] ? "20px" : "2px"
													})`,
												}}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Tabelle mit verbessertem Design */}
			<div
				className='overflow-x-auto -mx-4 sm:mx-0 rounded-md border border-muted'
				key={resetKey}
			>
				<Table className='ls25-table'>
					<TableHeader>
						<TableRow>
							{visibleColumns.map((column) => (
								<TableHead
									key={column.id}
									className='group cursor-pointer hover:bg-muted/70 transition-colors'
									onClick={() => handleToggleSort(column.id)}
								>
									<div className='flex items-center gap-2'>
										{column.header()}
										{getColumnSortDirection(column.id) === "asc" ? (
											<ChevronUp className='w-4 h-4 text-ls-accent' />
										) : getColumnSortDirection(column.id) === "desc" ? (
											<ChevronDown className='w-4 h-4 text-ls-accent' />
										) : (
											<ArrowUpDown className='w-4 h-4 opacity-0 group-hover:opacity-100 text-muted-foreground' />
										)}
									</div>
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredData.map((row, rowIndex) => (
							<TableRow key={rowIndex} className='transition-colors'>
								{visibleColumns.map((column) => {
									const value = column.accessorFn(row);

									// Bestimme, ob es sich um ein Mehrerlös-Feld handelt
									const isComparisonField = ["gainVsDirectSale"].some((term) =>
										column.id.includes(term)
									);

									const isNumeric = [
										"Price",
										"revenue",
										"gain",
										"Amount",
										"cycles",
										"hectares",
										"erlös",
									].some((term) =>
										column.id.toLowerCase().includes(term.toLowerCase())
									);

									// Farbige Darstellung für Mehrerlös-Felder
									let textColor = "";
									if (isComparisonField) {
										const isNumber = typeof value === "number";
										if (isNumber && (value as number) > 0) {
											textColor = "text-emerald-600 dark:text-emerald-400";
										} else if (isNumber && (value as number) < 0) {
											textColor = "text-ls-danger";
										}
									}

									return (
										<TableCell
											key={column.id}
											className={`p-3 ${
												isNumeric ? "numeric" : ""
											} ${textColor}`}
										>
											{column.cell({
												getValue: () => value,
												row: { original: row },
											})}
										</TableCell>
									);
								})}
							</TableRow>
						))}
						{filteredData.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={visibleColumns.length}
									className='h-24 text-center text-muted-foreground'
								>
									Keine Daten gefunden
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};

export default ProductionsTable;
