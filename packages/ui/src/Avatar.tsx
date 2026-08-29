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
  useEffect,
  useState,
} from "react";
import { css, cx } from "styled-system/css";
import { avatar, AvatarVariantProps } from "styled-system/recipes";
import { token } from "styled-system/tokens";
import { SystemStyleObject } from "styled-system/types";

/**
 * A djb2-style hash of the name, its low three bytes read as a colour. The
 * same name is always the same colour, and the exact hash is a compatibility
 * contract: apps' existing avatar rosters keep the colours they have always
 * had, so don't change it.
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
 * Contrast rule for the generated background: perceived brightness (the
 * classic 299/587/114 weighting) below 128 counts as dark, and dark
 * backgrounds take white text.
 */
const isLight = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
};

/**
 * First letter of the first and last words. Prefixed because it is exported
 * from the package root, where a bare `initials` would be a broad name to
 * claim.
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
 * The generic person glyph, the fallback when there is no name. It inherits
 * `currentColor` — white on the no-name grey background — so it stays visible
 * if a call site recolours.
 *
 * The paths are Chakra UI's avatar glyph, inlined for visual parity with the
 * apps' original look (see the notice in LICENSE.md).
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

type ImageStatus = "pending" | "loading" | "loaded" | "failed";

/**
 * Load the photo out of band and report how it went, so the avatar can show
 * the initials or the icon meanwhile and keep showing them if it never
 * arrives.
 *
 * The <img> element is only mounted once this says "loaded", which is what
 * keeps a broken URL from leaving the browser's broken-image glyph inside the
 * circle — the failure mode a fallback exists to prevent.
 */
const useImageStatus = (src?: string, srcSet?: string): ImageStatus => {
  const [status, setStatus] = useState<ImageStatus>(
    src ? "loading" : "pending",
  );
  useEffect(() => {
    if (!src) {
      setStatus("pending");
      return;
    }
    // A new src starts again: without this the avatar would keep showing the
    // previous person's photo, or stay stuck on a fallback it has outgrown.
    setStatus("loading");
    const img = new Image();
    let current = true;
    img.onload = () => {
      if (current) {
        setStatus("loaded");
      }
    };
    img.onerror = () => {
      if (current) {
        setStatus("failed");
      }
    };
    // srcSet before src, so the browser has the candidates to choose from
    // when the load starts.
    if (srcSet) {
      img.srcset = srcSet;
    }
    img.src = src;
    return () => {
      current = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, srcSet]);
  return status;
};

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color" | "children">,
    Pick<AvatarVariantProps, "size"> {
  /**
   * The person. Shown as initials, and hashed into the background colour, so
   * two people are unlikely to share one.
   */
  name?: string;
  /**
   * Photo. The initials (or the icon) show until it has loaded, and go on
   * showing if it fails — the avatar never renders a broken image.
   */
  src?: string;
  srcSet?: string;
  /** Shown when there is no name. Defaults to the generic person glyph. */
  icon?: ReactNode;
  /** Accessible name for the icon fallback. Defaults to " avatar". */
  iconLabel?: string;
  /** Override how a name becomes initials. */
  getInitials?: (name: string) => string;
  /** A 2px ring in the avatar's border colour. */
  showBorder?: boolean;
  /** An `AvatarBadge`. */
  children?: ReactNode;
  /** Per-instance style overrides, merged after the recipe. */
  css?: SystemStyleObject;
  className?: string;
}

/**
 * Avatar — a circular identity marker showing a photo, the initials of a
 * name, or a generic glyph, in a colour derived from the name.
 *
 * Decorative in most designs — pass `aria-hidden` where the name is already
 * beside it.
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
  const status = useImageStatus(src, srcSet);
  const isLoaded = status === "loaded";
  const slots = avatar({ size });
  // Only while the image isn't showing.
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
              // The contrast rule, as a variable rather than a state
              // selector so a call site's `css` colour still wins (see the
              // recipe).
              "--avatar-color": isLight(bg)
                ? token("colors.fg.default")
                : token("colors.fg.onEmphasis"),
            } as CSSProperties)
          : style
      }
    >
      {isLoaded ? (
        <img
          src={src}
          srcSet={srcSet}
          alt={name ?? iconLabel}
          className={slots.image}
        />
      ) : name ? (
        <span role="img" aria-label={name} className={slots.label}>
          {getInitials(name)}
        </span>
      ) : // The icon is labelled in place rather than wrapped: a wrapper
      // would make it an inline child with a line box of its own, where
      // directly in the flex container it is a flex item and centres
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
   * Per-instance style overrides. The badge has no size of its own — call
   * sites set one (`boxSize: "1.5em"` scales with the avatar).
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
