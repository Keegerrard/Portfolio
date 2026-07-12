import { useEffect, useState } from "react";
import {
	AnimatePresence,
	motion,
	MotionConfig,
	type Transition,
} from "motion/react";

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */
export type ProjectCategory = "finance" | "ai" | "web";

export interface Project {
	id: string;
	title: string;
	category: ProjectCategory;
	year: string;
	/** One-line summary shown on the bento card. */
	summary: string;
	/** Longer narrative shown inside the expanded preview. */
	description: string;
	/** Notable outcomes / bullet highlights for the preview. */
	highlights: string[];
	stack: string[];
	/** Public GitHub repository URL, when the code is open. */
	repo?: string;
	/** Bento sizing hint driving the asymmetric grid spans. */
	size?: "lg" | "wide" | "md";
}

interface ProjectGalleryProps {
	projects: Project[];
}

/* ------------------------------------------------------------------
   Motion — tight structural spring (Apple mass/spring physics)
   ------------------------------------------------------------------ */
const SPRING: Transition = { type: "spring", mass: 1, stiffness: 120, damping: 20 };

const SIZE_CLASS: Record<NonNullable<Project["size"]>, string> = {
	lg: "lg:col-span-2 lg:row-span-2 min-h-[280px]",
	wide: "lg:col-span-2 min-h-[200px]",
	md: "min-h-[200px]",
};

const CATEGORY: Record<
	ProjectCategory,
	{ label: string; tint: string; color: string }
> = {
	finance: { label: "Finance", tint: "rgba(0, 113, 227, 0.10)", color: "#0071e3" },
	ai: { label: "AI / ML", tint: "rgba(175, 82, 222, 0.10)", color: "#af52de" },
	web: { label: "Web", tint: "rgba(52, 199, 89, 0.12)", color: "#248a3d" },
};

function CategoryIcon({ category, size = 20 }: { category: ProjectCategory; size?: number }) {
	const common = {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.8,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
	};
	if (category === "finance") {
		return (
			<svg {...common} aria-hidden="true">
				<path d="M3 3v18h18" />
				<path d="M7 15l4-5 3 3 5-7" />
			</svg>
		);
	}
	if (category === "ai") {
		return (
			<svg {...common} aria-hidden="true">
				<rect x="4" y="4" width="16" height="16" rx="4" />
				<path d="M9 9h.01M15 9h.01M9 14h6" />
			</svg>
		);
	}
	return (
		<svg {...common} aria-hidden="true">
			<rect x="3" y="4" width="18" height="14" rx="2" />
			<path d="M3 9h18M8 21h8" />
		</svg>
	);
}

function GitHubIcon({ size = 15 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.05 10.05 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
		</svg>
	);
}

/* ------------------------------------------------------------------
   Gallery
   ------------------------------------------------------------------ */
export default function ProjectGallery({ projects }: ProjectGalleryProps) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const active = projects.find((p) => p.id === activeId) ?? null;

	// Lock body scroll + close on Escape while the preview is open.
	useEffect(() => {
		if (!active) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setActiveId(null);
		};
		document.addEventListener("keydown", onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prevOverflow;
		};
	}, [active]);

	return (
		<MotionConfig reducedMotion="user" transition={SPRING}>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[minmax(200px,1fr)]">
				{projects.map((project) => {
					const cat = CATEGORY[project.category];
					const isFeatured = project.size === "lg";
					return (
						<motion.button
							key={project.id}
							layoutId={`card-${project.id}`}
							onClick={() => setActiveId(project.id)}
							whileHover={{ y: -4 }}
							whileTap={{ scale: 0.985 }}
							animate={{ opacity: activeId === project.id ? 0 : 1 }}
							transition={SPRING}
							className={[
								"lift-shadow group relative flex cursor-pointer flex-col rounded-3xl border border-hairline bg-white p-6 text-left",
								"shadow-[var(--shadow-rest)]",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
								SIZE_CLASS[project.size ?? "md"],
							].join(" ")}
						>
							<div className="flex items-center justify-between">
								<span
									className="flex h-10 w-10 items-center justify-center rounded-xl"
									style={{ background: cat.tint, color: cat.color }}
								>
									<CategoryIcon category={project.category} />
								</span>
								<span className="text-xs font-medium text-ink-faint">{project.year}</span>
							</div>

							<div className="mt-auto pt-8">
								<h3
									className={[
										"font-semibold tracking-tight text-ink",
										isFeatured ? "text-2xl sm:text-[1.7rem]" : "text-lg",
									].join(" ")}
								>
									{project.title}
								</h3>
								<p
									className={[
										"mt-1.5 leading-relaxed text-ink-muted",
										isFeatured ? "max-w-md text-[0.95rem]" : "text-sm",
									].join(" ")}
								>
									{project.summary}
								</p>

								<div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-faint">
									<span>{project.stack.slice(0, isFeatured ? 4 : 3).join(" · ")}</span>
									{project.repo && (
										<span className="inline-flex items-center gap-1 font-medium text-ink-muted">
											<GitHubIcon size={13} />
											Code
										</span>
									)}
								</div>
							</div>
						</motion.button>
					);
				})}
			</div>

			<AnimatePresence>
				{active && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
						{/* Backdrop */}
						<motion.div
							className="absolute inset-0 bg-black/30 backdrop-blur-sm"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.22 }}
							onClick={() => setActiveId(null)}
						/>

						{/* Shared-layout expansion */}
						<motion.div
							layoutId={`card-${active.id}`}
							role="dialog"
							aria-modal="true"
							aria-label={active.title}
							className="relative z-10 flex max-h-[86vh] w-full max-w-xl flex-col overflow-hidden rounded-4xl border border-hairline bg-white shadow-2xl"
						>
							<div className="flex items-start justify-between p-6 pb-0 sm:p-8 sm:pb-0">
								<span
									className="flex h-12 w-12 items-center justify-center rounded-2xl"
									style={{
										background: CATEGORY[active.category].tint,
										color: CATEGORY[active.category].color,
									}}
								>
									<CategoryIcon category={active.category} size={24} />
								</span>
								<button
									onClick={() => setActiveId(null)}
									aria-label="Close preview"
									className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-panel text-ink-muted transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<path d="M18 6 6 18M6 6l12 12" />
									</svg>
								</button>
							</div>

							{/* Body — fades in over the morph */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1, ...SPRING }}
								className="flex-1 overflow-y-auto p-6 pt-5 sm:p-8 sm:pt-6"
							>
								<p className="text-xs font-medium text-ink-faint">
									{CATEGORY[active.category].label} · {active.year}
								</p>
								<h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
									{active.title}
								</h2>
								<p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted">
									{active.description}
								</p>

								{active.highlights.length > 0 && (
									<ul className="mt-5 space-y-2">
										{active.highlights.map((h) => (
											<li key={h} className="flex gap-2.5 text-[0.92rem] leading-relaxed text-ink-muted">
												<svg className="mt-1 shrink-0 text-accent" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
													<path d="M20 6 9 17l-5-5" />
												</svg>
												{h}
											</li>
										))}
									</ul>
								)}

								<div className="mt-6 flex flex-wrap gap-2">
									{active.stack.map((tech) => (
										<span
											key={tech}
											className="rounded-full bg-panel px-3 py-1.5 text-xs font-medium text-ink-muted"
										>
											{tech}
										</span>
									))}
								</div>

								<div className="mt-7 flex items-center gap-4">
									{active.repo ? (
										<a
											href={active.repo}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-85"
										>
											<GitHubIcon />
											View on GitHub
										</a>
									) : (
										<span className="text-xs text-ink-faint">
											Private / client codebase — code not public.
										</span>
									)}
								</div>
							</motion.div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</MotionConfig>
	);
}
