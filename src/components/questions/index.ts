import { registerQuestionComponent } from "./registry";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { MultipleSelectQuestion } from "./MultipleSelectQuestion";
import { TrueFalseQuestion } from "./TrueFalseQuestion";
import { RatingScaleQuestion } from "./RatingScaleQuestion";
import { LikertScaleQuestion } from "./LikertScaleQuestion";
import { SliderQuestion } from "./SliderQuestion";
import { NumericInputQuestion } from "./NumericInputQuestion";
import { TextInputQuestion } from "./TextInputQuestion";
import { LongTextQuestion, OpenCreativeQuestion } from "./LongTextQuestion";
import { ImageChoiceQuestion } from "./ImageChoiceQuestion";
import { ImageUploadQuestion } from "./ImageUploadQuestion";
import { SequenceQuestion } from "./SequenceQuestion";
import { DragDropQuestion } from "./DragDropQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { TimedChoiceQuestion } from "./TimedChoiceQuestion";
import { MemoryRecallQuestion } from "./MemoryRecallQuestion";
import { CustomInteractiveQuestion } from "./CustomInteractiveQuestion";

let registered = false;

/** Idempotently registers every built-in question type. Call once at app bootstrap. */
export function registerBuiltInQuestionComponents() {
  if (registered) return;
  registered = true;

  registerQuestionComponent("multiple_choice", MultipleChoiceQuestion);
  registerQuestionComponent("multiple_select", MultipleSelectQuestion);
  registerQuestionComponent("true_false", TrueFalseQuestion);
  registerQuestionComponent("rating_scale", RatingScaleQuestion);
  registerQuestionComponent("likert_scale", LikertScaleQuestion);
  registerQuestionComponent("slider", SliderQuestion);
  registerQuestionComponent("numeric_input", NumericInputQuestion);
  registerQuestionComponent("text_input", TextInputQuestion);
  registerQuestionComponent("long_text", LongTextQuestion);
  registerQuestionComponent("image_choice", ImageChoiceQuestion);
  registerQuestionComponent("image_upload", ImageUploadQuestion);
  registerQuestionComponent("sequence", SequenceQuestion);
  registerQuestionComponent("drag_drop", DragDropQuestion);
  registerQuestionComponent("matching", MatchingQuestion);
  registerQuestionComponent("timed_choice", TimedChoiceQuestion);
  registerQuestionComponent("memory_recall", MemoryRecallQuestion);
  registerQuestionComponent("pattern_question", ImageChoiceQuestion);
  registerQuestionComponent("visual_rotation", ImageChoiceQuestion);
  registerQuestionComponent("open_creative", OpenCreativeQuestion);
  registerQuestionComponent("custom_interactive", CustomInteractiveQuestion);
}
