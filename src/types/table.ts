// Neue Typdefinitionen als Ersatz für @tanstack/react-table

export type SortingState = { id: string; desc: boolean }[];
export type ColumnFiltersState = { id: string; value: any }[];
export type VisibilityState = Record<string, boolean>;

export interface ColumnDef {
	id: string;
	label?: string; // Hinzugefügt für konsistente Spaltenbezeichnung
	defaultVisible?: boolean; // Hinzugefügt für Spaltenauswahl-Funktionalität
	accessorFn: (row: any) => any;
	header: () => React.ReactNode;
	cell: (info: {
		getValue: () => any;
		row: { original: any };
	}) => React.ReactNode;
}
