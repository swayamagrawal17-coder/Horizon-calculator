import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const mark = `<svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" viewBox="0 0 32 32" fill="none">
  <path d="M8 19A8 8 0 0 1 24 19Z" fill="#b23b1e"/>
  <path d="M3.5 19H28.5" stroke="#191b19" stroke-width="3" stroke-linecap="round"/>
</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fcfbf8",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={132}
          height={132}
          alt="Horizon"
          src={`data:image/svg+xml,${encodeURIComponent(mark)}`}
        />
      </div>
    ),
    { ...size },
  );
}
