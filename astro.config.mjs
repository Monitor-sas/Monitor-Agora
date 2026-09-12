// @ts-check

import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

export default defineConfig({
	output: "server",
	adapter: vercel(),
	vite: {
		server: {
			cors: {
				origin: "*",
			},
		},
	},
});
