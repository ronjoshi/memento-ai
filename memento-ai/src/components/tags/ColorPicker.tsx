"use client";

import { TagColor, TAG_COLORS, TAG_COLOR_CONFIG } from "@/types";

interface ColorPickerProps {
	selectedColor: TagColor;
	onSelect: (color: TagColor) => void;
}

export default function ColorPicker({
	selectedColor,
	onSelect,
}: ColorPickerProps) {
	return (
		<div className="grid grid-cols-6 gap-2 p-2">
			{TAG_COLORS.map((color) => {
				const colors = TAG_COLOR_CONFIG[color];
				const isSelected = color === selectedColor;

				return (
					<button
						key={color}
						type="button"
						onClick={() => onSelect(color)}
						className={`w-8 h-8 rounded-full border-2 transition-all ${
							isSelected
								? "border-white scale-110"
								: "border-transparent hover:scale-105"
						}`}
						style={{
							backgroundColor: colors.bg,
						}}
						aria-label={`Select ${color} color`}
						title={color.charAt(0).toUpperCase() + color.slice(1)}
					/>
				);
			})}
		</div>
	);
}
