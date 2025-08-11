import Link from "next/link"


export const ButtonWithLink = ({ label, link }: { label: string, link: string }) => {
    return (
        <button className="cursor-pointer rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <Link href={link} >
                {label}
            </Link>
        </button>
    )
}

export const Button = ({ label,type }: { label: string, type?:"button" | "submit" | "reset" }) => {
    return (
        <button type={type} className="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {label}
        </button>
    )
}