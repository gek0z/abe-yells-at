import { useEffect, useRef, useState } from "react";

function randomBetween(min: number, max: number) {
	return min + Math.random() * (max - min);
}

interface CloudConfig {
	width: number;
	top: number;
	opacity: number;
	duration: number;
	reverse: boolean;
}

function randomCloud(reverse: boolean): CloudConfig {
	return {
		width: Math.round(randomBetween(100, 300)),
		top: Math.round(randomBetween(5, 35)),
		opacity: +randomBetween(0.15, 0.5).toFixed(2),
		duration: Math.round(randomBetween(20, 50)),
		reverse,
	};
}

const CLOUD_COUNT = 4;

function Cloud({ initial, index }: { initial: CloudConfig; index: number }) {
	const ref = useRef<HTMLDivElement>(null);
	const delay = useRef(-Math.round(randomBetween(0, initial.duration)));

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const handler = () => {
			const c = randomCloud(initial.reverse);
			el.style.setProperty("--cloud-w", `${c.width}px`);
			el.style.top = `${c.top}%`;
			el.style.opacity = `${c.opacity}`;
		};
		el.addEventListener("animationiteration", handler);
		return () => el.removeEventListener("animationiteration", handler);
	}, [initial.reverse]);

	return (
		<div
			ref={ref}
			className={`cloud${index >= 2 ? " cloud-desktop" : ""}`}
			style={
				{
					"--cloud-w": `${initial.width}px`,
					top: `${initial.top}%`,
					opacity: initial.opacity,
					animation: `${initial.reverse ? "floatCloudReverse" : "floatCloud"} ${initial.duration}s linear infinite`,
					animationDelay: `${delay.current}s`,
				} as React.CSSProperties
			}
		/>
	);
}

export function CloudBackground() {
	const [initialConfigs] = useState(() =>
		Array.from({ length: CLOUD_COUNT }, (_, i) => ({
			id: `cloud-${i}`,
			config: randomCloud(i % 2 === 1),
			index: i,
		})),
	);

	return (
		<>
			{initialConfigs.map((c) => (
				<Cloud key={c.id} initial={c.config} index={c.index} />
			))}
		</>
	);
}
