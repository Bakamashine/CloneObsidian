# Markdown Instruction

Markdown is a plain-text formatting syntax. Files in the vault are `.md`
files written with it. Below is the complete set of supported elements with
examples.

---

## Headings

Create a heading with `#` signs. One `#` is the biggest, six `#` the smallest.

```markdown
# Heading 1
## Heading 2
### Heading 3
###### Heading 6
```

---

## Text emphasis

| Style          | Markdown      | Result          |
| -------------- | ------------- | --------------- |
| Bold           | `**text**`    | **text**        |
| Italic         | `*text*`      | *text*          |
| Bold + italic  | `***text***`  | ***text***      |
| Strikethrough  | `~~text~~`    | ~~text~~        |
| Highlight      | `==text==`    | ==text==        |

---

## Lists

### Unordered

```markdown
- item
- item
  - nested item
```

### Ordered

```markdown
1. first
2. second
3. third
```

### Task list (checkboxes)

```markdown
- [x] done
- [ ] todo
```

- [x] done
- [ ] todo

---

## Links

```markdown
[link text](https://example.com)
[local note](Other%20Note.md)
```

- `[link text](https://example.com)` → [link text](https://example.com)
- A URL pasted as plain text is also recognized automatically.

---

## Code

### Inline code

Wrap with single backticks:

```markdown
Use `npm start` to run the app.
```

Use `npm start` to run the app.

### Code blocks

Triple backticks, optionally with a language for highlighting:

````markdown
```js
const hello = "world";
```
````

```js
const hello = "world";
```

---

## Blockquotes

Prefix each line with `>`:

```markdown
> Quote text
> continued
```

> Quote text
> continued

Nested quotes use `>>`.

---

## Tables

 pipes `|` separate columns, the second row defines alignment:

```markdown
| Name  | Qty | Price |
| ----- | --: | ----: |
| Pen   |   2 |  1.50 |
| Book  |   1 | 12.00 |
```

| Name  | Qty | Price |
| ----- | --: | ----: |
| Pen   |   2 |  1.50 |
| Book  |   1 | 12.00 |

`:---` left, `:---:` center, `---:` right.

---

## Horizontal rule

Three or more dashes (or `***`) on their own line:

```markdown
---
```

---

## Images

Same as links, with a leading `!`:

```markdown
![alt text](image.png)
```

---

## Line breaks & paragraphs

- Blank line = new paragraph.
- End a line with two spaces, or use `\` at line end, for a hard line break.

---

## Escaping

Backslash before a special character prints it literally:

```markdown
\*not italic\*  \# not a heading
```

---

## Full example

````markdown
# Meeting — 2026-10-21

**Attendees:** Anna, Boris

## Agenda

1. Roadmap review
2. Q4 planning

## Notes

- Ship the **beta** by `11-01`
- See [roadmap](Projects/Obsidian%20Clone/Roadmap.md)

> Deadline moved one week earlier.

| Milestone | Date     |
| --------- | -------- |
| Beta      | 2026-11-01 |
| Release   | 2026-12-15 |

## Tasks

- [x] Draft agenda
- [ ] Send invites
````

---

## Quick reference

| Element    | Syntax                    |
| ---------- | ------------------------- |
| Heading    | `# H1` … `###### H6`      |
| Bold       | `**text**`                |
| Italic     | `*text*`                  |
| Strike     | `~~text~~`                |
| Highlight  | `==text==`                |
| Inline code| `` `code` ``              |
| Code block | ` ```lang … ``` `         |
| Link       | `[text](url)`             |
| Image      | `![alt](path)`            |
| Quote      | `> text`                  |
| List       | `- item` / `1. item`      |
| Task       | `- [ ] todo`              |
| Table      | `\| a \| b \|`            |
| Rule       | `---`                    |
