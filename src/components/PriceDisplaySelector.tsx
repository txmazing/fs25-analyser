import { Euro } from "lucide-react";
import React from "react";
import { PriceDisplay } from "../types";
import { translatePriceType } from "../utils/translators";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface PriceDisplaySelectorProps {
	priceDisplay: PriceDisplay;
	setPriceDisplay: (display: PriceDisplay) => void;
}

const PriceDisplaySelector: React.FC<PriceDisplaySelectorProps> = ({
	priceDisplay,
	setPriceDisplay,
}) => {
	return (
		<div>
			<label className='text-sm font-medium text-foreground mb-2 flex items-center gap-2'>
				<Euro size={18} className='text-primary' />
				Preisanzeige
			</label>
			<Select
				value={priceDisplay}
				onValueChange={(value: PriceDisplay) => setPriceDisplay(value)}
			>
				<SelectTrigger className='h-9 w-full'>
					<SelectValue placeholder='Preistyp wählen'>
						{translatePriceType(priceDisplay)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='base'>Grundpreis</SelectItem>
					<SelectItem value='max'>Maximalpreis</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
};

export default PriceDisplaySelector;
