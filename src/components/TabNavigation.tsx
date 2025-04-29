import { Factory, Wheat } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

interface TabNavigationProps {
	activeTab: "sources" | "productions";
	setActiveTab: (tab: "sources" | "productions") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
	activeTab,
	setActiveTab,
}) => {
	return (
		<div className='flex space-x-1 w-full'>
			<Button
				variant={activeTab === "sources" ? "default" : "ghost"}
				onClick={() => setActiveTab("sources")}
				className={`
					flex-1 whitespace-nowrap px-4 py-2 rounded-md transition-all
					${activeTab === "sources" ? "shadow-sm" : "hover:bg-muted/30"}
				`}
			>
				<Wheat
					size={18}
					className={`mr-2 ${
						activeTab === "sources"
							? "text-primary-foreground"
							: "text-muted-foreground"
					}`}
				/>
				<span>Feldfrüchte</span>
			</Button>
			<Button
				variant={activeTab === "productions" ? "default" : "ghost"}
				onClick={() => setActiveTab("productions")}
				className={`
					flex-1 whitespace-nowrap px-4 py-2 rounded-md transition-all
					${activeTab === "productions" ? "shadow-sm" : "hover:bg-muted/30"}
				`}
			>
				<Factory
					size={18}
					className={`mr-2 ${
						activeTab === "productions"
							? "text-primary-foreground"
							: "text-muted-foreground"
					}`}
				/>
				<span>Produktionen</span>
			</Button>
		</div>
	);
};

export default TabNavigation;
