import Link from "next/link"
import React from "react"

export const ButtonWithLink = ({ label, link }: { label: string, link: string }) => {
    return (
        <Link href={link} className="cursor-pointer rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {label}
        </Link>
    )
}

export const Button = ({ label, type = "button", onClick, disabled }: { label: string, type?: "button" | "submit" | "reset", onClick?: React.MouseEventHandler<HTMLButtonElement>, disabled?: boolean }) => {
    return (
        <button disabled={disabled} onClick={onClick} type={type} className="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {label}
        </button>
    )
}

export const ButtonAnchor = ({ label, href, target = "_self", rel }: { label: string, href: string, target?: "_self" | "_blank" | "_parent" | "_top", rel?: string }) => {
    return (
        <a href={href} target={target} rel={rel} className="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {label}
        </a>
    )
}