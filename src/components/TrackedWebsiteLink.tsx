"use client";

import type { MouseEvent, ReactNode } from "react";

type TrackedWebsiteLinkProps = {
  href: string;
  vendorName: string;
  source: string;
  sessionId?: string;
  areaKey?: string;
  actorEmail?: string;
  className?: string;
  children: ReactNode;
};

export default function TrackedWebsiteLink({
  href,
  vendorName,
  source,
  sessionId,
  areaKey,
  actorEmail,
  className,
  children,
}: TrackedWebsiteLinkProps) {
  function logClick() {
    const payload = JSON.stringify({
      vendorName,
      website: href,
      source,
      sessionId,
      areaKey,
      actorEmail,
    });

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/public/vendor-website-click", blob);
      return;
    }

    void fetch("/api/public/vendor-website-click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }

  function handleClick(_event: MouseEvent<HTMLAnchorElement>) {
    logClick();
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
