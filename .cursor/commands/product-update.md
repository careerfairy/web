# Product Update Generator

Your job is to generate a Slack-friendly Product Update announcement from a PR number.

## Workflow

1. **Fetch PR Data**

   -  Run: `git fetch origin`
   -  Run: `gh pr view [NUMBER] --json title,body,headRefName,baseRefName,commits,author`
   -  Run: `gh pr diff [NUMBER]`
   -  If commands fail with PAGER errors: `unset PAGER` and retry

2. **Analyze Changes**
   Examine the PR diff and description to understand:

   -  What was built/released (features, improvements, fixes)
   -  User-facing impact (how it affects talent, companies, or internal users)
   -  Key functionality and user flows
   -  Technical improvements (performance, infrastructure)
   -  Metrics/tracking being added
   -  Integration points with other features

3. **Generate Product Update**

   Create a Slack-friendly announcement with this structure:

   **Opening** (choose based on impact):

   -  Major feature: `:rotating_light::rotating_light: @channel :rotating_light::rotating_light:`
   -  Regular update: `:rocket: Product Update`
   -  Bug fix/improvement: `:white_check_mark: Update`

   **Content** (3-6 sentences typically):

   1. **Hook** (1-2 sentences): What was released, make it exciting
   2. **Description** (2-4 sentences): What it does, user benefits, specific flows
   3. **Tracking** (if applicable): Metrics/analytics being captured
   4. **Shoutouts** (if applicable): Credit contributors - "Big shoutout to @Name :emoji:"
   5. **What's Next** (optional): Future iterations, timeline

   **Tone Guidelines:**

   -  Enthusiastic but professional
   -  Clear and concise (avoid technical jargon)
   -  User-focused (benefits over technical details)
   -  Action-oriented (what users can now do)
   -  **Avoid technical specifics**: No dependency versions, library names, or implementation details (e.g., "react-pdf v7", "webpack", "API endpoints")
   -  Focus on the "what" and "why it matters", not the "how"

   **Emoji Usage** (2-4 total, strategically placed):

   -  Attention: `:rotating_light::rotating_light:` (major - use multiple for emphasis!), `:rocket:` (regular)
   -  Feature-specific: `:briefcase:` (jobs), `:video_camera:` (streaming), `:sparkles:` (new)
   -  Celebration: `:tada:`, `:raised_hands:`, `:clinking_glasses:`

## Output Format

Present the Slack message in a markdown code block for easy copying.

**CRITICAL FORMATTING RULES:**

-  Use Slack's native formatting: `*text*` for bold (NOT markdown `**text**`)
-  Plain text with blank lines between paragraphs
-  Emoji codes will render automatically in Slack (e.g., `:rocket:` becomes 🚀)
-  Links as plain URLs

Output structure (wrapped in markdown code block):

```
:emoji: *Title of the update*

First paragraph describing what was shipped and why it's exciting.

Second paragraph with more details about the feature and user benefits.

Third paragraph about impact and what's next (if applicable).

Link: https://www.careerfairy.io/[relevant-page]
```

Example for major feature:

```
:rotating_light::rotating_light: @channel :rotating_light::rotating_light:

*We just shipped reactions to Live Stream chat messages* :tada:

[rest of announcement...]
```

**Note:** Do NOT include PR links in announcements - not all team members have GitHub access. Only include the production careerfairy.io link to the relevant feature/page.

## Examples of Good Opening Lines

-  ":rotating_light::rotating_light: We just launched [Feature Name] :rocket:" (major feature)
-  ":rotating_light::rotating_light: Big news: [Feature Name] is now live in production :tada:" (major feature)
-  "[User Type] can now [action] with our new [Feature Name] :sparkles:"
-  "We've shipped a major improvement to [Area] :white_check_mark:"

## Feature Categories (for context)

-  **Jobs/Applications** `:briefcase:` - easy apply, ATS, job postings
-  **Live Streams** `:video_camera:` - streaming, sessions
-  **Sparks** `:sparkles:` - short-form content
-  **Company Tools** `:building_construction:` - dashboard, analytics
-  **Talent Experience** `:raising_hand:` - profile, search, discovery
-  **Analytics** `:bar_chart:` - metrics, insights, data

## Writing Style

-  **Active voice**: "Companies can now..." not "Companies are able to..."
-  **Present tense**: "This allows..." not "This will allow..."
-  **Specific details**: Include concrete examples and numbers
-  **Benefit-focused**: Start with "what" before "how"
-  Use **bold** for key terms
-  Use line breaks to separate ideas
-  Keep it concise - follow user preferences for brevity

Execute the full workflow automatically and output the Slack-ready product update.
