/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { AspectRatio, Icon } from "@microbit/ui";
import { useEffect, useRef, useState } from "react";
import { RiPlayFill } from "react-icons/ri";
import { useIntl } from "react-intl";
import { css } from "styled-system/css";
import { uiPatternsMessage } from "./messages";

export interface YoutubeVideoEmbedProps {
  /** YouTube video id. */
  youtubeId: string;
  /**
   * Video title. Names the play button ("Play video: {title}") and the
   * player iframe.
   */
  title: string;
  /**
   * Alt text for the preview image, for a description beyond the play
   * button's title. Defaults to decorative.
   */
  alt?: string;
}

/**
 * WebKit doesn't carry a tap's user activation into a cross-origin iframe
 * created afterwards, and ignores autoplay=1 without one — so on iOS the
 * facade would cost a second tap, on the loaded player's own play button.
 * iPadOS reports the platform as macOS, hence the touch-points check.
 */
const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iP(hone|ad|od)|Mac/.test(navigator.platform) &&
  navigator.maxTouchPoints > 1;

/**
 * A YouTube video as a click-to-play facade: the video's own preview image
 * (from YouTube's cookieless image CDN) behind a play button, swapped for the
 * privacy-enhanced youtube-nocookie player on activation.
 *
 * The player only exists after a deliberate click, so no YouTube script runs
 * on page load — and, inside a modal, keyboard users aren't tabbed into an
 * embedded document just to get past the video.
 *
 * On iOS the player renders upfront instead — WebKit won't autoplay the
 * swapped-in iframe (see isIOS), so the facade would demand two taps there.
 * If we revisit this we should change the facade UX to a consent interaction.
 */
export const YoutubeVideoEmbed = ({
  youtubeId,
  title,
  alt,
}: YoutubeVideoEmbedProps) => {
  const intl = useIntl();
  const id = encodeURIComponent(youtubeId.trim());
  const [activated, setActivated] = useState(false);
  const showPlayer = activated || isIOS();
  // maxresdefault only exists for videos uploaded in ≥720p; fall back to
  // hqdefault, which YouTube generates for everything.
  const [thumbnail, setThumbnail] = useState<"maxresdefault" | "hqdefault">(
    "maxresdefault",
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (activated) {
      // rAF, not a direct call: Firefox drops a synchronous focus() of a
      // cross-origin iframe made while a UI event is being dispatched.
      const raf = requestAnimationFrame(() => iframeRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
  }, [activated]);
  return (
    <AspectRatio ratio={16 / 9}>
      {showPlayer ? (
        <iframe
          ref={iframeRef}
          title={title}
          // youtube-nocookie avoids the YouTube cookie. rel=0 should limit
          // related videos to our channel. Once we have translated videos
          // we can try e.g. cc_lang_pref=fr but we'll need to check our
          // codes match theirs. autoplay only after a facade activation:
          // the user just pressed play, so the real player shouldn't ask
          // again. The eager iOS player waits for its own play button.
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&cc_load_policy=1${
            activated ? "&autoplay=1" : ""
          }`}
          allow="autoplay; encrypted-media"
          frameBorder="0"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          aria-label={intl.formatMessage(
            uiPatternsMessage("ui-patterns.play-video"),
            { title },
          )}
          onClick={() => setActivated(true)}
          className={css({
            position: "relative",
            display: "block",
            width: "100%",
            height: "100%",
            padding: 0,
            border: "none",
            bg: "black",
            cursor: "pointer",
            outline: "none",
            _focusVisible: { focusRing: "outline" },
            "& img": {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transitionProperty: "filter",
              transitionDuration: "normal",
              _motionReduce: { transition: "none" },
            },
            _hover: { "& img": { filter: "brightness(0.8)" } },
          })}
        >
          <img
            src={`https://i.ytimg.com/vi/${id}/${thumbnail}.jpg`}
            alt={alt ?? ""}
            onError={() => setThumbnail("hqdefault")}
          />
          {/* A solid dark disc behind the glyph, not a drop shadow: the
                glyph has to clear 3:1 against whatever the thumbnail puts
                behind it. Forced-colors strips backgrounds, so there the
                disc is redrawn from the system palette. */}
          <span
            aria-hidden
            className={css({
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "16",
              height: "16",
              borderRadius: "full",
              bg: "blackAlpha.700",
              color: "white",
              fontSize: "4xl",
              _forcedColors: {
                bg: "Canvas",
                color: "ButtonText",
                border: "1px solid",
                borderColor: "ButtonText",
              },
            })}
          >
            <Icon as={RiPlayFill} />
          </span>
        </button>
      )}
    </AspectRatio>
  );
};
