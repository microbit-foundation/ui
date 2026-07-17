# @microbit/ui-theme

The micro:bit house styling vocabulary as a Panda CSS preset, layered over
`@microbit/ui`'s core preset (merge it after the core preset in
`panda.config.ts`; see the [@microbit/ui README](../ui/README.md) for the
full stack).

It holds the styling the family's app censuses found in every app rather
than one app's choices: the pill `radii.button`, the `outline*` focus
shadows, Helvetica fonts with a `display` marketing-font slot, the
`language`/`toolbar` button variants, the toast status colours and the
status-bar background.

Brand values here are OSS placeholders (`brand` aliases Chakra blue,
`brand2` Chakra gray). Private brand presets, merged after this one,
override the colour ramps and the `display` font while keeping every token
_name_ stable — see the CSS-variable contract in the `@microbit/ui` README.
