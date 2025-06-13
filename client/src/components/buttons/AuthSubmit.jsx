function AuthSubmit(props) {
    return (
        <div className="mt-5">
            <button
                onClick={props.onClick}
                className="bg-white cursor-pointer hover:bg-white/80 text-black w-sm h-10 rounded font-semibold"
            >
                {props.text}
            </button>
        </div>
    );
}

export default AuthSubmit;
