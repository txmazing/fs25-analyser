/**
 * Formatiert eine Zahl in einen lesbaren String
 * @param value Die zu formatierende Zahl
 * @returns Formatierte Zahl als String
 */
export const formatNumber = (value: any): string => {
	if (value === null || value === undefined || isNaN(Number(value))) return "-";
	return Number(value).toLocaleString("de-DE", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
};
