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
export { Select, ListBox } from "./Select";
export { Autocomplete } from "./Autocomplete";
export { SearchField } from "./SearchField";
export { Skeleton, type UISkeletonProps } from "./Skeleton";
export { Chip } from "./Chip";
export { StatusChip } from "./StatusChip";
export { Reveal } from "./Reveal";
export { TextArea, type UITextAreaProps } from "./TextArea";
export { Pagination, type UIPaginationProps } from "./Pagination";
export {
  ConfirmDialog,
  type ConfirmDialogProps,
  type ConfirmIntent,
} from "./ConfirmDialog";
export { useConfirm, ConfirmRoot, type ConfirmOptions } from "./useConfirm";

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
  Table,
  Modal,
  AlertDialog,
  Checkbox,
  RadioGroup,
  Radio,
  EmptyState,
  useFilter,
} from "@heroui/react";
