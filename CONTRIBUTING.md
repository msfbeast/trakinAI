# How to Add New Tools to TrakinAI

The list of tools is stored locally in `lib/data.ts`. This ensures fast loading and easy management.

## Steps to Add a Tool

1.  **Open the Data File**:
    Navigate to `lib/data.ts`.

2.  **Locate the `tools` Array**:
    You will see an array `export const tools: Tool[] = [...]`.

3.  **Add a New Object**:
    Append a new object to the array following this structure:

    ```typescript
    {
      id: 'unique-string-id',
      name: 'Tool Name',
      description: 'A short description of what the tool does.',
      tags: ['Tag1', 'Tag2'], // Used for filtering
      pricing: 'Free' | 'Freemium' | 'Paid',
      platforms: [
        { type: 'web', url: 'https://example.com' },
        { type: 'github', url: 'https://github.com/example/repo' }
      ],
      featured: false // Set to true to show the "Hot" badge
    },
    ```

## About Previews
The **Live Preview** feature in the card automatically looks for a platform with `type: 'web'`. Ensure you include a `web` platform entry if you want the preview window to work.
