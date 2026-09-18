/**
 * Chart colours, shared by every visualisation.
 *
 * Restrained on purpose: these sit on a warm off-white page, so saturated
 * series colours shout. Each is dark enough to read as a label against the
 * page and distinct enough to tell apart, including for the most common
 * forms of colour blindness — the hues are spread across blue, teal, green,
 * amber and clay rather than around a single blue-purple arc.
 */
export const SERIES = ["#3c6fb0", "#137a75", "#4f8a5b", "#b9781f", "#8a6ea8"] as const;

/** Grid lines and axes: present, never competing with the data. */
export const CHART_GRID = "#e1dbd0";
export const CHART_AXIS_TEXT = "#33383e";

/** A single-value fill, for rings and progress bars. */
export const CHART_PRIMARY = "#3c6fb0";
export const CHART_TRACK = "#ece7dd";
