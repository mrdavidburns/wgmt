// Feeds the CMS-managed FAQ into the `faq` template variable so
// partials/schema.njk emits FAQPage markup for this page.
import serviceAreas from "./_data/serviceAreas.json" with { type: "json" };

export default {
  faq: serviceAreas.faq,
};
