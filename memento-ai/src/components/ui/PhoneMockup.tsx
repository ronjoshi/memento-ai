"use client";

interface PhoneMockupProps {
	videoSrc: string;
	caption?: string;
}

export default function PhoneMockup({ videoSrc, caption }: PhoneMockupProps) {
	return (
		<div className="flex flex-col items-center gap-4 w-full max-w-[260px]">
			{/* Phone shell */}
			<div className="w-full rounded-[2.5rem] border-2 border-card-border bg-black p-[6px] shadow-[0_0_40px_rgba(34,211,238,0.08)]">
				{/* Inner screen */}
				<div className="w-full rounded-[2.25rem] overflow-hidden bg-card">
					<video
						autoPlay
						loop
						muted
						playsInline
						preload="metadata"
						className="w-full aspect-[9/19.5] object-cover"
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
