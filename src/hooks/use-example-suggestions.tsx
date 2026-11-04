/**
 * Suggestion pills shown in the chat UI. Each suggestion triggers a specific
 * demo feature when clicked.
 *
 * Ordered from most constrained (fixed UI) to most open (freeform UI).
 *
 * Showcase mode (showcase.json) controls which pills are visually highlighted.
 * Highlight styling: globals.css (.a2ui-highlight, .opengenui-highlight)
 * A2UI agent tools: agent/src/a2ui_fixed_schema.py, a2ui_dynamic_schema.py
 * A2UI catalog: src/app/declarative-generative-ui/
 */
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";
import showcaseConfig from "../../showcase.json";

const showcase = showcaseConfig.showcase;
export const useExampleSuggestions = () => {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Check Documents",
        message: "What documents are currently in my knowledge bucket?",
      },
      {
        title: "Summarize Knowledge Base",
        message: "Based on the uploaded documents in the bucket, summarize the key points and cite the sources.",
      },
      {
        title: "Ask Document Details",
        message: "Search the knowledge bucket and tell me the main takeaways.",
      },
    ],
    available: "always",
  });
};