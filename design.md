# design

Universal design skill capturing the minimalistic, sleek design language of quantum development tools. Apply this language when building or extending apps.

## UI/UX

### Interaction model
- **Keyboard-driven, no buttons.** Every action is a keybind or a `:`-command palette. The only clickable chrome is a folder glyph (workspace picker) and a config label.
- **Vim-style directional navigation** for focus movement between panels (H/J/K/L).
- **Modal overlays** (command palette, picker, config) rendered via `egui::Area` with `Order::Foreground`. Escape dismisses any modal. Global keybinds are suppressed while a modal is open.
- **Tiling window manager** via binary-tree split layout. Each leaf holds its own presentation state (scroll, rotation). Split handles are invisible until hover (cursor changes to resize). Auto-split direction: horizontal when tile is 1.2× wider than tall, vertical otherwise.
- **Status bar** top and bottom strips. Top: workspace path, active simulator badge, compare indicator, config. Bottom: transient flash messages (yellow = OK, red = error, muted = info). Messages auto-clear.

### Typography
- **Monospace everywhere.** All labels, titles, data displays, status messages use monospace font. Use `RichText::new(...).monospace()` consistently.
- Headers: title, separator dot (`·`), metadata right-aligned via `ui.with_layout(egui::Layout::right_to_left(), ...)`.

## Visual Design

### Color palette (dark theme)
```
Background:   #1E1E1E   — main canvas
Panel:        #181818   — embedded surfaces
Elevated:     #262626   — cards, popups, overlays
Hover:        #333333   — interactive highlight
Active:       #404040   — pressed / selected
Accent Yellow:#E5C07B   — primary highlight, focus border, status-ok
Accent Red:   #E06C6C   — errors, important metrics
Accent Purple:#B78FD4   — imaginary amplitudes, entanglement
Accent Green: #9CC88E   — compare mode, noise enabled, success
Text Primary: #F2F2F2   — body, labels, data
Text Muted:   #888888   — secondary info, metadata
Text Dim:     #555555   — disabled, placeholder
Grid Line:    #2A2A2A   — separators, wire guides
Wire:         #6F6F6F   — circuit wires
```

### Spacing scale
```
XS: 2px, SM: 4px, MD: 8px, LG: 12px, XL: 16px
```

### Borders and dividers
- **1px hairline strokes** for tile borders, panel edges, circuit grid lines.
- **Focus border**: accent yellow (#E5C07B) stroke on the focused tile.
- **Dividers**: 1px `GRID_LINE` stroke with MD vertical margin, spanning full width.
- **Panel rounding**: subtle (4–6px), just enough to read as a distinct surface.

### Component patterns
- **Section cards**: elevated background (#262626), rounded corners, inner padding (MD–LG), optional 1px border.
- **Metric cards**: compact card with large value in accent color, small muted label below.
- **Badges**: small monospace labels with subdued background for gate names, simulator kind, mode indicators.
- **Mini progress bars**: thin horizontal bar (4–6px height) for noise levels, probabilities.
- **Heatmaps**: color-mapped grid cells for density matrices, using a dark-to-accent gradient.

## Architecture

### Composition root
- Single `AppState` struct owns all mutable state. No scattered state management.
- Data flows one way: input → parse → derive → render. Parsing is live (every keystroke), simulation is explicit (on run command only).

### Trait-free component dispatch
- Every UI panel is a **free function** named `show(ui, &mut state, ...)`, not a trait impl.
- A single `render_view` function matches on a `ViewKind` enum to dispatch. Adding a view = one match arm + one module. No boxed trait objects.

### Statevector as source of truth
- All simulation backends produce `(num_qubits, Vec<Complex>)`.
- Probabilities, Bloch vectors, entropy, fidelity, density matrix are all **derived** from the statevector in pure computation.
- Noise is applied to the statevector before derivation, so all downstream panels see the noisy result.

### Module separation
- `state/` — all data, domain types, derivations.
- `components/` — all rendering, one module per view.
- `dsl/` — lexing and parsing, no rendering, no simulation.
- `app.rs` — geometry, focus, key dispatch only. No drawing logic.

## Error handling
- **`Result<(), String>`** for fallible operations. Errors are human-readable single-line strings displayed as flash messages.
- **`Result<T, String>`** for runner outputs.
- External process stderr is filtered to extract the first useful line, stripping backtraces and compiler notes.
- Graceful fallback: if a CLI flag isn't recognized by an older binary, retry without it.

## Testing
- **Unit tests only.** Inline `#[cfg(test)] mod tests` at the bottom of source files.
- Test pure computation (parsing, statevector derivation, Bloch math), never UI widgets.
- Floating-point comparisons use `approx_eq(a, b)` with epsilon `1e-4`.
- Test data as `const` string slices representing real output.

## Coding conventions
- Module-level doc comments explaining purpose, design rationale, and data flow.
- Enums imported as `crate::module::EnumName`, variants used directly.
- Design tokens accessed as `color::ACCENT_YELLOW`, `space::MD`.
- Constructor functions: `fresh()`, `leaf()`, `ground_state()`.
- Platform gating: `#[cfg(not(target_arch = "wasm32"))]` for desktop-only, with WASM stubs.
- Clone-before-mutate to avoid borrow conflicts: copy data out, then mutate state.
- `Id::new()` with consistent salt strings for scroll areas and persistent widget state.
