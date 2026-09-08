/**
 * Human-readable names for the question types, used on the assessment detail
 * page so a visitor knows what the experience actually feels like before they
 * commit 15–30 minutes to it.
 *
 * Keys mirror `QuestionType`. A type with no entry here is simply omitted
 * from the display rather than shown as a raw enum name.
 */
export const QUESTION_FORMAT_LABELS: Record<string, string> = {
  multiple_choice: "Multiple choice",
  multiple_select: "Select all that apply",
  true_false: "True or false",
  rating_scale: "Rating scale",
  likert_scale: "Agree/disagree scale",
  slider: "Slider",
  numeric_input: "Numeric answer",
  text_input: "Short written answer",
  long_text: "Written response",
  open_creative: "Open-ended creative response",
  image_choice: "Visual multiple choice",
  image_upload: "Photo upload",
  sequence: "Put items in order",
  drag_drop: "Drag and drop",
  matching: "Matching pairs",
  timed_choice: "Timed multiple choice",
  memory_recall: "Free recall from memory",
  memory_recognition: "Recognition from memory",
  pattern_question: "Visual pattern completion",
  visual_rotation: "Mental rotation",
  custom_interactive: "Interactive task",
};
