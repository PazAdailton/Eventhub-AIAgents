# Gemini CLI Skills

This directory contains workspace-specific skills for Gemini CLI.

## How to add a new skill

1. Create a new subdirectory for your skill (e.g., `.gemini/skills/my-skill`).
2. Add a `SKILL.md` file inside that subdirectory.
3. Define the skill's name and description in the YAML frontmatter of `SKILL.md`.

### Example `SKILL.md`

```markdown
---
name: my-skill
description: A description of what this skill does.
---

# Instructions
- Step 1
- Step 2
```

Once created, you can activate the skill by asking Gemini to use it or by its name.
