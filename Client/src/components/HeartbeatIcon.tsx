interface HeartbeatIconProps {
  size?: number;
  color?: string;
}

const HeartbeatIcon = ({ size = 20, color = "white" }: HeartbeatIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default HeartbeatIcon;
