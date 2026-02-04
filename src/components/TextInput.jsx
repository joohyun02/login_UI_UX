import React from "react";

const errorStyle = { border: "1px solid red"};
const normalStyle = { border: "1px solid #ccc"};

const TextInput = React.forwardRef(
    (
        {
            value,
            onChange,
            placeholder,
            type = "text",
            hasError = false,
        },
        ref
    ) => {
        return (
            <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={hasError ? errorStyle : normalStyle}
            />
        );
    }
);

export default TextInput;