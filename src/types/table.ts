// Neue Typdefinitionen als Ersatz für @tanstack/react-table

export type SortingState = { id: string; desc: boolean }[];
export type ColumnFiltersState<T = unknown> = { id: string; value: T }[];
export type VisibilityState = Record<string, boolean>;

export interface ColumnDef<TData = unknown, TValue = unknown> {
	id: string;
	label?: string; // Hinzugefügt für konsistente Spaltenbezeichnung
	defaultVisible?: boolean; // Hinzugefügt für Spaltenauswahl-Funktionalität
	accessorFn: (row: TData) => TValue;
	header: () => React.ReactNode;
	cell: (info: {
		getValue: () => TValue;
		row: { original: TData };
	}) => React.ReactNode;
}
