# Secure identity header and refreshed sign-in

## Summary
Replace the patient-switching control with the authenticated account’s identity, add a reliable header logout action, and refresh the sign-in screen without changing clinical pages or database behavior.

## Implementation
- Fetch the authenticated user’s own profile after session handoff and show only their full name, role, and available profile details in a static header badge.
- Remove the patient dropdown and all switching handlers so no account can select another patient from the interface.
- Add a prominent header **Log Out** control that signs out both the embedded workspace session and the parent application, clears local identity state, and returns to `/login`.
- Restyle `/login` as a centered glass-effect healthcare screen with TechCare AI Health branding, accessible Patient/Doctor selectors, polished fields, focus states, loading/error states, and subtle motion.
- Preserve all existing clinical navigation, forms, panels, saved cases, and current backend connections.

## Technical details
- Extend the existing same-origin session message with the authenticated user ID and role.
- Query `profiles` through the signed-in browser client, relying on existing row-level access rules.
- Keep the iframe’s authenticated client non-persistent and let the parent application remain the source of truth for session redirects.
- Use semantic color tokens for the React login page and keep the embedded workspace’s current visual system intact.

## Validation
- Verify the login screen at desktop and mobile widths.
- Sign in as a test patient and doctor; confirm only the authenticated identity appears and no switcher exists.
- Confirm Log Out returns to `/login` and reopening `/` requires authentication.
- Confirm existing clinical panels and saved-case loading remain available.
