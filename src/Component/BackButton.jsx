import React from "react";
import { useNavigate, Link } from "react-router-dom";

import { IoMdArrowRoundBack } from "react-icons/io";

const BackButton = ({ to = -1, label = "Back", className = "" }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();
        if (typeof to === "number") {
            navigate(to);
        }
    };

    // If `to` is a string, use <Link> for navigation
    if (typeof to === "string") {
        return (
            <Link to={to} className={`inline-flex items-center gap-2 hover:underline ${className}`}>
                <IoMdArrowRoundBack size={18} />
                {/* {label} */}
            </Link>
        );
    }

    // If `to` is a number, use button with navigate
    return (
        <button
            onClick={handleClick}
            className={`inline-flex bg-gray-200 hover:scale-105 rounded-full w-6 h-6 justify-center  items-center gap-2 hover:underline ${className}`}
        >
            <IoMdArrowRoundBack size={18} />
            {/* {label} */}
        </button>
    );
};

export default BackButton;
