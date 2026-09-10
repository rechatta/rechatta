import { RiRobotFill, RiMagicFill } from "@remixicon/react";

const tools = [
  { icon: RiRobotFill, title: "Agent builder", desc: "Configure a custom agent with its own tools and instructions" },
  { icon: RiMagicFill, title: "Prompt assist", desc: "Turn a rough idea into a well-structured prompt" },
];

export function StudioView() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-8 pb-4 pt-9 [animation:fade-in_0.2s_ease-out_both]">
      <div className="w-full max-w-[720px]">
        <h1 className="text-[26px] font-bold tracking-tight text-text-1">Studio</h1>
        <p className="mt-1.5 text-[14px] text-text-2">Build and configure the tools your agents use.</p>

        <div className="mt-7.5 grid grid-cols-2 gap-3.5 max-[860px]:grid-cols-1">
          {tools.map(({ icon: Icon, title, desc }) => (
            <button
              key={title}
              className="rounded-[26px] border border-border bg-surface p-4.5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-border-soft hover:shadow-card-hover"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-surface-inset text-text-1">
                <Icon className="size-[19px]" />
              </div>
              <div className="mb-1 text-[14.5px] font-bold text-text-1">{title}</div>
              <div className="text-[12.8px] leading-snug text-text-2">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
