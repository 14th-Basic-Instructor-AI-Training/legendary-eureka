/**
 * Jalat Select — HeroUI v3 Select (compound) routed through the wrapper layer so
 * feature code imports from `@/ui`, never `@heroui/react`. Options are rendered
 * with `ListBox` / `ListBox.Item` inside `Select.Popover` (also re-exported here).
 *
 *   <Select aria-label="…" selectedKey={k} onSelectionChange={setK} variant="secondary">
 *     <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
 *     <Select.Popover><ListBox>
 *       <ListBox.Item id="x" textValue="X">X</ListBox.Item>
 *     </ListBox></Select.Popover>
 *   </Select>
 */
export { Select, ListBox } from "@heroui/react";
