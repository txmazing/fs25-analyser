import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Percent } from "lucide-react";
import React, { ReactNode } from "react";

interface ToggleSwitchProps {
	isOn: boolean;
	onToggle: () => void;
	label: string;
	icon?: ReactNode;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
	isOn,
	onToggle,
	label,
	icon,
}) => {
	return (
		<div className='flex items-center justify-between space-x-2'>
			<div className='flex items-center'>
				{icon ? (
					icon
				) : label === "100% Bonus" ? (
					<Percent size={18} className='text-ls-accent mr-2' />
				) : null}
				<Label htmlFor={`toggle-${label}`} className='text-foreground'>
					{label}
				</Label>
			</div>
			<Switch
				id={`toggle-${label}`}
				checked={isOn}
				onCheckedChange={onToggle}
			/>
		</div>
	);
};

export default ToggleSwitch;
