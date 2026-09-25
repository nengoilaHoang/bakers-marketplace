import { BaseLayoutComponentConfig } from "@/types/layout-component";
import React, { useMemo, useState } from "react";

type ConfigSidebarProps<T extends BaseLayoutComponentConfig<unknown>> = {
  config: T;
  onUpdate: (updated: Partial<T>) => void;
};

export type ConfigSection<
  T extends BaseLayoutComponentConfig = BaseLayoutComponentConfig,
> = {
  id: SectionId;
  title: string;
  description?: string;
  values: Record<keyof T, T[keyof T]>;
};

type SectionId = "dimensions" | "alignment" | "padding" | "theme" | "custom";

type ConfigSectionProps<
  T extends BaseLayoutComponentConfig = BaseLayoutComponentConfig,
> = {
  id: SectionId;
  title: string;
  description?: string;
  values: Record<keyof T, T[keyof T]>;
  isOpen: boolean;
  onToggle: (id: SectionId) => void;
  onChangeValue: (key: keyof T, val: unknown) => void;
};

const formatLabel = (key: string) => {
  const overrides: Record<string, string> = {
    w: "Width",
    h: "Height",
    alignX: "Horizontal Alignment",
    alignY: "Vertical Alignment",
    padding: "Padding",
    colorScheme: "Color Scheme",
    colorPalette: "Color Palette",
  };

  return overrides[key] ?? key;
};

const ConfigSectionItem = ({
  id,
  title,
  description,
  values,
  isOpen,
  onToggle,
  onChangeValue,
}: ConfigSectionProps) => {
  const entries = Object.entries(values);
  const isMultiField = entries.length === 2;

  return (
    <div className="border-b border-zinc-200/80 transition-colors">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between py-3 px-4 text-left hover:bg-zinc-50 transition-colors"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
          {title}
        </span>
        <span
          className={`text-[10px] text-zinc-400 transition-transform duration-200 ease-out select-none ${isOpen ? "rotate-180" : ""}`.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className={`px-4 pb-4 pt-0 space-y-3`}>
            {description && (
              <p className="text-xs text-zinc-500 leading-relaxed">
                {description}
              </p>
            )}
            <div
              className={`${isMultiField ? "grid grid-cols-2 gap-2" : "space-y-2.5"}`}
            >
              {entries.map(([key, value]) => (
                <div key={String(key)} className="space-y-1">
                  <label
                    className="block text-[11px] font-medium text-zinc-500 capitalize"
                    htmlFor=""
                  >
                    {formatLabel(String(key))}
                  </label>
                  <div className="relative rounded-md shadow-xs">
                    <input
                      type="text"
                      value={(value as string) ?? ""}
                      onChange={(e) => onChangeValue(key, e.target.value)}
                      className="block w-full rounded-md border border-zinc-200 bg-zinc-50/50 px-2.5 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 transition hover:bg-white focus:bg-white focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfigSidebar = <T extends BaseLayoutComponentConfig<unknown>>({
  config,
  onUpdate,
}: ConfigSidebarProps<T>) => {
  const [openConfig, setOpenConfig] = useState(false);
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    dimensions: true,
    alignment: true,
    padding: true,
    theme: true,
    custom: true,
  });

  const handleToggleConfig = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenConfig((prev) => !prev);
  };

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sections: ConfigSection[] = useMemo(
    () => [
      {
        id: "dimensions",
        title: "Dimensions",
        description: "Adjust the width and height of the component.",
        values: {
          w: config.w,
          h: config.h,
        },
      },
      {
        id: "alignment",
        title: "Alignment",
        description:
          "Set the horizontal and vertical alignment of the component.",
        values: {
          alignX: config.alignX,
          alignY: config.alignY,
        },
      },
      {
        id: "padding",
        title: "Padding",
        description: "Configure the padding around the component.",
        values: {
          padding: config.padding,
        },
      },
      {
        id: "theme",
        title: "Theme",
        description: "Choose a color scheme and palette for the component.",
        values: {
          colorScheme: config.colorScheme,
          colorPalette: config.colorPalette,
        },
      },
    ],
    [config],
  );

  return (
    <aside
      aria-label="Configuration Panel"
      className={`absolute top-0 bottom-0 right-0 z-50 min-w-0 w-[360px] ${openConfig ? "translate-x-0" : "translate-x-full"} bg-white border-l border-zinc-200 p-6 transition-transform duration-200 ease-out`}
    >
      <button
        className="absolute left-0 top-6 p-1 -translate-x-full flex items-center justify-center rounded-l-md border-l border-y border-zinc-200 bg-white shadow-md text-zinc-600 hover:text-zinc-950"
        onClick={handleToggleConfig}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className={`transition-all duration-100 ${openConfig ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
        >
          <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
        </svg>
      </button>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {sections.map((section) => (
          <ConfigSectionItem
            key={section.id}
            {...section}
            isOpen={openSections[section.id]}
            onToggle={toggleSection}
            onChangeValue={(key, val) => onUpdate({ [key]: val } as Partial<T>)}
          />
        ))}
      </div>
    </aside>
  );
};

export default ConfigSidebar;
