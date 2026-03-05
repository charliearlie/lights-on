import { Link } from "react-router";

export interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    is_public: boolean;
    image_states: Array<{ id: string; states: any }>;
    updated_at: string;
  };
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const imageCount = project.image_states?.length ?? 0;
  const firstImageUrl =
    project.image_states?.[0]?.states?.[0]?.image_url ?? null;

  return (
    <Link
      to={`/app/project/${project.id}`}
      className="group block overflow-hidden rounded-xl border border-border-light transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-border-dark dark:hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_24px_rgba(245,158,11,0.08)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-light dark:bg-surface-dark">
        {firstImageUrl ? (
          <img
            src={firstImageUrl}
            alt={project.name}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#E7E5E4] to-[#D6D3D1] dark:from-[#292524] dark:to-[#1C1917]">
            <svg
              className="h-10 w-10 text-[#A8A29E] dark:text-[#57534E]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path
                d="M21 15l-5-5L5 21"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="border-t border-border-light bg-card-light px-4 pb-4 pt-3 transition-colors duration-300 dark:border-border-dark dark:bg-card-dark">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base italic leading-tight text-[#1C1917] dark:text-[#F5F0E8]">
            {project.name}
          </h3>
          <span
            className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-medium uppercase tracking-[0.1em] ${
              project.is_public
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-[#F5F5F4] text-[#78716C] dark:bg-[#292524] dark:text-[#A8A097]"
            }`}
          >
            {project.is_public ? "Public" : "Private"}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[0.75rem] text-[#78716C] dark:text-[#A8A097]">
            {imageCount} {imageCount === 1 ? "image" : "images"}
          </span>
          <span className="text-[0.6875rem] text-[#A8A29E] dark:text-[#57534E]">
            Updated {timeAgo(project.updated_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
