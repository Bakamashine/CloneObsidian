# Modal Window — New File / New Folder

The create-item modal is the dialog used to add files and folders to the vault
(the `userData/userData` directory). It is visual-only until submitted — nothing
is created until you press **Create** or **Enter**.

## Opening the modal

There are two ways to open it:

1. **Header plus button** — click the `+` icon in the explorer header ("Files"
   panel). Creates at the vault root.
2. **Context menu** — right-click a file, a folder, or the empty area of the
   file list and choose **New File** or **New Folder**.

| Where you right-click | Resulting location        |
| --------------------- | ------------------------- |
| Empty list area       | Vault root                |
| A folder              | Inside that folder        |
| A file                | In the file's parent dir  |

## Window layout

```
┌──────────────────────────────────────┐
│  New file                            │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Untitled.md                    │  │  ← name input
│  └────────────────────────────────┘  │
│  in docs                             │  ← only shown when creating
│                                      │     inside a folder
│                        [Cancel] [Create]
└──────────────────────────────────────┘
```

- **Title** — `New file` or `New folder`, depending on the chosen action.
- **Input** — the name of the new item. For files, include the extension
  (e.g. `Notes.md`); it is not added automatically.
- **`in <folder>` hint** — appears under the input when the item will be
  created inside a folder (context-menu flow).
- **Cancel** — closes the modal without creating anything.
- **Create** — creates the item and refreshes the file list. Disabled while
  the input is empty or contains only whitespace.

## Keyboard shortcuts

| Key       | Action                                    |
| --------- | ----------------------------------------- |
| `Enter`   | Submit (same as pressing **Create**)      |
| `Escape`  | Close the modal (same as **Cancel**)      |

Clicking anywhere outside the modal also closes it.

## Examples

### Example 1 — create a note at the root

1. Click the `+` button in the explorer header.
2. Type `Daily Notes.md` into the input.
3. Press `Enter`.

Result: the file `Daily Notes.md` appears at the top level of the sidebar and
is immediately usable (e.g. clickable to open a tab).

### Example 2 — create a file inside a folder

1. Right-click the folder `docs` in the sidebar.
2. Choose **New File**.
3. The modal shows the hint `in docs` under the input.
4. Type `roadmap.md` and press `Enter`.

Result: the file `docs/roadmap.md` is created and appears indented under
`docs` in the sidebar.

```
docs
  roadmap.md     ← new file
```

### Example 3 — create a nested folder

1. Right-click the folder `docs`.
2. Choose **New Folder**.
3. Type `archive` and click **Create**.

Result: `docs/archive` is created. Right-clicking `archive` and repeating the
flow creates items at any depth (`docs/archive/2026.md`, and so on).

### Example 4 — cancel without creating anything

1. Open the modal (any way from the list above).
2. Type something, then change your mind.
3. Press `Escape` (or click **Cancel**).

Result: nothing is written to disk; the file list is unchanged.

## Notes

- Names are created relative to the vault root; the app rejects paths that
  would escape it (e.g. `../something`).
- Creating a file with an existing name inside the same folder overwrites it.
- Creating a folder that already exists fails silently and leaves the list
  unchanged.
- Up to three levels of nesting are indented in the sidebar
  (`file-item--depth-1..3`); deeper items reuse the last indentation level.
