import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    onClick: () => void;
    title?: string;
}

export default function ToolButton({ children, onClick, title }: Props) {
    return (
        <button
            onClick={onClick}
            title={title}
            aria-label={title} // Added for accessibility
            className="tool-btn"
        >
            {children}
        </button>
    );
}