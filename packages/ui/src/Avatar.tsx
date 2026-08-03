/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  cloneElement,
  CSSProperties,
  HTMLAttributes,
  isValidElement,
  ReactElement,
  ReactNode,
  SVGProps,
  useState,
} from "react";
import { css, cx } from "styled-system/css";
import { avatar, AvatarVariantProps } from "styled-system/recipes";
import { token } from "styled-system/tokens";
import { SystemStyleObject } from "styled-system/types";

/**
 * Chakra's `randomColor({ string })`, reproduced exactly: a djb2-style hash of
 * the name, its low three bytes read as a colour. Not random despite the name
 * — the same name is always the same colour, which is the point, and
 * reproducing the hash means avatars keep the colours they had under Chakra.
 */
const colorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let color = "#";
  for (let j = 0; j < 3; j += 1) {
    const value = (hash >> (j * 8)) & 255;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

/**
 * Chakra's contrast rule for the generated background: perceived brightness
 * (the classic 299/587/114 weighting) below 128 counts as dark, and dark
 * backgrounds take white text.
 */
const isLight = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
};

/**
 * Chakra's `initials`: first letter of the first and last words. Prefixed
 * because it is exported from the package root, where a bare `initials`
 * would be a broad name to claim.
 */
export const avatarInitials = (name: string): string => {
  const names = name.trim().split(" ");
  const firstName = names[0] ?? "";
  const lastName = names.length > 1 ? names[names.length - 1] : "";
  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName.charAt(0);
};

/**
 * Chakra's generic person glyph, the fallback when there is no name. Chakra
 * hardcoded it white; here it inherits `currentColor`, which is the same white
 * on the no-name grey background and stays visible if a call site recolours.
 */
export const GenericAvatarIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 128 128" width="100%" height="100%" {...props}>
    <path
      fill="currentColor"
      d="M103,102.1388 C93.094,111.92 79.3504,118 64.1638,118 C48.8056,118 34.9294,111.768 25,101.7892 L25,95.2 C25,86.8096 31.981,80 40.6,80 L87.4,80 C96.019,80 103,86.8096 103,95.2 L103,102.1388 Z"
    />
    <path
      fill="currentColor"
      d="M63.9961647,24 C51.2938136,24 41,34.2938136 41,46.9961647 C41,59.7061864 51.2938136,70 63.9961647,70 C76.6985159,70 87,59.7061864 87,46.9961647 C87,34.2938136 76.6985159,24 63.9961647,24"
    />
  </svg>
);

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color" | "children">,
    Pick<AvatarVariantProps, "size"> {
  /**
   * The person. Shown as initials, and hashed into the background colour, so
   * two people are unlikely to share one.
   */
  name?: string;
  /** Photo. Falls back to the initials or the icon until it loads. */
  src?: string;
  srcSet?: string;
  /** Shown when there is no name. Defaults to Chakra's person glyph. */
  icon?: ReactNode;
  /** Accessible name for the icon fallback. Chakra's default was " avatar". */
  iconLabel?: string;
  /** Override how a name becomes initials. */
  getInitials?: (name: string) => string;
  /** Chakra's `showBorder`: a 2px ring in the avatar's border colour. */
  showBorder?: boolean;
  /** An `AvatarBadge`. */
  children?: ReactNode;
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * Avatar — Chakra's <Avatar>: a circular identity marker showing a photo, the
 * initials of a name, or a generic glyph, in a colour derived from the name.
 *
 * Decorative in most designs — pass `aria-hidden` where the name is already
 * beside it, as Chakra's call sites did.
 */
export const Avatar = ({
  name,
  src,
  srcSet,
  icon,
  iconLabel = " avatar",
  getInitials = avatarInitials,
  showBorder,
  size,
  children,
  css: cssProp,
  className,
  style,
  ...rest
}: AvatarProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const slots = avatar({ size });
  // Only while the image isn't showing, matching Chakra's `:not([data-loaded])`.
  const bg = name && !isLoaded ? colorFromName(name) : undefined;
  return (
    <span
      {...rest}
      data-loaded={isLoaded || undefined}
      className={cx(
        slots.root,
        showBorder ? css({ borderWidth: "2px" }) : undefined,
        cssProp ? css(cssProp) : undefined,
        className,
      )}
      style={
        bg
          ? ({
              ...style,
              "--avatar-bg": bg,
              // Chakra's contrast rule, as a variable rather than a state
              // selector so a call site's `css` colour still wins (see the
              // recipe).
              "--avatar-color": isLight(bg)
                ? token("colors.gray.800")
                : token("colors.white"),
            } as CSSProperties)
          : style
      }
    >
      {src ? (
        <img
          src={src}
          srcSet={srcSet}
          alt={name ?? iconLabel}
          className={slots.image}
          onLoad={() => setIsLoaded(true)}
        />
      ) : name ? (
        <span role="img" aria-label={name} className={slots.label}>
          {getInitials(name)}
        </span>
      ) : // The icon is labelled in place rather than wrapped, as Chakra did:
      // a wrapper would make it an inline child with a line box of its own,
      // where directly in the flex container it is a flex item and centres
      // exactly.
      isValidElement(icon) ? (
        cloneElement(icon as ReactElement<Record<string, unknown>>, {
          role: "img",
          "aria-label": iconLabel,
        })
      ) : (
        icon ?? <GenericAvatarIcon role="img" aria-label={iconLabel} />
      )}
      {children}
    </span>
  );
};

export interface AvatarBadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color">,
    Pick<AvatarVariantProps, "placement"> {
  children?: ReactNode;
  /**
   * Per-instance style overrides. The badge has no size of its own — Chakra's
   * didn't either, so call sites set one (`boxSize: "1.5em"` scales with the
   * avatar).
   */
  css?: SystemStyleObject;
  className?: string;
}

/** AvatarBadge — a status dot pinned to a corner of its `Avatar`. */
export const AvatarBadge = ({
  placement,
  children,
  css: cssProp,
  className,
  ...rest
}: AvatarBadgeProps) => (
  <div
    {...rest}
    className={cx(
      avatar({ placement }).badge,
      cssProp ? css(cssProp) : undefined,
      className,
    )}
  >
    {children}
  </div>
);
