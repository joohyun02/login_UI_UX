function ErrorText({ message }) {
    if(!message) return null;

    return (
        <p style={{color : "red", fontsize: "12px"}}>
            {message}
        </p>
    );
}

export default ErrorText;