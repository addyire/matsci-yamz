import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "./routers/_app";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
