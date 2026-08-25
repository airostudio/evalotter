-- A dedicated question type for study-then-recognize memory exercises
-- (ISLT shopping list, SKT object recall): the study phase shows the
-- correct options, then the user picks them out of a shuffled grid that
-- includes distractors. Answer shape is the same as multiple_select (a set
-- of chosen option ids), so it reuses the existing, already-correct
-- multiple_select scoring path — only the UI/study-phase behavior differs
-- from a plain multiple_select question, which is why it's a distinct type
-- rather than overloading multiple_select's semantics.
alter type question_type add value 'memory_recognition';
