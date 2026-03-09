# **App Name**: Decent Ducks Sanctuary

## Core Features:

- Resident Bird Dashboard: Displays a grid-based overview of all virtual duck residents, each with a primary image and name for quick browsing.
- Detailed Bird Profiles: Individual pages for each duck displaying name, breed, sex, visual lineage (heritage_tree), egg_counter, personality traits, and image_url.
- AI-powered Personality & Lore Generation Tool: Utilizes an AI tool to generate rich, unique personality traits and compelling backstories for each duck, enhancing the emotional connection for virtual adoption.
- Virtual Adoption Trigger: A 'Virtually Adopt' button on each bird's profile that triggers a donation modal linked to your PayPal account.
- Global Donation Access: Dedicated 'Donate to Sanctuary' buttons in the header and footer, linking directly to your specified PayPal account for general sanctuary support.
- Firestore Resident and Gallery Management: Manages the 'residents' Firestore collection, storing duck data including name, breed, sex, visual lineage (heritage_tree), egg_counter, personality traits, and image URLs. Integrates with Firebase Storage for photo galleries.
- Secure Mobile Admin Dashboard: A protected '/admin' route accessible via Firebase Auth, offering mobile-optimized tools for managing bird profiles.
- Firebase Authentication for Admin: Secures the '/admin' route, restricting access to authorized users via Firebase Authentication.
- Egg Counter Quick Actions (Admin): Buttons within the Admin Dashboard to easily increment or decrement a bird's egg_counter on mobile devices.
- Mobile Photo Upload to Gallery (Admin): Allows administrators to snap and upload new photos directly from their phone to a bird's image gallery via Firebase Storage within the Admin Dashboard.
- Health Log Entry (Admin): A simple text input within the Admin Dashboard to add dated health notes to a specific bird's profile.

## Style Guidelines:

- Primary Background: #1A1A1A (Deep Charcoal/Black) for a 'Dark Sanctuary' look, providing a strong, modern base.
- Secondary Sections: #FCF9F2 (Warm Eggshell) for high-contrast cards and content sections, ensuring readability against the dark background.
- Buttons & CTAs: #FFD700 (Duck Yellow) for primary actions, providing a bright, inviting call to action.
- Web3 Accents: #9945FF (Solana Purple) for borders, glows, and hover states, adding a modern, tech-inspired flair.
- Status Indicators: #14F195 (Solana Green) for 'Live' tags and success messages, indicating positive states with a vibrant color.
- Body and headline font: A clean, bold sans-serif like 'Inter' or 'Montserrat', ensuring high readability and a contemporary feel across all content.
- The provided 'Decent Ducks' logo (featuring a black duck character on a yellow circular background with the text 'Decent Ducks') should be used as the primary header logo for the application.
- Use clean, illustrative line-art icons that depict ducks, natural elements (leaves, water), and universal symbols for donation, adoption, and admin actions, maintaining a friendly and cohesive aesthetic.
- Implement a mobile-first, grid-based layout leveraging Tailwind CSS, ensuring responsive and intuitive display of bird profiles and dashboard elements across all screen sizes. Focus on ample spacing and clear content hierarchy.
- Subtle, fluid animations for interactive elements like buttons, modal transitions, and card hovers, enhancing the user experience without distracting from the overall aesthetic.