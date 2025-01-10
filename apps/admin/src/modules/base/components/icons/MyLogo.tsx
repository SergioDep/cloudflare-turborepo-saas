import { type SvgIconProps } from "@/modules/base/lib/types/react-utils";

export default function MyLogo(props: SvgIconProps) {
  return (
    <svg
      width={1024}
      height={1024}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <path
          d="M603.61 547.99 512 706.66l-45.8-79.33-45.81-79.34-45.8 79.34-45.81 79.33 91.61 158.67L512 1024l91.61-158.67 91.61-158.67-91.61-158.67z"
          style={{
            fill: "#0090f4",
            strokeWidth: 0,
          }}
        />
        <path
          d="M565.96 295.86h183.22l-45.81 79.33-45.8 79.34H840.78l91.61-158.67L1024 137.19H657.57l-91.61 158.67z"
          style={{
            strokeWidth: 0,
            fill: "#6c3",
          }}
        />
        <path
          d="m366.43 454.53-91.61-158.67h183.22l-45.8-79.33-45.81-79.34H0l91.61 158.67 91.61 158.67h183.21z"
          style={{
            fill: "#ff180a",
            strokeWidth: 0,
          }}
        />
      </g>
    </svg>
  );
}
