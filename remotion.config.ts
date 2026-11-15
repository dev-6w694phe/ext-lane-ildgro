import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
// WebGL in headless Chrome: "angle" works on most machines; use "swangle" (CPU) if no GPU is available.
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(1);
