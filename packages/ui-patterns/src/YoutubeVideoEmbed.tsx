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
 * A YouTube video as a click-to-play facade: the video's own preview image
 * (from YouTube's cookieless image CDN) behind a play button, swapped for the
 * privacy-enhanced youtube-nocookie player on activation.
 *
 * The player only exists after a deliberate click, so no YouTube script runs
 * on page load — and, inside a modal, keyboard users aren't tabbed into an
 * embedded document just to get past the video (which react-aria's focus
 * containment cannot do at all in Firefox: it re-implements Tab as a
 * programmatic focus of the next tabbable element, and Firefox drops a
 * synchronous cross-origin iframe focus made during key event dispatch).
 */
export const YoutubeVideoEmbed = ({
  youtubeId,
  title,
  alt,
}: YoutubeVideoEmbedProps) => {
  const intl = useIntl();
  const id = encodeURIComponent(youtubeId.trim());
  const [playing, setPlaying] = useState(false);
  // maxresdefault only exists for videos uploaded in ≥720p; fall back to
  // hqdefault, which YouTube generates for everything.
  const [thumbnail, setThumbnail] = useState<"maxresdefault" | "hqdefault">(
    "maxresdefault",
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (playing) {
      // rAF, not a direct call: Firefox drops a synchronous focus() of a
      // cross-origin iframe made while a UI event is being dispatched.
      const raf = requestAnimationFrame(() => iframeRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
  }, [playing]);
  return (
    <AspectRatio ratio={16 / 9}>
      {playing ? (
        <iframe
          ref={iframeRef}
          title={title}
          // youtube-nocookie avoids the YouTube cookie. rel=0 should limit
          // related videos to our channel. Once we have translated videos
          // we can try e.g. cc_lang_pref=fr but we'll need to check our
          // codes match theirs. autoplay: the user just pressed play on
          // the facade, so the real player shouldn't ask again.
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&cc_load_policy=1&autoplay=1`}
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
          onClick={() => setPlaying(true)}
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
