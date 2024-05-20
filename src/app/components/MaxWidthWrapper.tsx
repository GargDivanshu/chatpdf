import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const MaxWidthWrapper = ({
className,
children,
}: {
    className?: string
    children: ReactNode
}) => {
    return (
        <div className={cn('mx-auto px-2.5 max-w-screen-xl w-full md:px-20', className)}>
            {children}
        </div>
    )
}

export default MaxWidthWrapper;