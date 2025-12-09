import React from "react";

const Avatar = () => (
    <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center overflow-hidden border-2 border-[#1C1C21]">
        <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="User"
            className="w-full h-full"
        />
    </div>
);

export default Avatar;
