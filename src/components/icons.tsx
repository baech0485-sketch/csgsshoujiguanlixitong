import type { ReactNode } from "react";

type IconProps = {
  className?: string,
  color?: string,
};

function Icon({ className, color = "currentColor", children }: IconProps & { children: ReactNode }) {
  return (
    <svg className={className} style={{ width: 20, height: 20, fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", flex: "0 0 auto" }} viewBox="0 0 20 20" aria-hidden="true">
      {children}
    </svg>
  );
}

export function DashboardIcon(props: IconProps) { return <Icon {...props}><rect x="3.5" y="3.5" width="5" height="5" rx="1.2" /><rect x="11.5" y="3.5" width="5" height="5" rx="1.2" /><rect x="3.5" y="11.5" width="5" height="5" rx="1.2" /><rect x="11.5" y="11.5" width="5" height="5" rx="1.2" /></Icon>; }
export function DeviceIcon(props: IconProps) { return <Icon {...props}><rect x="5.2" y="2.5" width="9.6" height="15" rx="2.4" /><path d="M8 5.2h4" /><path d="M8.4 14.6h3.2" /></Icon>; }
export function ApprovalIcon(props: IconProps) { return <Icon {...props}><rect x="5.2" y="4.2" width="9.6" height="11.8" rx="2" /><path d="M8 4.2V3.6C8 3 8.45 2.5 9 2.5h2c.55 0 1 .5 1 1.1v.6" /><path d="m7.4 10.2 1.6 1.6 3.6-3.6" /></Icon>; }
export function AssignmentIcon(props: IconProps) { return <Icon {...props}><path d="M4 6.5h7" /><path d="m9 4 3 2.5L9 9" /><path d="M16 13.5H9" /><path d="m11 11-3 2.5 3 2.5" /></Icon>; }
export function RecoveryIcon(props: IconProps) { return <Icon {...props}><path d="M10 4.5v8" /><path d="m7.2 7.3 2.8-2.8 2.8 2.8" /><rect x="4" y="13.2" width="12" height="3.3" rx="1.4" /></Icon>; }
export function IncidentIcon(props: IconProps) { return <Icon {...props}><path d="M10 3.5 16 15.5H4L10 3.5Z" /><path d="M10 7.8v3.5" /><circle cx="10" cy="13.5" r="0.9" fill={props.color || "currentColor"} stroke="none" /></Icon>; }
export function EmployeeIcon(props: IconProps) { return <Icon {...props}><circle cx="10" cy="6.2" r="2.6" /><path d="M4.6 16.2c.7-2.8 2.7-4.4 5.4-4.4s4.7 1.6 5.4 4.4" /></Icon>; }
export function SearchIcon(props: IconProps) { return <Icon {...props}><circle cx="8.4" cy="8.4" r="4.6" /><path d="m11.9 11.9 3.9 3.9" /></Icon>; }
export function RecordsIcon(props: IconProps) { return <Icon {...props}><circle cx="4.6" cy="6" r="0.9" fill={props.color || "currentColor"} stroke="none" /><circle cx="4.6" cy="10" r="0.9" fill={props.color || "currentColor"} stroke="none" /><circle cx="4.6" cy="14" r="0.9" fill={props.color || "currentColor"} stroke="none" /><path d="M7.2 6h8.2" /><path d="M7.2 10h8.2" /><path d="M7.2 14h8.2" /></Icon>; }
export function LockIcon(props: IconProps) { return <Icon {...props}><rect x="5.2" y="8.6" width="9.6" height="7.8" rx="2" /><path d="M7.5 8.6V6.8A2.9 2.9 0 0 1 10.4 4a2.8 2.8 0 0 1 2.8 2.8v1.8" /></Icon>; }
export function CheckIcon(props: IconProps) { return <Icon {...props}><circle cx="10" cy="10" r="6" /><path d="m7 10.3 2.1 2.1 4.1-4.1" /></Icon>; }
export function AddIcon(props: IconProps) { return <Icon {...props}><path d="M10 4.2v11.6" /><path d="M4.2 10h11.6" /></Icon>; }
export function EyeIcon(props: IconProps) { return <Icon {...props}><path d="M2.8 10c1.7-2.8 4.4-4.2 7.2-4.2s5.5 1.4 7.2 4.2c-1.7 2.8-4.4 4.2-7.2 4.2S4.5 12.8 2.8 10Z" /><circle cx="10" cy="10" r="2.2" /></Icon>; }
export function EyeOffIcon(props: IconProps) { return <Icon {...props}><path d="M3.6 3.6 16.4 16.4" /><path d="M2.8 10c1.7-2.8 4.4-4.2 7.2-4.2 1.2 0 2.4.3 3.5.8" /><path d="M17.2 10c-1.7 2.8-4.4 4.2-7.2 4.2-1.2 0-2.4-.3-3.5-.8" /></Icon>; }
