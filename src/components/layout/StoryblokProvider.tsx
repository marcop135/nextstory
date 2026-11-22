import type { ReactNode } from "react";

import { registerStoryblokComponents } from "@/lib/storyblok";

export default function StoryblokProvider({ children }: { children: ReactNode }) {
  registerStoryblokComponents();
  return children;
}
