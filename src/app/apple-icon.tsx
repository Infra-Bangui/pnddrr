import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          borderRadius: 32,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, background: "#003082" }} />
          <div style={{ flex: 1, background: "#ffffff" }} />
          <div style={{ flex: 1, background: "#289728" }} />
          <div style={{ flex: 1, background: "#FFCE00" }} />
        </div>
        <div
          style={{
            position: "absolute",
            left: "41%",
            top: 0,
            bottom: 0,
            width: "18%",
            background: "#D21034",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 2,
            color: "#FFCE00",
            fontSize: 34,
            lineHeight: 1,
            display: "flex",
          }}
        >
          ★
        </div>
      </div>
    ),
    { ...size }
  );
}
