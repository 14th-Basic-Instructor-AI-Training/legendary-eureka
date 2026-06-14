/**
 * Jalat UI layer — the ONLY place feature code imports HeroUI from.
 * Extended wrappers (Button/Input/Card) live here; primitives we use as-is are
 * re-exported as pass-throughs so `@heroui/react` is never imported directly
 * outside `src/ui`.
 */
export { Button, type UIButtonProps } from "./Button";
export { Input, type UIInputProps } from "./Input";
export { PasswordInput, type UIPasswordInputProps } from "./PasswordInput";
export { Card } from "./Card";
export { JalatCard, type JalatCardProps } from "./JalatCard";
export { RatingBadge } from "./RatingBadge";
export { concaveMaskStyle, CONCAVE_RADIUS } from "./concaveCorners";
export {
  JalatCardClipDefs,
  JALAT_CARD_CLIP_ID,
  jalatCardClipStyle,
  jalatCardClipShadowStyle,
} from "./jalatCardClip";
export { Select, ListBox } from "./Select";
export { Skeleton, type UISkeletonProps } from "./Skeleton";
export { Chip } from "./Chip";
export { StatusChip } from "./StatusChip";
export { Reveal } from "./Reveal";
export { TextArea, type UITextAreaProps } from "./TextArea";
export { DatePicker, type UIDatePickerProps } from "./DatePicker";
export { NumberStepper, type UINumberStepperProps } from "./NumberStepper";
export { Switch, type UISwitchProps } from "./Switch";
export { RangeSlider, type UIRangeSliderProps } from "./RangeSlider";

// Pass-through HeroUI v3 primitives (re-exported through the wrapper layer).
// Compound components (Tabs/Modal/AlertDialog) keep their sub-component API.
export {
  Form,
  Label,
  Avatar,
  Spinner,
  Separator,
  Link,
  Dropdown,
  Tabs,
  Modal,
  AlertDialog,
  Checkbox,
  RadioGroup,
  Radio,
} from "@heroui/react";
