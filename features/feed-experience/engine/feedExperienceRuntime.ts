import { FeedExperienceRegistry, registerDefaultExperiences } from "../registry";
import { createFeedExperienceEngine } from "./feedExperienceEngine";

const registry = new FeedExperienceRegistry();
registerDefaultExperiences(registry);
export const feedExperienceEngine = createFeedExperienceEngine(registry);
