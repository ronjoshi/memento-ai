"use client";

interface PhoneMockupProps {
	videoSrc: string;
	caption?: string;
}

export default function PhoneMockup({ videoSrc, caption }: PhoneMockupProps) {
	return (
		<div className="flex flex-col items-center gap-4">
			{/* Phone outer shell */}
			<div className="relative w-full max-w-[260px] aspect-[9/19.5] rounded-[2.5rem] border-2 border-card-border bg-black p-[6px] shadow-[0_0_40px_rgba(34,211,238,0.08)]">
				{/* Inner screen */}
				<div className="relative w-full h-full rounded-[2.25rem] overflow-hidden bg-card">
					{/* Dynamic Island notch */}
					<div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />

					{/* Video */}
					<video
						autoPlay
						loop
						muted
						playsInline
						preload="metadata"
						className="w-full h-full object-cover"
					>
						<source src={videoSrc} type="video/mp4" />
					</video>
				</div>
			</div>

			{/* Optional caption */}
			{caption && (
				<p className="text-sm text-muted-foreground text-center">
					{caption}
				</p>
			)}
		</div>
	);
}
