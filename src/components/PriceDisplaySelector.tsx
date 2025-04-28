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
			<label className='block text-sm font-medium text-ls-text-primary mb-2 flex items-center gap-2'>
				<Euro size={18} className='text-ls-accent' />
				Preisanzeige
			</label>
			<Select value={priceDisplay} onValueChange={setPriceDisplay as any}>
				<SelectTrigger className='ls25-input'>
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
